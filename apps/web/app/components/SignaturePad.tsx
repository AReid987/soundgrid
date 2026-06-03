'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';

interface SignaturePadProps {
  onChange: (signatureData: string | null) => void;
  width?: number;
  height?: number;
  className?: string;
}

export function SignaturePad({
  onChange,
  width = 600,
  height = 200,
  className = '',
}: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasContent, setHasContent] = useState(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);

  // Set up canvas context
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set up canvas for high DPI displays
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    // Scale context for high DPI
    ctx.scale(dpr, dpr);

    // Set up drawing style
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Clear canvas
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, width, height);
  }, [width, height]);

  const getCoordinates = (
    e: React.MouseEvent | React.TouchEvent
  ): { x: number; y: number } => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();

    if ('touches' in e) {
      // Touch event
      const touch = e.touches[0] || e.changedTouches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    } else {
      // Mouse event
      return {
        x: (e as React.MouseEvent).clientX - rect.left,
        y: (e as React.MouseEvent).clientY - rect.top,
      };
    }
  };

  const startDrawing = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      setIsDrawing(true);

      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const { x, y } = getCoordinates(e);
      lastPoint.current = { x, y };

      // Draw a single dot if it's just a click
      ctx.beginPath();
      ctx.arc(x, y, 1, 0, Math.PI * 2);
      ctx.fillStyle = '#000';
      ctx.fill();
    },
    []
  );

  const draw = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      if (!isDrawing) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const { x, y } = getCoordinates(e);
      const last = lastPoint.current;

      if (last) {
        // Draw quadratic curve for smoother lines
        const midX = (last.x + x) / 2;
        const midY = (last.y + y) / 2;

        ctx.beginPath();
        ctx.moveTo(last.x, last.y);
        ctx.quadraticCurveTo(midX, midY, x, y);
        ctx.stroke();
      }

      lastPoint.current = { x, y };
      setHasContent(true);
    },
    [isDrawing]
  );

  const stopDrawing = useCallback(() => {
    if (!isDrawing) return;

    setIsDrawing(false);
    lastPoint.current = null;

    // Export signature data
    const canvas = canvasRef.current;
    if (canvas && hasContent) {
      const dataUrl = canvas.toDataURL('image/png');
      onChange(dataUrl);
    }
  }, [isDrawing, hasContent, onChange]);

  const clear = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, width, height);

    setHasContent(false);
    onChange(null);
  }, [width, onChange]);

  // Handle touch events properly
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Prevent scrolling when drawing
    const preventScroll = (e: TouchEvent) => {
      if (isDrawing) {
        e.preventDefault();
      }
    };

    canvas.addEventListener('touchmove', preventScroll, { passive: false });

    return () => {
      canvas.removeEventListener('touchmove', preventScroll);
    };
  }, [isDrawing]);

  return (
    <div className={`signature-pad ${className}`}>
      <div
        className="relative border-2 border-gray-300 rounded-lg bg-white cursor-crosshair touch-none overflow-hidden"
        style={{ width, height }}
      >
        {/* Background pattern */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(to right, #ccc 1px, transparent 1px),
              linear-gradient(to bottom, #ccc 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px',
          }}
        />

        {/* Label */}
        {!hasContent && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-gray-400 text-sm select-none">
              Sign here
            </span>
          </div>
        )}

        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="relative z-10"
          style={{ width, height }}
        />
      </div>

      {/* Controls */}
      <div className="flex justify-between items-center mt-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={clear}
          className="text-red-600 hover:text-red-700"
        >
          Clear
        </Button>

        {hasContent && (
          <span className="text-sm text-green-600">
            ✓ Signature captured
          </span>
        )}
      </div>

      {/* Instructions */}
      <p className="text-xs text-gray-500 mt-2">
        Use your mouse or finger to sign above. By signing, you agree to be legally bound by this document.
      </p>
    </div>
  );
}

export default SignaturePad;
