import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TextureProfile } from "@/hooks/use-bread-profile";

interface TextureStructureDesignerProps {
  textureProfile: TextureProfile;
  onUpdate: (updates: Partial<TextureProfile>) => void;
}

export default function TextureStructureDesigner({ 
  textureProfile, 
  onUpdate 
}: TextureStructureDesignerProps) {
  return (
    <Card className="w-full shadow-md">
      <CardHeader className="bg-amber-50">
        <CardTitle className="text-2xl font-serif text-gray-800">Texture & Structure Designer</CardTitle>
        <CardDescription className="font-mono text-gray-600">
          Define your ideal bread texture and structure characteristics
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-8">
          {/* Section: Crumb Structure */}
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-4">Crumb Structure</h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <Label htmlFor="crumbOpenness" className="text-sm font-medium">
                    Crumb Openness
                  </Label>
                  <span className="text-xs font-mono text-gray-500">
                    {textureProfile.crumbOpenness}/10
                  </span>
                </div>
                <Slider 
                  id="crumbOpenness"
                  min={1} 
                  max={10} 
                  step={1} 
                  value={[textureProfile.crumbOpenness]} 
                  onValueChange={(values) => onUpdate({ crumbOpenness: values[0] })}
                  className="py-4"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Tight Crumb</span>
                  <span>Open Crumb</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <Label htmlFor="holeSize" className="text-sm font-medium">
                    Hole Size
                  </Label>
                  <span className="text-xs font-mono text-gray-500">
                    {textureProfile.holeSize}/10
                  </span>
                </div>
                <Slider 
                  id="holeSize"
                  min={1} 
                  max={10} 
                  step={1} 
                  value={[textureProfile.holeSize]} 
                  onValueChange={(values) => onUpdate({ holeSize: values[0] })}
                  className="py-4"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Small Holes</span>
                  <span>Large Holes</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <Label htmlFor="tenderness" className="text-sm font-medium">
                    Tenderness
                  </Label>
                  <span className="text-xs font-mono text-gray-500">
                    {textureProfile.tenderness}/10
                  </span>
                </div>
                <Slider 
                  id="tenderness"
                  min={1} 
                  max={10} 
                  step={1} 
                  value={[textureProfile.tenderness]} 
                  onValueChange={(values) => onUpdate({ tenderness: values[0] })}
                  className="py-4"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Chewy</span>
                  <span>Tender</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <Label htmlFor="moisture" className="text-sm font-medium">
                    Moisture
                  </Label>
                  <span className="text-xs font-mono text-gray-500">
                    {textureProfile.moisture}/10
                  </span>
                </div>
                <Slider 
                  id="moisture"
                  min={1} 
                  max={10} 
                  step={1} 
                  value={[textureProfile.moisture]} 
                  onValueChange={(values) => onUpdate({ moisture: values[0] })}
                  className="py-4"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Dry</span>
                  <span>Moist</span>
                </div>
              </div>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          {/* Section: Crust Character */}
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-4">Crust Character</h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <Label htmlFor="crustThickness" className="text-sm font-medium">
                    Crust Thickness
                  </Label>
                  <span className="text-xs font-mono text-gray-500">
                    {textureProfile.crustThickness}/10
                  </span>
                </div>
                <Slider 
                  id="crustThickness"
                  min={1} 
                  max={10} 
                  step={1} 
                  value={[textureProfile.crustThickness]} 
                  onValueChange={(values) => onUpdate({ crustThickness: values[0] })}
                  className="py-4"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Thin</span>
                  <span>Thick</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <Label htmlFor="crustTexture" className="text-sm font-medium">
                    Crust Texture
                  </Label>
                  <span className="text-xs font-mono text-gray-500">
                    {textureProfile.crustTexture}/10
                  </span>
                </div>
                <Slider 
                  id="crustTexture"
                  min={1} 
                  max={10} 
                  step={1} 
                  value={[textureProfile.crustTexture]} 
                  onValueChange={(values) => onUpdate({ crustTexture: values[0] })}
                  className="py-4"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Soft</span>
                  <span>Crispy</span>
                </div>
              </div>

              <div className="flex items-center justify-between space-x-2 pt-2">
                <Label htmlFor="isRustic" className="text-sm font-medium">
                  Rustic, Artisanal Character
                </Label>
                <Switch
                  id="isRustic"
                  checked={textureProfile.isRustic}
                  onCheckedChange={(checked) => onUpdate({ isRustic: checked })}
                />
              </div>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          {/* Section: Appearance */}
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-4">Appearance</h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <Label htmlFor="color" className="text-sm font-medium">
                    Crust Color
                  </Label>
                  <span className="text-xs font-mono text-gray-500">
                    {textureProfile.color}/10
                  </span>
                </div>
                <Slider 
                  id="color"
                  min={1} 
                  max={10} 
                  step={1} 
                  value={[textureProfile.color]} 
                  onValueChange={(values) => onUpdate({ color: values[0] })}
                  className="py-4"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Light</span>
                  <span>Dark</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <Label htmlFor="surfaceCharacter" className="text-sm font-medium">
                    Surface Character
                  </Label>
                  <span className="text-xs font-mono text-gray-500">
                    {textureProfile.surfaceCharacter}/10
                  </span>
                </div>
                <Slider 
                  id="surfaceCharacter"
                  min={1} 
                  max={10} 
                  step={1} 
                  value={[textureProfile.surfaceCharacter]} 
                  onValueChange={(values) => onUpdate({ surfaceCharacter: values[0] })}
                  className="py-4"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Minimally Blistered</span>
                  <span>Highly Blistered</span>
                </div>
              </div>

              <div className="flex items-center justify-between space-x-2 pt-2">
                <Label htmlFor="isSmooth" className="text-sm font-medium">
                  Smooth Surface Finish
                </Label>
                <Switch
                  id="isSmooth"
                  checked={textureProfile.isSmooth}
                  onCheckedChange={(checked) => onUpdate({ isSmooth: checked })}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 px-4 py-3 bg-amber-50 rounded-md">
          <h3 className="text-sm font-semibold font-mono text-gray-700">TEXTURE ANALYSIS</h3>
          <p className="text-sm text-gray-600 mt-1">
            {getTextureAnalysis(textureProfile)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function getTextureAnalysis(profile: TextureProfile): string {
  // Analyze crumb structure
  const crumbDescription = profile.crumbOpenness > 7
    ? "very open crumb structure with "
    : profile.crumbOpenness > 4
      ? "moderately open crumb with "
      : "tight, uniform crumb with ";
      
  const holeDescription = profile.holeSize > 7
    ? "large, irregular holes"
    : profile.holeSize > 4
      ? "medium-sized alveoli"
      : "small, even bubbles";
      
  // Analyze tenderness and moisture
  const textureDescription = profile.tenderness > 7
    ? profile.moisture > 7
      ? "extremely tender and moist interior"
      : "very tender with moderate moisture"
    : profile.tenderness > 4
      ? profile.moisture > 7
        ? "balanced tenderness with high moisture content"
        : "pleasantly chewy with moderate moisture"
      : profile.moisture > 7
        ? "chewy but moist interior"
        : "firm, dense texture";
        
  // Analyze crust
  const crustDescription = profile.crustThickness > 7
    ? profile.crustTexture > 7
      ? "thick, shattering crust"
      : "substantial crust with moderate crispness"
    : profile.crustThickness > 4
      ? profile.crustTexture > 7
        ? "medium-thickness crust with excellent crispness"
        : "balanced crust with gentle chew"
      : profile.crustTexture > 7
        ? "thin but crispy crust"
        : "delicate, soft crust";
        
  // Analyze color and surface
  const appearanceDescription = profile.isRustic
    ? profile.color > 7
      ? `deep, rustic ${profile.surfaceCharacter > 7 ? "highly blistered" : "minimally blistered"} appearance`
      : `golden, artisanal ${profile.surfaceCharacter > 7 ? "well-blistered" : "lightly blistered"} appearance`
    : profile.isSmooth
      ? profile.color > 7
        ? "dark, smooth professional finish"
        : "light, sleek refined appearance"
      : profile.color > 7
        ? "deep colored with traditional finish"
        : "golden with classic appearance";
        
  return `You prefer bread with a ${crumbDescription}${holeDescription}. The bread interior has a ${textureDescription}, complemented by a ${crustDescription}. The ideal loaf has a ${appearanceDescription}.`;
}