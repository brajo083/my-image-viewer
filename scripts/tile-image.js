// This script uses the 'sharp' library to convert a large image file
// into a Deep Zoom Image (DZI) pyramid, which consists of a .dzi metadata
// file and a folder of image tiles.

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// --- CONFIGURATION ---
// Get the input image path from the command line arguments.
// Example: node scripts/tile-image.js "C:\path\to\my\large-image.tif"
const inputFile = process.argv[2];

// Check if an input file was provided.
if (!inputFile) {
  console.error('Error: Please provide the path to the input image.');
  console.error('Usage: node scripts/tile-image.js "<path-to-your-image>"');
  process.exit(1);
}

// Create a name for the output files based on the input filename.
// For example, 'large-image.tif' will become 'large-image'.
const outputName = path.basename(inputFile, path.extname(inputFile));

// Define the output directory. Tiles will be saved in 'public/images/dzi/'.
// The final output will be in a subfolder named after the image.
const outputDir = path.join(process.cwd(), 'public', 'images', 'dzi', outputName);

// --- SCRIPT EXECUTION ---
async function tileImage() {
  try {
    console.log(`Starting tiling process for: ${inputFile}`);

    // Ensure the output directory and its subdirectories exist.
    // The dzi output from sharp requires a '{name}_files' directory.
    const tileDir = path.join(outputDir, `${outputName}_files`);
    fs.mkdirSync(tileDir, { recursive: true });
    console.log(`Created output directory: ${outputDir}`);

    // Use sharp to perform the tiling operation.
    // --- UPDATE ---
    // Added { sequentialRead: true } to use a more robust reading method for complex TIFFs.
    await sharp(inputFile, { limitInputPixels: false, sequentialRead: true })
      .tile({
        size: 512,      // The size of each tile, e.g., 512x512 pixels.
        layout: 'dz',   // Use the Deep Zoom Image layout.
      })
      .toFile(path.join(outputDir, `${outputName}.dzi`));

    console.log('✅ Tiling process completed successfully!');
    console.log(`   - DZI metadata file: ${path.join(outputDir, `${outputName}.dzi`)}`);
    console.log(`   - Image tiles folder: ${tileDir}`);

  } catch (err) {
    console.error('Error during tiling process:', err);
  }
}

// Run the tiling function.
tileImage();

