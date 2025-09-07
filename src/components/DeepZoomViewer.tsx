"use client";

import { useEffect, useRef } from 'react';

type DeepZoomViewerProps = {
  url: string;
};

const DeepZoomViewer = ({ url }: DeepZoomViewerProps) => {
  const viewerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let viewer: OpenSeadragon.Viewer | undefined;

    // DEBUG: Log the URL being loaded
    console.log('Loading DZI from URL:', url);

    import('openseadragon').then((OpenSeadragon) => {
      if (viewerRef.current && url) {
        viewer = OpenSeadragon.default({
          element: viewerRef.current,
          prefixUrl: 'https://openseadragon.github.io/openseadragon/images/',
          crossOriginPolicy: 'Anonymous',
          imageSmoothingEnabled: false,
          minPixelRatio: 0,
          placeholderFillStyle: 'rgba(242, 242, 242, 1)',
          minZoomImageRatio: 0.1,
          maxZoomLevel: 100,
          tileSources: url,
        });

        // DEBUG: Add error handling
        viewer.addHandler('open-failed', (event) => {
          console.error('Failed to open image:', event);
        });

        viewer.addHandler('tile-load-failed', (event) => {
          console.error('Failed to load tile:', event.tile);
        });

        viewer.addHandler('open', () => {
          console.log('Image opened successfully');
          if (viewer && viewer.drawer) {
            const canvas = viewer.drawer.canvas as HTMLCanvasElement;
            if (canvas) {
              canvas.style.imageRendering = 'pixelated';
            }
          }
        });
      }
    });

    return () => {
      if (viewer) {
        viewer.destroy();
      }
    };
  }, [url]);

  return <div ref={viewerRef} className="h-full w-full"></div>;
};

export default DeepZoomViewer;