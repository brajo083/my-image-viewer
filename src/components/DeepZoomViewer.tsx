"use client";

import { useEffect, useRef } from 'react';
import type OpenSeadragon from 'openseadragon'; // Import the type

// Define the type for the props that this component will accept.
type DeepZoomViewerProps = {
  tileSources: string;
};

const DeepZoomViewer = ({ tileSources }: DeepZoomViewerProps) => {
  const viewerRef = useRef<HTMLDivElement>(null);
  // Use a ref to store the viewer instance to prevent re-rendering loops.
  const osdViewerRef = useRef<OpenSeadragon.Viewer | null>(null);

  useEffect(() => {
    // Dynamically import OpenSeadragon only on the client-side.
    import('openseadragon').then((OpenSeadragonModule) => {
      const OpenSeadragon = OpenSeadragonModule.default;
      
      if (viewerRef.current && !osdViewerRef.current) { // Only initialize once
        osdViewerRef.current = OpenSeadragon({
          element: viewerRef.current,
          prefixUrl: 'https://openseadragon.github.io/openseadragon/images/',
          tileSources: tileSources,
          
          // --- STABILITY & QUALITY FIXES ---
          // @ts-expect-error - This is a valid option, but the type definition is outdated.
          drawer: 'canvas', // Use the canvas renderer for better PNG transparency support
          crossOriginPolicy: 'Anonymous',   // Fixes S3 permissions for WebGL
          imageSmoothingEnabled: false,       // Fixes seams between tiles
          minPixelRatio: 0,                   // Prioritizes sharpness
          placeholderFillStyle: 'rgba(242, 242, 242, 1)',
          minZoomImageRatio: 0.1,
          maxZoomLevel: 100,
        });

        osdViewerRef.current.addHandler('open', () => {
          if (osdViewerRef.current && osdViewerRef.current.drawer) {
            const canvas = osdViewerRef.current.drawer.canvas as HTMLCanvasElement;
            if (canvas) {
              // More forceful fix for tile seams/gaps
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
  }, [tileSources]);

  return <div ref={viewerRef} className="h-full w-full"></div>;
};

export default DeepZoomViewer;

