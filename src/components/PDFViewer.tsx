import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Button } from '@/components/ui/button';
import { FileText, ExternalLink, Download, Loader2, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import { cn } from '@/lib/utils';

// CRITICAL: Configure PDF.js worker from CDN
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PDFViewerProps {
  url: string;
  fileName?: string;
  height?: number;
  className?: string;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({ 
  url, 
  fileName = 'document.pdf', 
  height = 600, 
  className 
}) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Add timeout to prevent infinite loading
  React.useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        console.error('PDF loading timeout - taking too long');
        setError('PDF loading timed out. Try downloading instead.');
        setLoading(false);
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeout);
  }, [loading]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setLoading(false);
    setError(null);
    console.log('PDF loaded successfully:', numPages, 'pages');
  }

  function onDocumentLoadError(error: Error) {
    console.error('PDF load error:', error);
    setError(error.message || 'Failed to load PDF');
    setLoading(false);
  }

  const handleDownload = async () => {
    try {
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      link.rel = 'noopener';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  const handleOpenNewTab = () => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <div className={cn('w-full border border-primary/20 rounded-xl overflow-hidden bg-background/30', className)}>
        <div className="p-4 bg-primary/10 border-b border-primary/20">
          <p className="font-semibold iridescent-text text-center">Resume Preview</p>
        </div>
        <div className="flex flex-col items-center justify-center bg-muted/30 gap-4" style={{ height }}>
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-muted-foreground text-sm">Loading PDF...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('w-full border border-primary/20 rounded-xl overflow-hidden bg-background/30', className)}>
        <div className="p-4 bg-primary/10 border-b border-primary/20">
          <p className="font-semibold iridescent-text text-center">Resume Preview</p>
        </div>
        <div className="p-8 text-center flex flex-col items-center justify-center bg-muted/30" style={{ height }}>
          <FileText className="w-12 h-12 text-primary mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">{error}</p>
          <p className="text-sm text-muted-foreground mb-4">Try downloading or opening in a new tab instead.</p>
          <div className="flex gap-2">
            <Button onClick={handleOpenNewTab} variant="outline">
              <ExternalLink className="w-4 h-4 mr-2" />
              Open in New Tab
            </Button>
            <Button onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('w-full border border-primary/20 rounded-xl overflow-hidden bg-background/30 backdrop-blur-sm', className)}>
      {/* Header with Controls */}
      <div className="p-4 bg-primary/10 border-b border-primary/20 flex items-center justify-between flex-wrap gap-3">
        <p className="font-semibold iridescent-text">Resume Preview</p>
        
        <div className="flex items-center gap-3 flex-wrap">
          {/* Zoom Controls */}
          <div className="flex items-center gap-2 bg-background/50 rounded-lg p-1">
            <Button
              onClick={() => setScale(s => Math.max(0.5, s - 0.1))}
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              title="Zoom Out"
            >
              <ZoomOut className="w-3 h-3" />
            </Button>
            <span className="text-xs font-medium w-12 text-center">{Math.round(scale * 100)}%</span>
            <Button
              onClick={() => setScale(s => Math.min(2, s + 0.1))}
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              title="Zoom In"
            >
              <ZoomIn className="w-3 h-3" />
            </Button>
          </div>

          {/* Action Buttons */}
          <Button onClick={handleOpenNewTab} variant="outline" size="sm">
            <ExternalLink className="w-3 h-3 mr-1" />
            <span className="hidden sm:inline">Open</span>
          </Button>
          <Button onClick={handleDownload} size="sm">
            <Download className="w-3 h-3 mr-1" />
            <span className="hidden sm:inline">Download</span>
          </Button>
        </div>
      </div>

      {/* PDF Viewer */}
      <div 
        className="relative w-full overflow-auto bg-muted/30 flex flex-col items-center p-6"
        style={{ height }}
      >
        <Document
          file={url}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={
            <div className="flex flex-col items-center justify-center h-full">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="mt-4 text-muted-foreground text-sm">Loading PDF...</p>
            </div>
          }
          options={{
            cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
            cMapPacked: true,
            standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/standard_fonts`,
            isEvalSupported: false,
            disableStream: false,
            disableAutoFetch: false,
          }}
        >
          <Page
            pageNumber={pageNumber}
            scale={scale}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            className="shadow-lg mb-4"
          />
        </Document>

        {/* Page Navigation */}
        {numPages > 1 && (
          <div className="mt-4 flex items-center gap-4 bg-background/80 backdrop-blur-sm px-6 py-3 rounded-lg shadow-lg border border-primary/20">
            <Button
              onClick={() => setPageNumber(p => Math.max(1, p - 1))}
              disabled={pageNumber <= 1}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <span className="text-sm font-medium whitespace-nowrap">
              Page {pageNumber} of {numPages}
            </span>
            
            <Button
              onClick={() => setPageNumber(p => Math.min(numPages, p + 1))}
              disabled={pageNumber >= numPages}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
