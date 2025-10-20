import React, { useRef, useEffect } from 'react';

interface WatermarkedImageProps extends React.CanvasHTMLAttributes<HTMLCanvasElement> {
  src: string;
  alt: string;
  watermarkText: string;
}

const WatermarkedImage: React.FC<WatermarkedImageProps> = ({ src, alt, watermarkText, ...props }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    const img = new Image();
    // This is crucial for loading images from Supabase onto the canvas
    img.crossOrigin = "anonymous";

    img.onload = () => {
      // Set canvas size to match the actual image dimensions
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      context.drawImage(img, 0, 0);

      // --- 👇 WATERMARK SETTINGS 👇 ---

      // 1. Style the text
      const fontSize = Math.floor(canvas.width / 35); // Dynamic font size
      context.font = `bold ${fontSize}px Georgia, serif`;
      context.fillStyle = "rgba(255, 255, 255, 0.6)"; // White with 60% opacity

      // 2. Add a shadow for better visibility on any background
      context.shadowColor = "rgba(0, 0, 0, 0.7)";
      context.shadowBlur = 5;
      
      // 3. Position the text
      const padding = fontSize; // Padding from the bottom edge
      context.textAlign = "center"; // Horizontally center
      context.textBaseline = "bottom"; // Align to the bottom

      const x = canvas.width / 2; // Center of the canvas
      const y = canvas.height - padding; // A little up from the bottom edge
      
      // 4. Draw the text
      context.fillText(watermarkText, x, y);
    };
    
    img.onerror = () => {
      console.error("Failed to load image for watermarking. Check URL and CORS policy.");
    };

    img.src = src;

  }, [src, watermarkText]);

  return <canvas ref={canvasRef} {...props} />;
};

export default WatermarkedImage;