import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';

// Initialize the S3 client
const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// Function to generate a random hex string for a unique filename
const randomBytes = (bytes = 32) => crypto.randomBytes(bytes).toString('hex');

export async function POST(request: Request) {
  try {
    const { filename, contentType } = await request.json();

    if (!filename || !contentType) {
      return NextResponse.json({ error: 'Filename and content type are required' }, { status: 400 });
    }
    
    // Create a unique key for the S3 object
    const key = `uploads/${randomBytes(16)}-${filename}`;

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: key,
      ContentType: contentType,
    });

    const presignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 300, // URL expires in 5 minutes
    });

    return NextResponse.json({ presignedUrl, key });

  } catch (error) {
    console.error('Error creating presigned URL:', error);
    return NextResponse.json({ error: 'Failed to create presigned URL' }, { status: 500 });
  }
}
