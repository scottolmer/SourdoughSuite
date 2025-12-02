import { useState } from "react";
import TextureSlider from "./TextureSlider";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { 
  getHydrationLevel, 
  adjustCrustSettings, 
  generateRecipeAdjustments 
} from "./utils/textureMapping";

interface TextureSettings {
  crumbOpenness: number;
  elasticity: number;
  crustThickness: number;
  crustHardness: number;
  chewiness: number;
  riseProfile: string;
  hydrationPriority: "crumb" | "crust";
}

interface TextureStructurePanelProps {
  textureSettings: TextureSettings;
  onSettingsChange: (settings: TextureSettings) => void;
}

export default function TextureStructurePanel({ 
  textureSettings, 
  onSettingsChange 
}: TextureStructurePanelProps) {
  const updateSetting = (key: keyof TextureSettings, value: any) => {
    const newSettings = { ...textureSettings, [key]: value };
    onSettingsChange(newSettings);
  };

  // Calculate recipe implications based on current settings
  const hydrationLevel = getHydrationLevel(textureSettings);
  const crustSettings = adjustCrustSettings(textureSettings);
  const recipeImplications = getRecipeImplications(textureSettings);

  return (
    <div className="space-y-10">
      <div>
        <div className="flex items-center mb-4">
          <span className="text-xs font-mono text-[#6E6E6E] mr-2">PARAMETER.01</span>
          <div className="h-px bg-gray-200 w-20"></div>
        </div>
        <h3 className="text-lg font-serif font-medium text-[#2B2B2B] mb-6">Crumb Structure</h3>
        <div className="space-y-8">
          <TextureSlider
            label="Crumb Openness"
            value={textureSettings.crumbOpenness}
            onChange={(value) => updateSetting('crumbOpenness', value)}
            leftLabel="Tight, Regular Crumb"
            rightLabel="Open, Airy Crumb"
            tooltip="Controls the size and distribution of air pockets in your bread's interior"
          />
          
          <TextureSlider
            label="Elasticity"
            value={textureSettings.elasticity}
            onChange={(value) => updateSetting('elasticity', value)}
            leftLabel="Cake-like"
            rightLabel="Stretchy, Extensible"
            tooltip="Determines how elastic/chewy the bread texture will be"
          />
          
          <TextureSlider
            label="Chewiness"
            value={textureSettings.chewiness}
            onChange={(value) => updateSetting('chewiness', value)}
            leftLabel="Tender, Soft"
            rightLabel="Substantial Chew"
            tooltip="Affects the resistance when biting into the bread"
          />
        </div>
      </div>
      
      <div className="pt-8 border-t border-gray-200">
        <div className="flex items-center mb-4">
          <span className="text-xs font-mono text-[#6E6E6E] mr-2">PARAMETER.02</span>
          <div className="h-px bg-gray-200 w-20"></div>
        </div>
        <h3 className="text-lg font-serif font-medium text-[#2B2B2B] mb-6">Crust Development</h3>
        <div className="space-y-8">
          <TextureSlider
            label="Crust Thickness"
            value={textureSettings.crustThickness}
            onChange={(value) => updateSetting('crustThickness', value)}
            leftLabel="Thin, Delicate"
            rightLabel="Thick, Substantial"
            tooltip="Controls how thick the outer layer of your bread will be"
          />
          
          <TextureSlider
            label="Crust Hardness"
            value={textureSettings.crustHardness}
            onChange={(value) => updateSetting('crustHardness', value)}
            leftLabel="Soft" 
            rightLabel="Hard, Crisp"
            tooltip="Determines how crisp and hard the crust will be"
          />
          
          <div className="space-y-3">
            <label className="block text-sm font-medium text-[#2B2B2B] mb-2 uppercase tracking-wide">Rise Profile</label>
            <Select 
              value={textureSettings.riseProfile} 
              onValueChange={(value) => updateSetting('riseProfile', value)}
            >
              <SelectTrigger className="w-full bg-white border-[#2B2B2B] rounded-none text-[#2B2B2B] focus:ring-0 hover:bg-[#F5F5F5]">
                <SelectValue placeholder="Select rise profile" />
              </SelectTrigger>
              <SelectContent className="border-[#2B2B2B] rounded-none">
                <SelectItem value="Domed">Domed (Bold Oven Spring)</SelectItem>
                <SelectItem value="Flat">Flat (Focaccia-Style)</SelectItem>
                <SelectItem value="Rustic">Rustic (Irregular Shape)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      <div className="pt-8 border-t border-gray-200">
        <div className="flex items-center mb-4">
          <span className="text-xs font-mono text-[#6E6E6E] mr-2">PARAMETER.03</span>
          <div className="h-px bg-gray-200 w-20"></div>
        </div>
        <h3 className="text-lg font-serif font-medium text-[#2B2B2B] mb-6">Optimization Priority</h3>
        <RadioGroup 
          value={textureSettings.hydrationPriority}
          onValueChange={(value: "crumb" | "crust") => updateSetting('hydrationPriority', value)}
          className="flex flex-col space-y-4"
        >
          <div className="flex items-start space-x-3">
            <RadioGroupItem value="crumb" id="crumb" className="mt-0.5 border-[#2B2B2B] text-[#D97706]" />
            <Label htmlFor="crumb" className="cursor-pointer">
              <span className="font-medium text-[#2B2B2B] block mb-1">Optimize for Crumb</span>
              <p className="text-xs text-[#6E6E6E] leading-relaxed">Prioritize interior texture by optimizing protein-to-water ratio (higher hydration)</p>
            </Label>
          </div>
          <div className="flex items-start space-x-3">
            <RadioGroupItem value="crust" id="crust" className="mt-0.5 border-[#2B2B2B] text-[#D97706]" />
            <Label htmlFor="crust" className="cursor-pointer">
              <span className="font-medium text-[#2B2B2B] block mb-1">Optimize for Crust</span>
              <p className="text-xs text-[#6E6E6E] leading-relaxed">Prioritize exterior development by creating ideal conditions for Maillard reaction (lower hydration)</p>
            </Label>
          </div>
        </RadioGroup>
      </div>
      
      <div className="pt-8 border-t border-gray-200">
        <div className="flex items-center mb-4">
          <span className="text-xs font-mono text-[#6E6E6E] mr-2">ANALYSIS.01</span>
          <div className="h-px bg-gray-200 w-20"></div>
        </div>
        <div className="bg-[#F5F5F5] p-6 border border-gray-100">
          <h4 className="font-medium mb-4 text-sm uppercase tracking-wide text-[#2B2B2B]">Formula Implications</h4>
          <div className="space-y-4 font-mono text-sm">
            <div className="flex justify-between border-b border-dashed border-gray-200 pb-2">
              <span className="text-[#6E6E6E]">Hydration:</span>
              <span className="text-[#2B2B2B] font-medium">{hydrationLevel}%</span>
            </div>
            <div className="flex justify-between border-b border-dashed border-gray-200 pb-2">
              <span className="text-[#6E6E6E]">Baking temperature:</span>
              <span className="text-[#2B2B2B] font-medium">{crustSettings.bakeTemp}°F</span>
            </div>
            <div className="flex justify-between border-b border-dashed border-gray-200 pb-2">
              <span className="text-[#6E6E6E]">Baking time:</span>
              <span className="text-[#2B2B2B] font-medium">{crustSettings.bakeTime} min</span>
            </div>
            <div>
              <span className="text-[#6E6E6E] block mb-2">Method:</span>
              <span className="text-[#2B2B2B] leading-relaxed block">{recipeImplications}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getRecipeImplications(settings: TextureSettings): string {
  const adjustments = generateRecipeAdjustments(settings);
  
  const implications = [];
  
  // Add flour recommendations
  implications.push(`${adjustments.flour.type} (${adjustments.flour.protein} protein)`);
  
  // Add method recommendations
  if (adjustments.method.autolyse > 40) {
    implications.push(`${adjustments.method.autolyse}min autolyse`);
  }
  
  // Add folding recommendations
  implications.push(`${adjustments.method.folds} gentle folds`);
  
  // Add steam/dutch oven recommendations
  if (settings.crustHardness > 65) {
    implications.push(adjustments.bake.dutch ? 
      "bake in Dutch oven" : 
      "use steam during first 15min"
    );
  }
  
  return implications.join(", ");
}