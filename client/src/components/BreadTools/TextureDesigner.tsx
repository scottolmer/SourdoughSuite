import { useState } from "react";
import { Button } from "@/components/ui/button";
import TextureStructurePanel from "./TextureStructurePanel";
import StructureGrid from "./StructureGrid";
import { TextureSettings } from "./utils/textureMapping";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function TextureDesigner() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [textureSettings, setTextureSettings] = useState<TextureSettings>({
    crumbOpenness: 70,
    elasticity: 60,
    crustThickness: 60,
    crustHardness: 75,
    chewiness: 65,
    riseProfile: "Rustic",
    hydrationPriority: "crumb"
  });

  const handleSettingsChange = (newSettings: TextureSettings) => {
    setTextureSettings(newSettings);
  };
  
  const handleGenerateRecipe = () => {
    // Display success toast
    toast({
      title: "Recipe Settings Captured",
      description: "Your texture and structure preferences have been saved. Generating recipe...",
      variant: "default",
    });
    
    // In a real app, we would pass these settings to the recipe generator
    console.log("Generating recipe with settings:", textureSettings);
    
    // Simulate navigation to recipe generator after a short delay
    setTimeout(() => {
      // Navigate to the flavor designer tab as the next step
      const event = new CustomEvent('switchTab', { detail: 'flavor-designer' });
      document.dispatchEvent(event);
      
      // You could alternatively use this to navigate to a dedicated recipe page:
      // setLocation("/recipe-generator");
    }, 1500);
  };

  return (
    <div className="bg-white overflow-hidden">
      <div className="p-8 md:p-12">
        <div className="mb-8">
          <div className="flex items-center mb-2">
            <span className="text-xs font-mono text-[#6E6E6E] mr-2">ANALYZER.01</span>
            <div className="h-px bg-gray-300 flex-grow"></div>
          </div>
          <h2 className="text-[#2B2B2B] text-2xl md:text-3xl font-serif tracking-tight mb-4">
            Texture & Structure Designer
          </h2>
          <p className="text-[#6E6E6E] max-w-3xl leading-relaxed">
            Design the perfect crumb, crust, and structure for your ideal sourdough bread.
            Visualize and adjust how your bread will look and feel through precise parameter controls.
          </p>
        </div>
        
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Left side - Controls using TextureStructurePanel */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <div className="flex items-center mb-2">
                <span className="text-xs font-mono text-[#6E6E6E] mr-2">CONTROLS</span>
                <div className="h-px bg-gray-200 w-20"></div>
              </div>
            </div>
            <TextureStructurePanel 
              textureSettings={textureSettings}
              onSettingsChange={handleSettingsChange}
            />
          </div>
          
          {/* Right side - Preview with StructureGrid visualization */}
          <div className="lg:col-span-2">
            <div className="bg-[#F5F5F5] border border-gray-100 p-8">
              <div className="mb-6">
                <div className="flex items-center mb-2">
                  <span className="text-xs font-mono text-[#6E6E6E] mr-2">VISUALIZATION</span>
                  <div className="h-px bg-gray-300 w-20"></div>
                </div>
                <h3 className="text-[#2B2B2B] text-lg font-serif mb-4">Crumb Structure Analysis</h3>
              </div>
              
              {/* Structure visualization */}
              <div className="mb-8 bg-white border border-gray-100 p-4 relative">
                <StructureGrid 
                  crumbOpenness={textureSettings.crumbOpenness}
                  elasticity={textureSettings.elasticity}
                  riseProfile={textureSettings.riseProfile}
                  size={300}
                />
                <div className="absolute bottom-2 left-2 text-xs font-mono tracking-tight text-[#6E6E6E]">
                  FIG.01
                </div>
              </div>
              
              <div className="mb-6">
                <div className="flex items-center mb-2">
                  <span className="text-xs font-mono text-[#6E6E6E] mr-2">CHARACTERISTICS</span>
                  <div className="h-px bg-gray-300 w-20"></div>
                </div>
              </div>
              
              <div className="mb-8">
                <h4 className="text-[#2B2B2B] font-medium mb-3 text-sm uppercase tracking-wide">Structure Analysis</h4>
                <p className="text-sm text-[#6E6E6E] leading-relaxed mb-6 font-light">
                  {textureSettings.crumbOpenness > 70 
                    ? 'An open, airy crumb with irregular holes and aeration' 
                    : textureSettings.crumbOpenness > 50 
                      ? 'A medium-open crumb with moderate aeration'
                      : 'A tight, uniform crumb structure with fine texture'}
                  {' with '}
                  {textureSettings.crustHardness > 70 
                    ? 'a substantial, crisp crust' 
                    : textureSettings.crustHardness > 50
                      ? 'a moderate crust development'
                      : 'a thin, delicate crust'}.
                  {textureSettings.riseProfile === 'Domed' && ' Features a bold domed shape with dramatic oven spring.'}
                  {textureSettings.riseProfile === 'Rustic' && ' Shows a rustic, artisanal irregular shape.'}
                  {textureSettings.riseProfile === 'Flat' && ' Has a flatter profile similar to focaccia-style breads.'}
                </p>
              </div>
              
              <div className="border-t border-gray-100 pt-6 mb-8">
                <h4 className="text-[#2B2B2B] font-medium mb-3 text-sm uppercase tracking-wide">Technical Parameters</h4>
                <ul className="text-sm text-[#6E6E6E] space-y-2 mb-6 font-mono">
                  <li className="flex justify-between">
                    <span>Hydration:</span>
                    <span className="font-medium">
                      {textureSettings.crumbOpenness > 70 ? '75-85%' : '65-70%'}
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span>Gluten development:</span>
                    <span className="font-medium">
                      {textureSettings.elasticity > 70 ? 'Extended' : 'Standard'}
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span>Baking environment:</span>
                    <span className="font-medium">
                      {textureSettings.crustHardness > 70 ? 'Steam/Dutch oven' : 'Standard'}
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span>Scoring pattern:</span>
                    <span className="font-medium">
                      {textureSettings.riseProfile === 'Domed' 
                        ? 'Bold' 
                        : textureSettings.riseProfile === 'Rustic'
                          ? 'Irregular'
                          : 'Minimal'}
                    </span>
                  </li>
                </ul>
              </div>
              
              <Button 
                onClick={handleGenerateRecipe}
                className="w-full bg-[#1F1F1F] hover:bg-[#3A3A3A] text-white rounded-none transition-colors"
              >
                Generate Recipe with These Parameters
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
