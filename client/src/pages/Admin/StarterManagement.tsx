import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Pencil, Trash2, Plus, RefreshCw, HelpCircle, CheckCircle2, Award, Settings } from 'lucide-react';

interface Starter {
  id: number;
  name: string;
  slug: string;
  description: string;
  mainFlour?: string;
  flourMix?: Record<string, number>;
  flavor?: Record<string, number> | string;
  maintenance?: { difficulty: string; feeding_schedule: string } | Record<string, any>;
  imageUrl: string;
  price: string | number;
  inStock?: boolean;
  badge?: string;
  featured: boolean;
  createdAt?: string;
  updatedAt?: string;
  rating?: number | null;
}

interface StarterFormData {
  name: string;
  slug: string;
  description: string;
  careInstructions: string;
  originStory: string;
  flavorProfile: string;
  maintenanceLevel: string;
  imageUrl: string;
  price: number;
  stock: number;
  category: string;
  featured: boolean;
}

const defaultStarter: StarterFormData = {
  name: '',
  slug: '',
  description: '',
  careInstructions: '',
  originStory: '',
  flavorProfile: '',
  maintenanceLevel: 'medium',
  imageUrl: '/images/starters/default-starter.jpg',
  price: 15.99,
  stock: 10,
  category: 'sourdough',
  featured: false,
};

export default function StarterManagement() {
  const [starters, setStarters] = useState<Starter[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<StarterFormData>(defaultStarter);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Load all starters
  const fetchStarters = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/starters');
      if (!response.ok) {
        throw new Error('Failed to fetch starters');
      }
      const data = await response.json();
      setStarters(data);
    } catch (error) {
      console.error('Error fetching starters:', error);
      toast({
        title: 'Error',
        description: 'Failed to load starters',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStarters();
  }, []);

  // Create slug from name
  const generateSlug = (name: string): string => {
    return name.toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    let parsedValue: string | number | boolean = value;
    
    // Convert number inputs to actual numbers
    if (type === 'number') {
      parsedValue = parseFloat(value);
    }
    
    // Handle name changes with slug generation in a single state update
    if (name === 'name') {
      setFormData({
        ...formData,
        name: value,
        slug: generateSlug(value)
      });
    } else {
      // Handle all other input changes
      setFormData({
        ...formData,
        [name]: parsedValue,
      });
    }
  };

  // Handle checkbox changes
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked,
    });
  };

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Reset form to default values
  const resetForm = () => {
    setFormData(defaultStarter);
    setEditingId(null);
  };

  // Open dialog for editing
  const handleEdit = (starter: Starter) => {
    // Extract maintenance level from starter maintenance object
    const maintenanceLevel = typeof starter.maintenance === 'object' && 
      starter.maintenance?.difficulty ? 
      starter.maintenance.difficulty : 'medium';
    
    // Extract flavor profile as a string
    let flavorProfile = '';
    if (typeof starter.flavor === 'object' && starter.flavor) {
      flavorProfile = Object.keys(starter.flavor).join(', ');
    } else if (typeof starter.flavor === 'string') {
      flavorProfile = starter.flavor;
    }
    
    // Convert price to number if it's a string (remove $ sign)
    let price = typeof starter.price === 'number' ? 
      starter.price : 
      parseFloat(String(starter.price).replace(/[^0-9.]/g, '')) || 15.99;
    
    setFormData({
      name: starter.name,
      slug: starter.slug,
      description: starter.description,
      careInstructions: '', // These fields don't exist in the data model
      originStory: '',      // so we set them to empty values
      flavorProfile: flavorProfile,
      maintenanceLevel: maintenanceLevel,
      imageUrl: starter.imageUrl,
      price: price,
      stock: starter.inStock ? 10 : 0, // Use inStock to determine stock level
      category: 'specialty', // Default category as it doesn't exist in the model
      featured: starter.featured,
    });
    setEditingId(starter.id);
    setIsDialogOpen(true);
  };

  // Open dialog for adding new starter
  const handleAdd = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  // Submit form for create/update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Transform form data to match database schema
      const flavorObj: Record<string, number> = {};
      formData.flavorProfile.split(',').forEach(flavor => {
        const trimmed = flavor.trim();
        if (trimmed) {
          flavorObj[trimmed] = 5; // Default to highest intensity
        }
      });
      
      // Create maintenance object
      const maintenanceObj = {
        difficulty: formData.maintenanceLevel,
        feeding_schedule: formData.maintenanceLevel === 'low' 
          ? 'every 24-48 hours' 
          : formData.maintenanceLevel === 'medium'
            ? 'every 12-24 hours'
            : 'every 8-12 hours'
      };
      
      // Format price as a string with $ sign
      const priceStr = `$${parseFloat(formData.price.toString()).toFixed(2)}`;
      
      // Create payload that matches the database schema
      const starterPayload = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        price: priceStr,
        imageUrl: formData.imageUrl,
        inStock: formData.stock > 0,
        featured: formData.featured,
        mainFlour: 'wheat', // Default values
        flourMix: { wheat: 100 },
        flavor: flavorObj, 
        maintenance: maintenanceObj,
        badge: formData.category.toUpperCase(),
        // The following fields should be auto-generated on the server side
        // createdAt, updatedAt, etc.
      };
      
      let response;
      
      if (editingId) {
        // Update existing starter
        response = await fetch(`/api/starters/${editingId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(starterPayload),
        });
      } else {
        // Create new starter
        response = await fetch('/api/starters', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(starterPayload),
        });
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save starter');
      }
      
      // Success
      toast({
        title: editingId ? 'Starter Updated' : 'Starter Created',
        description: `Successfully ${editingId ? 'updated' : 'created'} "${formData.name}"`,
      });
      
      // Close dialog and refresh data
      setIsDialogOpen(false);
      fetchStarters();
      resetForm();
      
    } catch (error) {
      console.error('Error saving starter:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save starter',
        variant: 'destructive',
      });
    }
  };

  // Delete a starter
  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }
    
    try {
      const response = await fetch(`/api/starters/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete starter');
      }
      
      // Success
      toast({
        title: 'Starter Deleted',
        description: `"${name}" has been deleted`,
      });
      
      // Refresh data
      fetchStarters();
      
    } catch (error) {
      console.error('Error deleting starter:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete starter',
        variant: 'destructive',
      });
    }
  };

  // Define state for quiz settings tab
  const [activeTab, setActiveTab] = useState("starters");
  const [quizEnabledStarters, setQuizEnabledStarters] = useState<number[]>([]);
  const [quizSettings, setQuizSettings] = useState({
    defaultStarter: 0,
    quizPromptTemplate: "You are a sourdough starter expert helping customers find their perfect starter culture match.\n\nBased on these user preferences and available starter options, recommend the best matching sourdough starter:\n\n{{quizData}}\n\nAnalyze their preferences for flavor, baking frequency, experience level, and environment to find the best match.\n\nReturn your recommendation in this JSON format:\n{\n  \"primaryMatch\": \"starter-id-from-availableStarters\",\n  \"matchScore\": number from 85-98 representing confidence in the match,\n  \"secondaryMatches\": [\"array-of-2-other-starter-ids-that-are-good-matches\"],\n  \"rationale\": {\n    \"flavor\": number from 70-95 representing flavor match score,\n    \"maintenance\": number from 70-95 representing maintenance match score,\n    \"style\": number from 70-95 representing bread style match score,\n    \"experience\": number from 70-95 representing experience level match score\n  }\n}",
    showResultsImmediately: true
  });

  // Load quiz settings
  const fetchQuizSettings = async () => {
    try {
      const response = await fetch('/api/quiz/settings');
      if (!response.ok) {
        throw new Error('Failed to fetch quiz settings');
      }
      const data = await response.json();
      
      setQuizEnabledStarters(data.enabledStarters || []);
      setQuizSettings({
        defaultStarter: data.defaultStarter || 0,
        quizPromptTemplate: data.quizPromptTemplate || '',
        showResultsImmediately: data.showResultsImmediately !== undefined ? data.showResultsImmediately : true
      });
    } catch (error) {
      console.error('Error fetching quiz settings:', error);
      // If there's an error, initialize with specialty starters
      if (starters.length > 0) {
        const enabledStarters = starters
          .filter(starter => starter.badge === "SPECIALTY")
          .map(starter => starter.id);
        setQuizEnabledStarters(enabledStarters);
        
        // Set a default starter if one hasn't been set
        if (quizSettings.defaultStarter === 0 && enabledStarters.length > 0) {
          setQuizSettings(prev => ({ ...prev, defaultStarter: enabledStarters[0] }));
        }
      }
      
      toast({
        title: "Failed to load quiz settings",
        description: "Using default quiz settings instead",
        variant: "destructive"
      });
    }
  };
  
  useEffect(() => {
    if (starters.length > 0) {
      fetchQuizSettings();
    }
  }, [starters]);

  // Toggle quiz starter inclusion
  const toggleQuizStarter = (id: number) => {
    setQuizEnabledStarters(prev => {
      if (prev.includes(id)) {
        return prev.filter(starterId => starterId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Set default quiz starter
  const setDefaultQuizStarter = (id: number) => {
    setQuizSettings(prev => ({ ...prev, defaultStarter: id }));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Sourdough Starter Management</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={fetchStarters}
            className="flex items-center gap-2"
            disabled={loading}
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button 
            onClick={handleAdd} 
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Starter
          </Button>
        </div>
      </div>

      <Tabs defaultValue="starters" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="starters" className="flex items-center">
            <Settings className="w-4 h-4 mr-2" />
            Manage Starters
          </TabsTrigger>
          <TabsTrigger value="quiz" className="flex items-center">
            <HelpCircle className="w-4 h-4 mr-2" />
            Quiz Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="starters" className="space-y-4">
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Flavor Profile</TableHead>
                      <TableHead>Maintenance</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Featured</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {starters.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                          No starters found. Add your first starter.
                        </TableCell>
                      </TableRow>
                    ) : (
                      starters.map((starter) => (
                        <TableRow key={starter.id}>
                          <TableCell className="font-medium">{starter.name}</TableCell>
                          <TableCell>{typeof starter.flavor === 'object' ? Object.keys(starter.flavor || {}).join(', ') : 
                            typeof starter.flavor === 'string' ? starter.flavor : 'N/A'}</TableCell>
                          <TableCell>{starter.maintenance?.difficulty || 'N/A'}</TableCell>
                          <TableCell>${typeof starter.price === 'number' ? starter.price.toFixed(2) : starter.price}</TableCell>
                          <TableCell>{starter.inStock ? 'In Stock' : 'Out of Stock'}</TableCell>
                          <TableCell>{starter.featured ? 'Yes' : 'No'}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleEdit(starter)}
                                title="Edit"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleDelete(starter.id, starter.name)}
                                title="Delete"
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="quiz" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sourdough Starter Quiz Settings</CardTitle>
              <CardDescription>
                Configure which starters appear in the quiz results and their priorities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Available Starters for Quiz</h3>
                <p className="text-sm text-muted-foreground">
                  Enable or disable starters that can appear in the quiz results. The quiz will match user preferences
                  with the enabled starters only.
                </p>
                
                <div className="space-y-2">
                  {loading ? (
                    <div className="flex justify-center p-4">
                      <div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full"></div>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Flavor Profile</TableHead>
                          <TableHead>Maintenance</TableHead>
                          <TableHead>Include in Quiz</TableHead>
                          <TableHead>Set as Default</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {starters.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                              No starters found. Add starters first.
                            </TableCell>
                          </TableRow>
                        ) : (
                          starters.map((starter) => (
                            <TableRow key={starter.id} className={quizEnabledStarters.includes(starter.id) ? "bg-muted/30" : ""}>
                              <TableCell className="font-medium">
                                {starter.name}
                                {quizSettings.defaultStarter === starter.id && (
                                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                                    Default
                                  </span>
                                )}
                              </TableCell>
                              <TableCell>{typeof starter.flavor === 'object' ? Object.keys(starter.flavor || {}).join(', ') : 
                                typeof starter.flavor === 'string' ? starter.flavor : 'N/A'}</TableCell>
                              <TableCell>{starter.maintenance?.difficulty || 'N/A'}</TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <Switch 
                                    id={`quiz-enable-${starter.id}`}
                                    checked={quizEnabledStarters.includes(starter.id)}
                                    onCheckedChange={() => toggleQuizStarter(starter.id)}
                                  />
                                  <Label htmlFor={`quiz-enable-${starter.id}`} className="cursor-pointer">
                                    {quizEnabledStarters.includes(starter.id) ? "Included" : "Excluded"}
                                  </Label>
                                </div>
                              </TableCell>
                              <TableCell>
                                {quizEnabledStarters.includes(starter.id) && (
                                  <Button 
                                    variant={quizSettings.defaultStarter === starter.id ? "secondary" : "outline"} 
                                    size="sm"
                                    onClick={() => setDefaultQuizStarter(starter.id)}
                                    disabled={quizSettings.defaultStarter === starter.id}
                                    className="flex items-center gap-1"
                                  >
                                    {quizSettings.defaultStarter === starter.id ? (
                                      <>
                                        <CheckCircle2 className="h-4 w-4 mr-1" />
                                        Default
                                      </>
                                    ) : (
                                      <>
                                        <Award className="h-4 w-4 mr-1" />
                                        Set as Default
                                      </>
                                    )}
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t">
                <h3 className="text-lg font-semibold">Quiz Prompt Template</h3>
                <p className="text-sm text-muted-foreground">
                  Edit the AI prompt template used for matching user preferences to starters.
                  Use the <code>{"{{quizData}}"}</code> placeholder to insert quiz answers.
                </p>
                
                <Textarea
                  value={quizSettings.quizPromptTemplate}
                  onChange={(e) => setQuizSettings(prev => ({ 
                    ...prev, 
                    quizPromptTemplate: e.target.value 
                  }))}
                  className="font-mono text-sm h-60"
                  placeholder="Enter the AI prompt template here..."
                />
                
                <div className="bg-amber-50 p-4 rounded-md">
                  <h4 className="text-amber-800 font-medium mb-2">Template Guidelines</h4>
                  <ul className="text-sm space-y-1 text-amber-800">
                    <li>• Always use <code>{"{{quizData}}"}</code> placeholder to insert user answers.</li>
                    <li>• Ensure the AI returns a JSON response with "primaryMatch" and "secondaryMatches".</li>
                    <li>• The starter IDs in the response should match actual starter IDs.</li>
                    <li>• Keep instructions clear and specific for best matching results.</li>
                  </ul>
                </div>
              </div>

              <div className="pt-6 flex justify-end">
                <Button 
                  className="flex items-center gap-2"
                  onClick={async () => {
                    try {
                      // Save the quiz settings via API
                      const response = await fetch('/api/quiz/settings', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          enabledStarters: quizEnabledStarters,
                          defaultStarter: quizSettings.defaultStarter,
                          quizPromptTemplate: quizSettings.quizPromptTemplate,
                          showResultsImmediately: quizSettings.showResultsImmediately
                        }),
                      });
                      
                      if (!response.ok) {
                        throw new Error('Failed to save quiz settings');
                      }
                      
                      toast({
                        title: "Quiz Settings Saved",
                        description: "Your changes to the quiz settings have been saved.",
                      });
                    } catch (error) {
                      console.error('Error saving quiz settings:', error);
                      toast({
                        title: "Error",
                        description: "Failed to save quiz settings. Please try again.",
                        variant: "destructive",
                      });
                    }
                  }}
                >
                  Save Quiz Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) {
          // When dialog is closed, reset the form to prevent state updates on unmounted components
          resetForm();
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto admin-content">
          <DialogHeader>
            <DialogTitle>
              {editingId ? `Edit ${formData.name}` : 'Add New Starter'}
            </DialogTitle>
            <DialogDescription>
              {editingId ? 'Update the details of this starter' : 'Create a new sourdough starter'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">Name</label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="slug" className="text-sm font-medium">Slug</label>
                <Input
                  id="slug"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">Description</label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                required
              />
            </div>
            
            {/* Flavor & Maintenance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="flavorProfile" className="text-sm font-medium">Flavor Profile</label>
                <Input
                  id="flavorProfile"
                  name="flavorProfile"
                  value={formData.flavorProfile}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="maintenanceLevel" className="text-sm font-medium">Maintenance Level</label>
                <Select 
                  value={formData.maintenanceLevel}
                  onValueChange={(value) => handleSelectChange('maintenanceLevel', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select maintenance level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low (Easy)</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High (Demanding)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Care Instructions */}
            <div className="space-y-2">
              <label htmlFor="careInstructions" className="text-sm font-medium">Care Instructions</label>
              <Textarea
                id="careInstructions"
                name="careInstructions"
                value={formData.careInstructions}
                onChange={handleInputChange}
                rows={4}
                required
              />
            </div>
            
            {/* Origin Story */}
            <div className="space-y-2">
              <label htmlFor="originStory" className="text-sm font-medium">Origin Story</label>
              <Textarea
                id="originStory"
                name="originStory"
                value={formData.originStory}
                onChange={handleInputChange}
                rows={4}
              />
            </div>
            
            {/* Product Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label htmlFor="price" className="text-sm font-medium">Price ($)</label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="inStock" className="text-sm font-medium">Stock Status</label>
                <div className="flex items-center space-x-2 h-full">
                  <input
                    type="checkbox"
                    id="inStock"
                    name="inStock"
                    checked={formData.stock > 0}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        stock: e.target.checked ? 10 : 0, // Set to 10 if checked, 0 if not
                      });
                    }}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="inStock" className="text-sm font-medium">
                    In Stock
                  </label>
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="category" className="text-sm font-medium">Category</label>
                <Select 
                  value={formData.category}
                  onValueChange={(value) => handleSelectChange('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="classic">Classic</SelectItem>
                    <SelectItem value="specialty">Specialty</SelectItem>
                    <SelectItem value="regional">Regional</SelectItem>
                    <SelectItem value="modern">Modern</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Image & Featured Flag */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="imageUrl" className="text-sm font-medium">Image URL</label>
                <Input
                  id="imageUrl"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="flex items-center space-x-2 h-full pt-6">
                <input
                  type="checkbox"
                  id="featured"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="featured" className="text-sm font-medium">
                  Featured Starter (display on homepage)
                </label>
              </div>
            </div>
            
            {/* Form Actions */}
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingId ? 'Update Starter' : 'Create Starter'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}