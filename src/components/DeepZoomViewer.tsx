"use client";

import { useEffect, useRef } from 'react';
import type OpenSeadragon from 'openseadragon'; // Import the type

// Define the type for the props that this component will accept.
type DeepZoomViewerProps = {
  tileSources: string;
};

const DeepZoomViewer = ({ tileSources }: DeepZoomViewerProps) => {
  const viewerRef = useRef<HTMLDivElement>(null);
  // --- FIX ---
  // Use a ref to store the viewer instance. This ensures that the cleanup
  // function can access the same instance that was created.
  const osdViewerRef = useRef<OpenSeadragon.Viewer | null>(null);

  useEffect(() => {
    // Dynamically import OpenSeadragon only on the client-side.
    import('openseadragon').then((OpenSeadragonModule) => {
      // Use the imported module
      const OpenSeadragon = OpenSeadragonModule.default;
      
      if (viewerRef.current && !osdViewerRef.current) { // Only initialize once
        osdViewerRef.current = OpenSeadragon({
          element: viewerRef.current,
          prefixUrl: 'https://openseadragon.github.io/openseadragon/images/',
          tileSources: tileSources,
          crossOriginPolicy: 'Anonymous',
          imageSmoothingEnabled: false,
          minPixelRatio: 0,
          placeholderFillStyle: 'rgba(242, 242, 242, 1)',
          minZoomImageRatio: 0.1,
          maxZoomLevel: 100,
        });

        osdViewerRef.current.addHandler('open', () => {
          if (osdViewerRef.current && osdViewerRef.current.drawer) {
            const canvas = osdViewerRef.current.drawer.canvas as HTMLCanvasElement;
            if (canvas) {
              canvas.style.imageRendering = 'pixelated';
            }
          }
        });
      }
    });

    // Cleanup function to destroy the viewer when the component unmounts.
    return () => {
      if (osdViewerRef.current) {
        osdViewerRef.current.destroy();
        osdViewerRef.current = null;
      }
    };
  }, [tileSources]); // This dependency array is correct.

  return <div ref={viewerRef} className="h-full w-full"></div>;
};

export default DeepZoomViewer;

