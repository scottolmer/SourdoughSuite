import { ReactNode } from 'react';
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ModernistRecipeTemplateProps {
  title: string;
  description: string;
  ingredients: Array<{
    name: string;
    weight: string;
    volume?: string;
    percentage?: number;
    notes?: string;
  }>;
  yields: string;
  process: Array<{
    name: string;
    description: string;
  }>;
  stats: {
    totalTime?: string;
    activeTime?: string;
    inactiveTime?: string;
    difficulty?: string;
    yield?: string;
    storage?: string;
  };
  tips?: string[];
  notes?: string[];
  imageUrl?: string;
}

export default function ModernistRecipeTemplate({
  title,
  description,
  ingredients,
  yields,
  process,
  stats,
  tips,
  notes,
  imageUrl
}: ModernistRecipeTemplateProps) {
  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left sidebar and image */}
        <div className="md:col-span-1">
          {imageUrl && (
            <div className="mb-6">
              <img
                src={imageUrl}
                alt={title}
                className="w-full h-64 object-cover rounded-md mb-4"
              />
              <p className="text-xs text-muted-foreground text-center italic">
                Typical appearance for {title.toLowerCase()}
              </p>
            </div>
          )}
          
          <div className="border rounded-md p-4 bg-stone-50 mb-6">
            <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">
              RECIPE STATS
            </h3>
            <ul className="space-y-2 text-sm">
              {stats.yield && (
                <li className="flex justify-between">
                  <span className="font-medium">Yield:</span>
                  <span className="font-mono">{stats.yield}</span>
                </li>
              )}
              {stats.activeTime && (
                <li className="flex justify-between">
                  <span className="font-medium">Active Time:</span>
                  <span className="font-mono">{stats.activeTime}</span>
                </li>
              )}
              {stats.inactiveTime && (
                <li className="flex justify-between">
                  <span className="font-medium">Inactive Time:</span>
                  <span className="font-mono">{stats.inactiveTime}</span>
                </li>
              )}
              {stats.totalTime && (
                <li className="flex justify-between">
                  <span className="font-medium">Total Time:</span>
                  <span className="font-mono">{stats.totalTime}</span>
                </li>
              )}
              {stats.difficulty && (
                <li className="flex justify-between">
                  <span className="font-medium">Difficulty:</span>
                  <span className="font-mono">{stats.difficulty}</span>
                </li>
              )}
              {stats.storage && (
                <li className="flex justify-between">
                  <span className="font-medium">Storage:</span>
                  <span className="font-mono">{stats.storage}</span>
                </li>
              )}
            </ul>
          </div>
          
          {(tips && tips.length > 0) && (
            <div className="border-l-4 border-amber-500 pl-4 mb-6">
              <h3 className="font-medium text-sm mb-2">TIPS</h3>
              <ul className="list-disc list-inside space-y-2 text-sm">
                {tips.map((tip, index) => (
                  <li key={index} className="text-sm text-muted-foreground">
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {(notes && notes.length > 0) && (
            <div className="text-xs text-muted-foreground">
              <h3 className="uppercase tracking-wider mb-1">NOTES</h3>
              <ul className="space-y-1">
                {notes.map((note, index) => (
                  <li key={index}>
                    {note}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        {/* Main content area */}
        <div className="md:col-span-2">
          <h1 className="font-serif text-3xl font-bold tracking-tight mb-2">{title}</h1>
          <p className="text-sm text-muted-foreground mb-6">
            {typeof description === 'object' 
              ? (description && description !== null && 'text' in description 
                ? description.text 
                : JSON.stringify(description))
              : description}
          </p>
          
          <Tabs defaultValue="ingredients" className="mb-8">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
              <TabsTrigger value="process">Process</TabsTrigger>
            </TabsList>
            
            <TabsContent value="ingredients" className="py-4">
              <div className="mb-2 flex justify-between items-center">
                <h2 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                  INGREDIENTS
                </h2>
                <Badge variant="outline" className="font-mono text-xs">
                  Yields: {yields}
                </Badge>
              </div>
              
              <Separator className="mb-4" />
              
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr className="font-mono text-xs uppercase text-muted-foreground">
                    <th className="pb-2 text-left">Ingredient</th>
                    <th className="pb-2 text-right">Weight</th>
                    {ingredients.some(i => i.volume) && (
                      <th className="pb-2 text-right">Volume</th>
                    )}
                    <th className="pb-2 text-right font-bold">Baker %</th>
                  </tr>
                </thead>
                <tbody>
                  {ingredients.map((ingredient, index) => {
                    // Format the baker's percentage correctly
                    let displayPercentage = "—";
                    if (ingredient.percentage !== undefined && ingredient.percentage !== null) {
                      const percentValue = typeof ingredient.percentage === 'number' 
                        ? ingredient.percentage 
                        : parseFloat(String(ingredient.percentage));
                      
                      if (!isNaN(percentValue)) {
                        // If it's exactly 100 or close to it (flour), format without decimal
                        if (Math.abs(percentValue - 100) < 0.1) {
                          displayPercentage = "100%";
                        } 
                        // Otherwise format with 1 decimal point
                        else {
                          displayPercentage = `${percentValue.toFixed(1)}%`;
                        }
                      } else {
                        displayPercentage = `${ingredient.percentage}%`;
                      }
                    }
                    
                    // Determine if this is a flour ingredient for highlighting
                    const isFlour = ingredient.name.toLowerCase().includes('flour') || 
                                    (ingredient.percentage === 100 || 
                                    (typeof ingredient.percentage === 'number' && 
                                      Math.abs(ingredient.percentage - 100) < 0.1));
                    
                    return (
                      <tr key={index} className="border-b last:border-0">
                        <td className="py-2 font-medium">
                          {typeof ingredient.name === 'object' 
                            ? (ingredient.name && ingredient.name !== null && 'text' in ingredient.name 
                              ? ingredient.name.text 
                              : JSON.stringify(ingredient.name))
                            : ingredient.name}
                          {ingredient.notes && (
                            <span className="text-xs italic text-muted-foreground ml-1">
                              ({typeof ingredient.notes === 'object' 
                                ? (ingredient.notes && ingredient.notes !== null && 'text' in ingredient.notes
                                  ? ingredient.notes.text
                                  : JSON.stringify(ingredient.notes))
                                : ingredient.notes})
                            </span>
                          )}
                        </td>
                        <td className="py-2 font-mono text-right">
                          {typeof ingredient.weight === 'object' 
                            ? (ingredient.weight && ingredient.weight !== null && 'text' in ingredient.weight 
                              ? ingredient.weight.text 
                              : JSON.stringify(ingredient.weight))
                            : ingredient.weight}
                        </td>
                        {ingredients.some(i => i.volume) && (
                          <td className="py-2 font-mono text-right">
                            {ingredient.volume 
                              ? (typeof ingredient.volume === 'object'
                                ? (ingredient.volume && ingredient.volume !== null && 'text' in ingredient.volume 
                                  ? ingredient.volume.text 
                                  : JSON.stringify(ingredient.volume))
                                : ingredient.volume) 
                              : "—"}
                          </td>
                        )}
                        <td className={`py-2 font-mono text-right ${isFlour ? 'font-bold' : ''}`}>
                          {displayPercentage}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </TabsContent>
            
            <TabsContent value="process" className="py-4">
              <h2 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">
                PROCESS
              </h2>
              
              <Separator className="mb-4" />
              
              <div className="space-y-4">
                {process.map((step, index) => (
                  <div key={index} className="grid grid-cols-12 gap-3 items-start">
                    <div className="col-span-3 sm:col-span-2">
                      <Badge variant="outline" className="font-mono bg-stone-50">
                        {typeof step.name === 'object' 
                          ? (step.name && step.name !== null && 'text' in step.name 
                            ? step.name.text 
                            : JSON.stringify(step.name))
                          : step.name}
                      </Badge>
                    </div>
                    <div className="col-span-9 sm:col-span-10 text-sm">
                      {typeof step.description === 'object' 
                        ? (step.description && step.description !== null && 'text' in step.description 
                          ? step.description.text 
                          : JSON.stringify(step.description))
                        : step.description}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}