import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, ExternalLink, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import * as pdfjsLib from 'pdfjs-dist';

interface PDFViewerProps {
  url: string;
  fileName?: string;
  height?: number; // pixels
  className?: string;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({ url, fileName = 'document.pdf', height = 600, className }) => {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [pages, setPages] = useState<number>(0);

  useEffect(() => {
    let revoked = false;
    let objectUrl: string | null = null;

    const fetchPdf = async () => {
      try {
        setLoading(true);
        setError(null);
        const resp = await fetch(url, { cache: 'no-store', mode: 'cors' });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const blob = await resp.blob();
        objectUrl = URL.createObjectURL(blob);
        if (!revoked) setBlobUrl(objectUrl);
      } catch (e: any) {
        console.error('PDF fetch failed:', e);
        setError('Unable to load preview');
      } finally {
        setLoading(false);
      }
    };

    fetchPdf();

    return () => {
      revoked = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [url]);

  // Render PDF with PDF.js to avoid Chromium's built-in viewer restrictions
  useEffect(() => {
    if (!blobUrl) return;
    // Use CDN for PDF.js worker to avoid build issues
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

    let cancelled = false;

    const render = async () => {
      try {
        const loadingTask = pdfjsLib.getDocument(blobUrl);
        const pdf = await loadingTask.promise;
        if (cancelled) return;
        setPages(pdf.numPages);

        const container = containerRef.current;
        if (!container) return;
        container.innerHTML = '';

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          if (cancelled) return;
          const viewport = page.getViewport({ scale: 1.2 });

          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          if (!context) continue;
          canvas.width = viewport.width;
          canvas.height = viewport.height;

          const wrapper = document.createElement('div');
          wrapper.className = 'mb-6 flex justify-center';
          wrapper.appendChild(canvas);
          container.appendChild(wrapper);

          await (page as any).render({ canvasContext: context, viewport, canvas }).promise;
        }
      } catch (e) {
        console.error('PDF.js render failed:', e);
        setError('Unable to load preview');
      }
    };

    render();

    return () => {
      cancelled = true;
    };
  }, [blobUrl]);

  if (loading) {
    return (
      <div className={cn('w-full border border-primary/20 rounded-xl overflow-hidden', className)}>
        <div className="p-4 bg-primary/10 border-b border-primary/20">
          <p className="font-semibold iridescent-text text-center">Resume Preview</p>
        </div>
        <div className="flex items-center justify-center bg-muted/30" style={{ height }}>
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !blobUrl) {
    return (
      <div className={cn('w-full border border-primary/20 rounded-xl overflow-hidden bg-background/30', className)}>
        <div className="p-4 bg-primary/10 border-b border-primary/20">
          <p className="font-semibold iridescent-text text-center">Resume Preview</p>
        </div>
        <div className="p-8 text-center flex flex-col items-center justify-center" style={{ height }}>
          <FileText className="w-12 h-12 text-primary mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">Preview blocked by browser. Open the file instead.</p>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <a href={url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                Open in New Tab
              </a>
            </Button>
            <Button asChild>
              <a href={url} download={fileName} target="_blank" rel="noopener noreferrer">
                Download
              </a>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('w-full border border-primary/20 rounded-xl overflow-hidden bg-background/30 backdrop-blur-sm mt-6', className)}>
      <div className="p-4 bg-primary/10 border-b border-primary/20">
        <p className="font-semibold iridescent-text text-center">Resume Preview</p>
      </div>
      <div
        ref={containerRef}
        className="relative w-full overflow-auto bg-muted/30"
        style={{ height }}
        aria-label={`PDF preview with ${pages} pages`}
      />
    </div>
  );
};
