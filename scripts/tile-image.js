const { exec } = require('child_process');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { PrismaClient } = require('@prisma/client');
const fs = require('fs').promises;
const path = require('path');

// Initialize Prisma and S3 clients using credentials from your .env file
const prisma = new PrismaClient();
const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;

// Helper function to recursively find all files in a directory
async function getFiles(dir) {
  const dirents = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    dirents.map((dirent) => {
      const res = path.resolve(dir, dirent.name);
      return dirent.isDirectory() ? getFiles(res) : res;
    })
  );
  return Array.prototype.concat(...files);
}

// Main function to process and upload the image
async function processAndUploadImage(imagePath, imageId, title, description) {
  // Create a unique temporary directory for the tiling output
  const tempOutputDir = `temp_dzi_${imageId}`;
  
  try {
    console.log(`Step 1: Tiling image with vips: ${imagePath}`);
    
    // Use the vips CLI to tile the image into a temporary directory
    await new Promise((resolve, reject) => {
      const command = `vips dzsave "${imagePath}" "${tempOutputDir}" --layout dz --suffix .png`;
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error(`VIPS Tiling Error: ${stderr}`);
          return reject(new Error(`Failed to tile image with vips. Make sure vips is installed and in your system's PATH.`));
        }
        console.log(`VIPS Tiling Output: ${stdout}`);
        resolve();
      });
    });
    console.log('Tiling complete.');

    const dziFilePath = `${tempOutputDir}.dzi`;
    const filesDir = `${tempOutputDir}_files`;

    // Upload the DZI descriptor file (.dzi)
    const dziS3Key = `dzi/${imageId}.dzi`;
    console.log(`Step 2: Uploading ${dziFilePath} to s3://${BUCKET_NAME}/${dziS3Key}`);
    const dziFileContent = await fs.readFile(dziFilePath);
    await s3Client.send(new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: dziS3Key,
      Body: dziFileContent,
      ContentType: 'application/xml' // Set correct content type
    }));
    console.log('DZI descriptor uploaded.');

    // Recursively find and upload all tile files
    const allTilePaths = await getFiles(filesDir);
    console.log(`Step 3: Found ${allTilePaths.length} tiles to upload.`);

    for (const tilePath of allTilePaths) {
      const s3Key = `dzi/${imageId}_files${tilePath.split(filesDir)[1].replace(/\\/g, '/')}`;
      const tileContent = await fs.readFile(tilePath);
      
      await s3Client.send(new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: s3Key,
        Body: tileContent,
        ContentType: 'image/png' // Set correct content type
      }));
    }
    console.log('All tiles uploaded successfully.');

    // Construct the public S3 URL for the .dzi file
    const s3Url = `https://${BUCKET_NAME}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${dziS3Key}`;
    
    console.log(`Step 4: Updating database with URL: ${s3Url}`);

    // Add or update the image record in the database
    // --- FIX ---
    // Changed 'dziPath' to 'dziUrl' to match the Prisma schema.
    const image = await prisma.image.upsert({
      where: { id: imageId },
      update: { dziUrl: s3Url, title, description },
      create: {
        id: imageId,
        title,
        description,
        category: 'Flowchart', // Default category
        dziUrl: s3Url,
      },
    });
    console.log('Database updated successfully:', image);

  } catch (error) {
    console.error('An error occurred during the process:', error);
  } finally {
    // Clean up the local temporary files
    console.log('Step 5: Cleaning up local temporary files.');
    await fs.rm(tempOutputDir + '.dzi', { force: true });
    await fs.rm(tempOutputDir + '_files', { recursive: true, force: true });
    await prisma.$disconnect();
    console.log('Cleanup complete. Process finished.');
  }
}

// --- Script Execution ---
const args = process.argv.slice(2);
if (args.length < 4) {
  console.error('Usage: node scripts/tile-image.js <path_to_image> <unique_id> <"Title"> <"Description">');
  process.exit(1);
}

const [imagePath, imageId, title, description] = args;
processAndUploadImage(imagePath, imageId, title, description);

