import { useEffect, useRef } from "react";

interface StructureGridProps {
  crumbOpenness: number;
  elasticity: number;
  riseProfile: string;
  size?: number;
}

export default function StructureGrid({
  crumbOpenness,
  elasticity,
  riseProfile,
  size = 200
}: StructureGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Draw the crumb structure visualization on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set canvas dimensions
    canvas.width = size;
    canvas.height = size;

    // Background
    ctx.fillStyle = '#fff8e1'; // Light amber background
    ctx.fillRect(0, 0, size, size);

    // Draw bread outline based on rise profile
    ctx.beginPath();
    ctx.fillStyle = '#f5deb3'; // Wheat color
    
    if (riseProfile === 'Domed') {
      // Domed bread shape
      ctx.moveTo(0, size);
      ctx.lineTo(0, size * 0.4);
      ctx.quadraticCurveTo(size/2, 0, size, size * 0.4);
      ctx.lineTo(size, size);
    } else if (riseProfile === 'Flat') {
      // Flat bread shape
      ctx.moveTo(0, size);
      ctx.lineTo(0, size * 0.3);
      ctx.lineTo(size, size * 0.3);
      ctx.lineTo(size, size);
    } else {
      // Rustic irregular shape
      ctx.moveTo(0, size);
      ctx.lineTo(0, size * 0.45);
      ctx.bezierCurveTo(size * 0.25, size * 0.2, size * 0.75, size * 0.1, size, size * 0.35);
      ctx.lineTo(size, size);
    }
    
    ctx.fill();
    
    // Draw crumb structure
    const bubbleCount = Math.floor(20 + (crumbOpenness / 100) * 60); // 20-80 bubbles based on openness
    const maxBubbleSize = 2 + (crumbOpenness / 100) * 12; // 2-14px bubbles based on openness
    const minBubbleSize = 1 + (crumbOpenness / 100) * 3; // 1-4px min size
    
    // Calculate bubble irregularity based on elasticity
    // Higher elasticity = more irregular bubbles
    const irregularity = elasticity / 100;
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    
    for (let i = 0; i < bubbleCount; i++) {
      // Random position within bread
      const x = Math.random() * size;
      const y = Math.random() * size * 0.7 + size * 0.3;
      
      // Random bubble size constrained by openness
      const baseSize = Math.random() * (maxBubbleSize - minBubbleSize) + minBubbleSize;
      
      // Adjust bubble based on elasticity (more elastic = more stretched bubbles)
      const width = baseSize;
      const height = baseSize * (1 + (irregularity * 0.8)); // Stretch vertically with elasticity
      
      // Make bubbles more random in shape when rustic is selected
      if (riseProfile === 'Rustic') {
        // Create irregular bubbles
        ctx.beginPath();
        ctx.ellipse(
          x, 
          y, 
          width * (Math.random() * 0.5 + 0.75), // Random width variation
          height * (Math.random() * 0.5 + 0.75), // Random height variation
          Math.random() * Math.PI, // Random rotation
          0, 
          Math.PI * 2
        );
        ctx.fill();
      } else {
        // Create normal ellipses for bubbles
        ctx.beginPath();
        ctx.ellipse(x, y, width, height, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    // Draw crust
    ctx.strokeStyle = '#d4a76a'; // Darker bread crust color
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    if (riseProfile === 'Domed') {
      // Domed bread shape
      ctx.moveTo(0, size * 0.4);
      ctx.quadraticCurveTo(size/2, 0, size, size * 0.4);
    } else if (riseProfile === 'Flat') {
      // Flat bread shape
      ctx.moveTo(0, size * 0.3);
      ctx.lineTo(size, size * 0.3);
    } else {
      // Rustic irregular shape
      ctx.moveTo(0, size * 0.45);
      ctx.bezierCurveTo(size * 0.25, size * 0.2, size * 0.75, size * 0.1, size, size * 0.35);
    }
    
    ctx.stroke();
    
  }, [crumbOpenness, elasticity, riseProfile, size]);

  return (
    <div className="border border-amber-200 rounded-md overflow-hidden bg-amber-50 p-1">
      <canvas 
        ref={canvasRef} 
        width={size} 
        height={size} 
        className="w-full h-auto"
        aria-label="Bread structure visualization"
      />
      <div className="text-xs text-center text-amber-700 mt-1">
        {riseProfile} structure with {crumbOpenness > 70 ? 'very open' : 
                                    crumbOpenness > 50 ? 'moderately open' : 'tight'} crumb
      </div>
    </div>
  );
}