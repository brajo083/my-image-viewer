import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/images
 * Fetches all images. Can be filtered by a 'category' query parameter.
 * Example: /api/images?category=Kidney+Biopsy
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');

  try {
    const whereClause = category ? { category: category } : {};
    const images = await prisma.image.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc', // Show the newest images first
      },
    });
    return NextResponse.json(images);
  } catch (error) {
    console.error('Error fetching images:', error);
    return NextResponse.json(
      { error: 'Failed to fetch images' },
      { status: 500 }
    );
  }
}
