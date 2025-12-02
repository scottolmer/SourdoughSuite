import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FlavorProfile } from "@/hooks/use-bread-profile";

interface FlavorProfileDesignerProps {
  flavorProfile: FlavorProfile;
  onUpdate: (updates: Partial<FlavorProfile>) => void;
  onUpdateFlavor: (name: string, value: boolean) => void;
}

export default function FlavorProfileDesigner({ 
  flavorProfile, 
  onUpdate, 
  onUpdateFlavor 
}: FlavorProfileDesignerProps) {
  const flavorOptions = [
    { id: "nutty", label: "Nutty", description: "Toasted nuts, hazelnut, walnut notes" },
    { id: "fruity", label: "Fruity", description: "Mild fruit notes, apple, pear, raisin" },
    { id: "spicy", label: "Spicy", description: "Pepper, clove, subtle spice notes" },
    { id: "earthy", label: "Earthy", description: "Mineral, mushroom, wheat field" },
    { id: "malty", label: "Malty", description: "Sweet grain, cereal notes, malt extract" },
    { id: "buttery", label: "Buttery", description: "Rich, dairy notes, butter-like" },
  ];

  return (
    <Card className="w-full shadow-md">
      <CardHeader className="bg-amber-50">
        <CardTitle className="text-2xl font-serif text-gray-800">Flavor Profile Designer</CardTitle>
        <CardDescription className="font-mono text-gray-600">
          Define your ideal sourdough flavor characteristics
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-6">
          <div>
            <div className="flex justify-between mb-2">
              <Label htmlFor="sourness" className="text-sm font-medium">
                Sourness
              </Label>
              <span className="text-xs font-mono text-gray-500">
                {flavorProfile.sourness}/10
              </span>
            </div>
            <Slider 
              id="sourness"
              min={1} 
              max={10} 
              step={1} 
              value={[flavorProfile.sourness]} 
              onValueChange={(values) => onUpdate({ sourness: values[0] })}
              className="py-4"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Mild</span>
              <span>Very Tangy</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <Label htmlFor="sweetness" className="text-sm font-medium">
                Sweetness
              </Label>
              <span className="text-xs font-mono text-gray-500">
                {flavorProfile.sweetness}/10
              </span>
            </div>
            <Slider 
              id="sweetness"
              min={1} 
              max={10} 
              step={1} 
              value={[flavorProfile.sweetness]} 
              onValueChange={(values) => onUpdate({ sweetness: values[0] })}
              className="py-4"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Not Sweet</span>
              <span>Noticeably Sweet</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <Label htmlFor="complexity" className="text-sm font-medium">
                Flavor Complexity
              </Label>
              <span className="text-xs font-mono text-gray-500">
                {flavorProfile.complexity}/10
              </span>
            </div>
            <Slider 
              id="complexity"
              min={1} 
              max={10} 
              step={1} 
              value={[flavorProfile.complexity]} 
              onValueChange={(values) => onUpdate({ complexity: values[0] })}
              className="py-4"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Simple, Clean</span>
              <span>Multi-layered, Complex</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <Label htmlFor="strength" className="text-sm font-medium">
                Overall Flavor Strength
              </Label>
              <span className="text-xs font-mono text-gray-500">
                {flavorProfile.strength}/10
              </span>
            </div>
            <Slider 
              id="strength"
              min={1} 
              max={10} 
              step={1} 
              value={[flavorProfile.strength]} 
              onValueChange={(values) => onUpdate({ strength: values[0] })}
              className="py-4"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Subtle</span>
              <span>Pronounced</span>
            </div>
          </div>

          <Separator className="my-4" />

          <div>
            <h3 className="text-sm font-medium mb-3">Specific Flavor Notes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {flavorOptions.map((flavor) => (
                <div key={flavor.id} className="flex items-start space-x-3">
                  <Checkbox 
                    id={flavor.id} 
                    checked={flavorProfile.flavors[flavor.id as keyof typeof flavorProfile.flavors]} 
                    onCheckedChange={(checked) => onUpdateFlavor(flavor.id, checked as boolean)}
                  />
                  <div className="grid gap-1">
                    <Label
                      htmlFor={flavor.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {flavor.label}
                    </Label>
                    <p className="text-xs text-gray-500">{flavor.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 px-4 py-3 bg-amber-50 rounded-md">
          <h3 className="text-sm font-semibold font-mono text-gray-700">FLAVOR ANALYSIS</h3>
          <p className="text-sm text-gray-600 mt-1">
            {getFlavorAnalysis(flavorProfile)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function getFlavorAnalysis(profile: FlavorProfile): string {
  // Analyze sourness
  const sournessDescription = profile.sourness > 7
    ? "pronounced tangy character"
    : profile.sourness > 4
      ? "moderate acidity"
      : "mild sourness";
      
  // Analyze sweetness
  const sweetnessDescription = profile.sweetness > 7
    ? "noticeable sweetness"
    : profile.sweetness > 4
      ? "balanced sweetness"
      : "minimal sweetness";
      
  // Analyze complexity and strength
  const complexityDescription = profile.complexity > 7
    ? profile.strength > 7
      ? "richly complex and bold flavor profile"
      : "nuanced complexity with moderate intensity"
    : profile.complexity > 4
      ? profile.strength > 7
        ? "moderately complex with pronounced intensity"
        : "balanced complexity and strength"
      : profile.strength > 7
        ? "straightforward but bold flavor"
        : "simple, clean flavor profile";
        
  // Get selected flavor notes
  const selectedFlavors = Object.entries(profile.flavors)
    .filter(([_, isSelected]) => isSelected)
    .map(([flavor, _]) => flavor);
    
  const flavorNotesDescription = selectedFlavors.length > 0
    ? `with notes of ${selectedFlavors.join(', ')}`
    : "with clean grain flavor";
    
  return `You prefer bread with a ${sournessDescription} and ${sweetnessDescription}, creating a ${complexityDescription} ${flavorNotesDescription}.`;
}