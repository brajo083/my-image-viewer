import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import DeepZoomViewer from '@/components/DeepZoomViewer';

// Force this page to be dynamically rendered, disabling data caching on Vercel.
export const revalidate = 0;

type ImageViewerPageProps = {
  params: {
    imageId: string;
  };
};

// Fetches image data directly from the database on the server.
const fetchImage = async (id: string) => {
  const image = await prisma.image.findUnique({
    where: { id },
  });
  // If no image is found, this will trigger a 404 page.
  if (!image) {
    notFound();
  }
  return image;
};

// This is the main page component.
const ImageViewerPage = async ({ params }: ImageViewerPageProps) => {
  const image = await fetchImage(params.imageId);

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
            {/* The prop now correctly uses 'image.dziUrl' to match your database schema */}
            <DeepZoomViewer tileSources={image.dziUrl} />
        </div>
    </main>
  );
};

export default ImageViewerPage;

