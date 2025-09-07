"use client"; // We need client-side interactivity for the collapsible folders.

import { useState, useEffect } from 'react';
import Link from 'next/link';

// Define the shape of the data we expect for each image
type Image = {
  id: string;
  title: string;
  category: string;
  createdAt: string;
};

// Define the shape for our grouped data
type GroupedImages = {
  [category: string]: Image[];
};

export default function HomePage() {
  const [images, setImages] = useState<Image[]>([]);
  const [groupedImages, setGroupedImages] = useState<GroupedImages>({});
  const [isLoading, setIsLoading] = useState(true);
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set());

  // Fetch images when the component mounts
  useEffect(() => {
    const fetchImages = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/images', { cache: 'no-store' });
        if (!response.ok) throw new Error('Failed to fetch images');
        const data: Image[] = await response.json();
        setImages(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchImages();
  }, []);

  // Group images by category whenever the images list changes
  useEffect(() => {
    const groups: GroupedImages = images.reduce((acc, image) => {
      const category = image.category || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(image);
      return acc;
    }, {} as GroupedImages);
    setGroupedImages(groups);
  }, [images]);

  // Function to toggle the visibility of a category's image list
  const toggleCategory = (category: string) => {
    setOpenCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between border-b pb-4">
          <h1 className="text-4xl font-bold text-gray-800">
            Image Library
          </h1>
          <Link href="/upload" className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700">
            Upload New Image
          </Link>
        </div>

        {isLoading ? (
          <p className="text-center text-gray-500">Loading images...</p>
        ) : Object.keys(groupedImages).length > 0 ? (
          <div className="space-y-4">
            {Object.entries(groupedImages).map(([category, images]) => (
              <div key={category} className="rounded-lg border bg-white shadow-sm">
                <button
                  onClick={() => toggleCategory(category)}
                  className="flex w-full items-center justify-between p-4 text-left"
                >
                  <h2 className="text-2xl font-semibold text-gray-700">{category}</h2>
                  <span className={`transform transition-transform duration-200 ${openCategories.has(category) ? 'rotate-180' : 'rotate-0'}`}>
                    &#9660;
                  </span>
                </button>
                {openCategories.has(category) && (
                  <div className="border-t p-4">
                    <div className="space-y-3">
                      {images.map(image => (
                        <Link
                          href={`/view/${image.id}`}
                          key={image.id}
                          className="block rounded-md p-3 transition-colors hover:bg-gray-100"
                        >
                          <h3 className="font-medium text-blue-700">{image.title}</h3>
                          <p className="text-xs text-gray-400">
                            Created on: {new Date(image.createdAt).toLocaleDateString()}
                          </p>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500">
            <p>No images found.</p>
          </div>
        )}
      </div>
    </main>
  );
}

