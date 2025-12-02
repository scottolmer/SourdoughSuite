import { useEffect, useRef } from "react";

interface RadarChartProps {
  data: {
    sourness: number;
    sweetness: number;
    complexity: number;
    strength: number;
    richness: number;
  };
  size?: number;
}

export default function FlavorRadarChart({ data, size = 300 }: RadarChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const center = 50;
    const normalizedData = {
      sourness: (data.sourness / 100) * 40,
      sweetness: (data.sweetness / 100) * 40,
      complexity: (data.complexity / 100) * 40,
      strength: (data.strength / 100) * 40,
      richness: (data.richness || data.complexity) / 100 * 40, // use complexity as fallback if richness not provided
    };

    // Calculate pentagon points for data visualization
    const getPointCoordinates = (value: number, angleIndex: number) => {
      const angle = angleIndex * (2 * Math.PI / 5) - Math.PI / 2; // Start at top (negative PI/2)
      const x = center + value * Math.cos(angle);
      const y = center + value * Math.sin(angle);
      return { x, y };
    };

    const p1 = getPointCoordinates(normalizedData.sourness, 0);
    const p2 = getPointCoordinates(normalizedData.sweetness, 1);
    const p3 = getPointCoordinates(normalizedData.strength, 2);
    const p4 = getPointCoordinates(normalizedData.complexity, 3);
    const p5 = getPointCoordinates(normalizedData.richness, 4);

    const dataPath = `M${p1.x},${p1.y} L${p2.x},${p2.y} L${p3.x},${p3.y} L${p4.x},${p4.y} L${p5.x},${p5.y} Z`;
    
    // Get SVG elements to update
    const dataPathElement = svgRef.current.querySelector('#data-path');
    if (dataPathElement) {
      dataPathElement.setAttribute('d', dataPath);
    }
  }, [data]);

  return (
    <div className="w-full aspect-square max-w-xs mx-auto relative mb-6">
      <svg ref={svgRef} viewBox="0 0 100 100" className="w-full h-full">
        {/* Grid lines */}
        <path d="M50,10 L50,90 M10,50 L90,50 M30,30 L70,70 M30,70 L70,30" stroke="#e2d8c9" strokeWidth="0.5" fill="none" />
        
        {/* Outer pentagon */}
        <path d="M50,10 L90,50 L70,90 L30,90 L10,50 Z" stroke="#e2d8c9" strokeWidth="0.5" fill="none" />
        
        {/* Middle pentagon */}
        <path d="M50,25 L75,50 L65,75 L35,75 L25,50 Z" stroke="#e2d8c9" strokeWidth="0.5" fill="none" />
        
        {/* Inner pentagon */}
        <path d="M50,40 L60,50 L55,60 L45,60 L40,50 Z" stroke="#e2d8c9" strokeWidth="0.5" fill="none" />
        
        {/* Data pentagon - will be updated by useEffect */}
        <path 
          id="data-path" 
          d="M50,15 L80,50 L65,80 L35,80 L25,45 Z" 
          stroke="#B8860B" 
          strokeWidth="1.5" 
          fill="#B8860B" 
          fillOpacity="0.3" 
        />
        
        {/* Axis labels */}
        <text x="50" y="5" textAnchor="middle" fontSize="3" fill="#666">Sourness</text>
        <text x="95" y="50" textAnchor="start" fontSize="3" fill="#666">Sweetness</text>
        <text x="75" y="95" textAnchor="middle" fontSize="3" fill="#666">Strength</text>
        <text x="25" y="95" textAnchor="middle" fontSize="3" fill="#666">Complexity</text>
        <text x="5" y="50" textAnchor="end" fontSize="3" fill="#666">Richness</text>
      </svg>
    </div>
  );
}
