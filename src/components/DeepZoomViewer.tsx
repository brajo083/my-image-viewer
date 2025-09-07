"use client";

import { useEffect, useRef } from 'react';

// Define the type for the props that this component will accept.
// It now needs to know the type of image and the corresponding URL.
type DeepZoomViewerProps = {
  imageType: 'DZI' | 'SIMPLE';
  url: string;
};

const DeepZoomViewer = ({ imageType, url }: DeepZoomViewerProps) => {
  const viewerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let viewer: OpenSeadragon.Viewer | undefined;

    // Dynamically import OpenSeadragon only on the client-side.
    import('openseadragon').then((OpenSeadragon) => {
      if (viewerRef.current && url) {
        
        let tileSources;
        if (imageType === 'SIMPLE') {
          // If it's a simple image, we create a specific tile source object.
          tileSources = {
            type: 'image',
            url: url,
          };
        } else {
          // If it's a DZI image, the URL is the tile source itself.
          tileSources = url;
        }

        viewer = OpenSeadragon.default({
          element: viewerRef.current,
          prefixUrl: 'https://openseadragon.github.io/openseadragon/images/',
          crossOriginPolicy: 'Anonymous',
          imageSmoothingEnabled: false,
          minPixelRatio: 0,
          placeholderFillStyle: 'rgba(242, 242, 242, 1)',
          minZoomImageRatio: 0.1,
          maxZoomLevel: 100,
          tileSources: tileSources, // Use the dynamically determined tile source
        });

        viewer.addHandler('open', () => {
          if (viewer && viewer.drawer) {
            const canvas = viewer.drawer.canvas as HTMLCanvasElement;
            if (canvas) {
              canvas.style.imageRendering = 'pixelated';
            }
          }
        });
      }
    });

    // Cleanup function to destroy the viewer when the component unmounts.
    return () => {
      if (viewer) {
        viewer.destroy();
      }
    };
  }, [imageType, url]); // Re-run effect if the image type or URL changes.

  return <div ref={viewerRef} className="h-full w-full"></div>;
};

export default DeepZoomViewer;

