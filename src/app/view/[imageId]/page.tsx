import DeepZoomViewer from '@/components/DeepZoomViewer';
import Link from 'next/link';

export const runtime = 'nodejs';

type Image = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  dziUrl: string | null;
};

async function getImageData(imageId: string): Promise<Image | null> {
  try {
    const response = await fetch(`http://localhost:3000/api/images/${imageId}`, {
      cache: 'no-store',
    });
    if (!response.ok) return null;
    return response.json();
  } catch (error) {
    console.error('Failed to fetch image data:', error);
    return null;
  }
}

export default async function ViewPage({
  params,
}: {
  params: Promise<{ imageId: string }>;
}) {
  const { imageId } = await params;
  const image = await getImageData(imageId);

  if (!image || !image.dziUrl) {
    return (
      <main className="flex h-screen w-screen items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Error</h1>
          <p className="text-gray-700">Image not found or failed to load.</p>
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
        <DeepZoomViewer url={image.dziUrl} />
      </div>
    </main>
  );
}