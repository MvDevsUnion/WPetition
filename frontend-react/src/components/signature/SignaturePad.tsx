import { useRef, useImperativeHandle, forwardRef } from "react";
import SignatureCanvas from "react-signature-canvas";

export interface SignaturePadRef {
  clear: () => void;
  isEmpty: () => boolean;
  toSVG: () => string | null;
}

interface SignaturePadProps {
  onBegin?: () => void;
  onEnd?: () => void;
}

export const SignaturePad = forwardRef<SignaturePadRef, SignaturePadProps>(
  ({ onBegin, onEnd }, ref) => {
    const sigCanvasRef = useRef<SignatureCanvas>(null);

    useImperativeHandle(ref, () => ({
      clear: () => {
        sigCanvasRef.current?.clear();
      },
      isEmpty: () => {
        return sigCanvasRef.current?.isEmpty() ?? true;
      },
      toSVG: () => {
        if (!sigCanvasRef.current || sigCanvasRef.current.isEmpty()) {
          return null;
        }

        // Get the raw data points from signature canvas
        const data = sigCanvasRef.current.toData();
        if (!data || data.length === 0) {
          return null;
        }

        // Convert to SVG path
        let pathData = "";
        for (const stroke of data) {
          const points = stroke as unknown as { x: number; y: number }[];
          if (points && points.length > 0) {
            pathData += `M ${points[0].x} ${points[0].y} `;
            for (let i = 1; i < points.length; i++) {
              pathData += `L ${points[i].x} ${points[i].y} `;
            }
          }
        }

        const canvas = sigCanvasRef.current.getCanvas();
        const width = canvas.width;
        const height = canvas.height;

        return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg"><path d="${pathData}" stroke="black" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
      },
    }));

    return (
      <div className="signature-pad-container">
        <SignatureCanvas
          ref={sigCanvasRef}
          penColor="black"
          canvasProps={{
            className: "w-full",
            style: { aspectRatio: "3", height: "auto" },
          }}
          onBegin={onBegin}
          onEnd={onEnd}
        />
      </div>
    );
  },
);

SignaturePad.displayName = "SignaturePad";
