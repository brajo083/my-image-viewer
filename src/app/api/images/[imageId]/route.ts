import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// By exporting this constant, we ensure this route always runs on the Node.js runtime,
// which is fully compatible with Prisma and prevents the params-related error.
export const runtime = 'nodejs';

/**
 * GET /api/images/[imageId]
 * Fetches a single image by its unique ID.
 */
export async function GET(
  request: Request,
  { params }: { params: { imageId: string } }
) {
  const { imageId } = params;

  if (!imageId) {
    return NextResponse.json({ error: 'Image ID is required' }, { status: 400 });
  }

  try {
    const image = await prisma.image.findUnique({
      where: {
        id: imageId,
      },
    });

    if (!image) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    return NextResponse.json(image);
  } catch (error) {
    console.error(`Error fetching image ${imageId}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch image' },
      { status: 500 }
    );
  }
}

