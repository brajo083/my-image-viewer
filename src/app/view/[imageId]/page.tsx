import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import DeepZoomViewer from '@/components/DeepZoomViewer';

// Force this page to be dynamically rendered, disabling Vercel's data cache.
export const revalidate = 0;

type ImageViewerPageProps = {
  params: {
    imageId: string;
  };
};

// This function fetches data directly from the database on the server.
const fetchImage = async (id: string) => {
  console.log(`[Vercel Log] Attempting to fetch image with ID: ${id}`);
  try {
    const image = await prisma.image.findUnique({
      where: { id },
    });
    
    if (!image) {
      console.error(`[Vercel Log] Image with ID: ${id} NOT FOUND in database.`);
      notFound();
    }
    
    console.log(`[Vercel Log] Successfully fetched image data.`);
    return image;
  } catch (error) {
    console.error(`[Vercel Log] CRITICAL: Prisma failed to connect or fetch data for ID: ${id}. Error:`, error);
    // This will trigger a 404 page if there's a database error
    notFound();
  }
};

// This is the main page component.
const ImageViewerPage = async ({ params }: ImageViewerPageProps) => {
  const image = await fetchImage(params.imageId);

  // If for any reason the image has no URL, display an error.
  if (!image.dziUrl) {
    return (
      <main className="flex h-screen w-screen items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Error</h1>
          <p className="text-gray-700">Image data is incomplete (dziUrl is missing).</p>
        </div>
      </main>
    );
  }

  return (
    <main className="relative h-screen w-screen bg-white">
      <div className="absolute bottom-4 left-4 z-10 rounded-lg bg-white bg-opacity-80 p-3 shadow-md">
        <h1 className="text-xl font-bold text-gray-900">{image.title}</h1>
        <p className="text-sm text-gray-600">{image.category}</p>
        <Link href="/" className="mt-2 inline-block text-sm text-blue-600 hover:underline">
            &larr; Back to Gallery
        </Link>
      </div>
      <div className="relative z-0 h-full w-full border-2 border-gray-300">
        <DeepZoomViewer tileSources={image.dziUrl} />
      </div>
    </main>
  );
};

export default ImageViewerPage;

