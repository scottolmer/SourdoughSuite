import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'wouter';
import { Pencil, Check, X, Plus, Trash } from 'lucide-react';
import RecommendedRecipes from './RecommendedRecipes';

export interface StarterProductProps {
  id: string | number;
  name: string;
  description: string;
  origin?: string[];
  flavorProfile?: string[] | Record<string, any>;
  idealUses?: string[];
  careNotes?: string[];
  imageUrl?: string;
  price: number | string;
  slug?: string; // Add slug for URL routing
  // API specific fields
  flourMix?: Record<string, any>;
  flavor?: Record<string, any>;
  maintenance?: Record<string, any>;
  mainFlour?: string;
}

export default function StarterProductTemplate({
  id,
  name,
  description,
  origin = [],
  flavorProfile = [],
  idealUses = [],
  careNotes: defaultCareNotes = [],
  imageUrl,
  price,
  // API specific fields
  flourMix,
  flavor,
  maintenance,
  mainFlour
}: StarterProductProps) {
  
  // Convert API data format to template format if needed
  const processedOrigin = useMemo(() => {
    if (origin.length > 0) return origin;
    
    // Generate origin from API data if available
    const processedEntries: string[] = [];
    
    if (mainFlour) {
      processedEntries.push(`Primary flour: ${mainFlour}`);
    }
    
    if (flourMix) {
      const flourMixEntries = Object.entries(flourMix)
        .map(([flour, percentage]) => `Contains ${flour} flour (${percentage}%)`);
      processedEntries.push(...flourMixEntries);
    }
    
    if (maintenance?.difficulty) {
      processedEntries.push(`Maintenance difficulty: ${maintenance.difficulty}`);
    }
    
    if (maintenance?.feeding_schedule) {
      processedEntries.push(`Feeding schedule: ${maintenance.feeding_schedule}`);
    }
    
    return processedEntries;
  }, [origin, mainFlour, flourMix, maintenance]);
  
  // Convert API flavor data to flavor profile format
  const processedFlavorProfile = useMemo(() => {
    if (Array.isArray(flavorProfile) && flavorProfile.length > 0) return flavorProfile;
    
    // If flavorProfile is an object, convert it to array format
    if (flavorProfile && typeof flavorProfile === 'object' && !Array.isArray(flavorProfile)) {
      return Object.entries(flavorProfile)
        .map(([flavor, intensity]) => `${flavor} (intensity: ${intensity})`);
    }
    
    // Generate flavor profile from API data if available
    if (flavor) {
      return Object.entries(flavor)
        .map(([flavorNote, intensity]) => `${flavorNote} (intensity: ${intensity})`);
    }
    
    return [];
  }, [flavorProfile, flavor]);
  
  // Generate ideal uses if not provided
  const processedIdealUses = useMemo(() => {
    if (idealUses.length > 0) return idealUses;
    
    const generatedUses: string[] = [];
    
    // Generate some generic ideal uses based on available data
    if (mainFlour === 'wheat') {
      generatedUses.push('Traditional bread recipes');
      generatedUses.push('Artisan sourdough loaves');
    }
    
    if (flavor?.tangy && (flavor.tangy as number) > 3) {
      generatedUses.push('San Francisco style sourdough breads');
    }
    
    if (flavor?.sweet && (flavor.sweet as number) > 3) {
      generatedUses.push('Enriched doughs and sweet applications');
    }
    
    if (maintenance?.difficulty === 'easy') {
      generatedUses.push('Beginner-friendly recipes');
    }
    
    // Add a generic use if we don't have enough specific ones
    if (generatedUses.length < 2) {
      generatedUses.push('Various bread styles and recipes');
      generatedUses.push('Experiment with different flour combinations');
    }
    
    return generatedUses;
  }, [idealUses, mainFlour, flavor, maintenance]);
  // State for care notes
  const [careNotes, setCareNotes] = useState<string[]>(defaultCareNotes);
  const [isEditingCareNotes, setIsEditingCareNotes] = useState(false);
  const [newCareNote, setNewCareNote] = useState('');
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
  const [editingItemText, setEditingItemText] = useState('');
  
  // Load saved care notes from local storage on initial load
  useEffect(() => {
    const savedNotes = localStorage.getItem(`starter-care-notes-${id}`);
    if (savedNotes) {
      setCareNotes(JSON.parse(savedNotes));
    }
  }, [id]);
  
  // Save care notes to local storage whenever they change
  useEffect(() => {
    if (careNotes !== defaultCareNotes) {
      localStorage.setItem(`starter-care-notes-${id}`, JSON.stringify(careNotes));
    }
  }, [careNotes, id, defaultCareNotes]);
  return (
    <div className="min-h-screen bg-gray-50 pt-16 pb-24">
      <div className="fixed top-4 left-4 z-10">
        <Link href="/shop">
          <span className="px-4 py-2 bg-white rounded-md shadow-sm text-sm font-medium border border-gray-300 hover:bg-gray-50 cursor-pointer">
            ← Back to Shop
          </span>
        </Link>
      </div>
      
      <article className="max-w-6xl mx-auto bg-white shadow-sm rounded-lg overflow-hidden">
        {/* Header section */}
        <div className="relative">
          <div className="bg-gray-100 h-64 md:h-[40rem] flex items-center justify-center">
            {imageUrl ? (
              <img 
                src={imageUrl?.replace('.png', '.jpg')} 
                alt={name} 
                className="h-full w-full object-contain p-4 max-w-4xl mx-auto" 
              />
            ) : (
              <div className="text-gray-400 text-3xl font-serif">{name}</div>
            )}
          </div>
          
          <div className="absolute top-4 right-4 bg-amber-600 text-white px-4 py-2 rounded-md font-mono">
            {typeof price === 'number' ? `$${price.toFixed(2)}` : price}
          </div>
          <div className="absolute top-4 left-4 bg-blue-600 text-white px-4 py-2 rounded-md font-medium">
            COMING SOON
          </div>
        </div>
        
        <div className="p-6 md:p-10">
          {/* Title section */}
          <div className="mb-8 border-b border-gray-200 pb-5">
            <h1 className="text-3xl md:text-4xl font-serif mb-3 text-gray-900">{name}</h1>
            <p className="text-gray-700 mb-6 text-lg leading-relaxed">{description}</p>
            
            <div className="flex flex-wrap justify-between items-center pt-4">
              <button 
                disabled
                className="bg-gray-400 text-white px-8 py-3 rounded-md font-medium transition-colors cursor-not-allowed"
              >
                Coming Soon
              </button>
              
              <div className="text-sm text-gray-500 mt-4 sm:mt-0">
                Free shipping • Ready to use • Detailed care instructions included
              </div>
            </div>
          </div>
          
          {/* Main content grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Origin & Characteristics */}
            <div>
              <h2 className="uppercase text-sm font-medium border-b border-gray-300 pb-2 mb-4">
                Origin & Characteristics
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-gray-700 mb-8">
                {processedOrigin.map((item, index) => (
                  <li key={index} className="leading-relaxed">{item}</li>
                ))}
              </ul>
              
              {/* Flavor Profile */}
              <h2 className="uppercase text-sm font-medium border-b border-gray-300 pb-2 mb-4">
                Flavor Profile
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-gray-700 mb-8">
                {processedFlavorProfile.map((item, index) => (
                  <li key={index} className="leading-relaxed">{item}</li>
                ))}
              </ul>
            </div>
            
            {/* Ideal Uses */}
            <div>
              <h2 className="uppercase text-sm font-medium border-b border-gray-300 pb-2 mb-4">
                Ideal Uses
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-gray-700 mb-8">
                {processedIdealUses.map((item, index) => (
                  <li key={index} className="leading-relaxed">{item}</li>
                ))}
              </ul>
              
              {/* Special Care Notes */}
              <div className="flex items-center justify-between">
                <h2 className="uppercase text-sm font-medium border-b border-gray-300 pb-2 mb-4 flex-grow">
                  Special Care Notes
                </h2>
                <button 
                  onClick={() => setIsEditingCareNotes(!isEditingCareNotes)}
                  className="text-amber-600 hover:text-amber-700 p-1 rounded-md"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              </div>
              
              {isEditingCareNotes ? (
                <div className="mb-4">
                  {/* Add new care note input */}
                  <div className="flex mt-3">
                    <input
                      type="text"
                      value={newCareNote}
                      onChange={(e) => setNewCareNote(e.target.value)}
                      placeholder="Add new care note..."
                      className="flex-grow border rounded-l-md px-3 py-2 text-sm"
                    />
                    <button
                      onClick={() => {
                        if (newCareNote.trim()) {
                          setCareNotes([...careNotes, newCareNote.trim()]);
                          setNewCareNote('');
                        }
                      }}
                      className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-2 rounded-r-md"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  
                  {/* Editable care notes list */}
                  <ul className="mt-4 space-y-2">
                    {careNotes.map((item, index) => (
                      <li key={index} className="flex items-center">
                        {editingItemIndex === index ? (
                          <>
                            <input
                              type="text"
                              value={editingItemText}
                              onChange={(e) => setEditingItemText(e.target.value)}
                              className="flex-grow border rounded-l-md px-3 py-2 text-sm"
                            />
                            <button
                              onClick={() => {
                                const updatedNotes = [...careNotes];
                                updatedNotes[index] = editingItemText;
                                setCareNotes(updatedNotes);
                                setEditingItemIndex(null);
                              }}
                              className="bg-green-600 hover:bg-green-700 text-white px-2 py-2"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setEditingItemIndex(null)}
                              className="bg-red-600 hover:bg-red-700 text-white px-2 py-2 rounded-r-md"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <span className="flex-grow">{item}</span>
                            <button
                              onClick={() => {
                                setEditingItemIndex(index);
                                setEditingItemText(item);
                              }}
                              className="text-amber-600 hover:text-amber-700 px-2"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                const updatedNotes = careNotes.filter((_, i) => i !== index);
                                setCareNotes(updatedNotes);
                              }}
                              className="text-red-600 hover:text-red-700 px-2"
                            >
                              <Trash className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                  
                  <button
                    onClick={() => setIsEditingCareNotes(false)}
                    className="mt-4 text-amber-600 border border-amber-600 px-4 py-2 rounded-md text-sm"
                  >
                    Done Editing
                  </button>
                </div>
              ) : (
                <ul className="list-disc pl-5 space-y-2 text-gray-700">
                  {careNotes.map((item, index) => (
                    <li key={index} className="leading-relaxed">{item}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          
          {/* Recommended Recipes Section */}
          <RecommendedRecipes starterId={id} starterName={name} />
          
          {/* Additional info */}
          <div className="mt-12 pt-6 border-t border-gray-200 text-sm text-gray-600">
            <p>Each starter is shipped in a sealed container at peak activity, ready to use immediately or refrigerate until needed. All starters come with detailed care instructions specific to their variety, guaranteeing your success with these unique cultures.</p>
          </div>
        </div>
      </article>
    </div>
  );
}