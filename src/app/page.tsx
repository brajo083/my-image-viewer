"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';

type Image = {
  id: string;
  title: string;
  description: string | null;
};

const HomePage = () => {
  const [images, setImages] = useState<Image[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchImages = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/images');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setImages(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(`Failed to fetch images: ${err.message}`);
        } else {
          setError('An unknown error occurred.');
        }
        console.error("Error fetching images:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchImages();
  }, []);

  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="mb-8 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800">Image Viewer Gallery</h1>
        <p className="text-lg text-gray-600 mt-2">Browse the collection of high-resolution images.</p>
      </header>

      <main>
        {isLoading && <p className="text-center text-gray-500">Loading images...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}
        
        {!isLoading && !error && images.length === 0 && (
          <p className="text-center text-gray-500">No images found.</p>
        )}

        {!isLoading && !error && images.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {images.map((image) => (
              <Link key={image.id} href={`/view/${image.id}`} passHref>
                <div className="block border rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 ease-in-out cursor-pointer h-full">
                  <div className="p-6">
                    <h2 className="text-2xl font-semibold text-gray-700 truncate">{image.title}</h2>
                    <p className="text-gray-600 mt-2 text-base h-24 overflow-hidden overflow-ellipsis">{image.description || 'No description available.'}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default HomePage;

