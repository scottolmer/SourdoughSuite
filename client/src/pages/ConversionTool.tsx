import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MobileLayout } from '@/components/mobile-layout';
import { ArrowRightLeft, Scale, Coffee, Thermometer, Timer } from 'lucide-react';
import { SEO } from '@/components/SEO';

interface ConversionCategory {
  id: string;
  name: string;
  icon: any;
  color: string;
  conversions: ConversionType[];
}

interface ConversionType {
  id: string;
  name: string;
  fromUnit: string;
  toUnit: string;
  factor: number;
  precision: number;
}

const CONVERSION_CATEGORIES: ConversionCategory[] = [
  {
    id: 'weight',
    name: 'Weight',
    icon: Scale,
    color: 'blue',
    conversions: [
      { id: 'oz-g', name: 'Ounces to Grams', fromUnit: 'oz', toUnit: 'g', factor: 28.3495, precision: 1 },
      { id: 'g-oz', name: 'Grams to Ounces', fromUnit: 'g', toUnit: 'oz', factor: 0.035274, precision: 2 },
      { id: 'lb-kg', name: 'Pounds to Kilograms', fromUnit: 'lb', toUnit: 'kg', factor: 0.453592, precision: 2 },
      { id: 'kg-lb', name: 'Kilograms to Pounds', fromUnit: 'kg', toUnit: 'lb', factor: 2.20462, precision: 2 },
      { id: 'lb-g', name: 'Pounds to Grams', fromUnit: 'lb', toUnit: 'g', factor: 453.592, precision: 0 },
      { id: 'g-lb', name: 'Grams to Pounds', fromUnit: 'g', toUnit: 'lb', factor: 0.00220462, precision: 3 }
    ]
  },
  {
    id: 'volume',
    name: 'Volume',
    icon: Coffee,
    color: 'green',
    conversions: [
      { id: 'cup-ml', name: 'Cups to Milliliters', fromUnit: 'cup', toUnit: 'ml', factor: 236.588, precision: 0 },
      { id: 'ml-cup', name: 'Milliliters to Cups', fromUnit: 'ml', toUnit: 'cup', factor: 0.00422675, precision: 3 },
      { id: 'floz-ml', name: 'Fluid Ounces to Milliliters', fromUnit: 'fl oz', toUnit: 'ml', factor: 29.5735, precision: 1 },
      { id: 'ml-floz', name: 'Milliliters to Fluid Ounces', fromUnit: 'ml', toUnit: 'fl oz', factor: 0.033814, precision: 2 },
      { id: 'tbsp-ml', name: 'Tablespoons to Milliliters', fromUnit: 'tbsp', toUnit: 'ml', factor: 14.7868, precision: 1 },
      { id: 'ml-tbsp', name: 'Milliliters to Tablespoons', fromUnit: 'ml', toUnit: 'tbsp', factor: 0.067628, precision: 2 },
      { id: 'tsp-ml', name: 'Teaspoons to Milliliters', fromUnit: 'tsp', toUnit: 'ml', factor: 4.92892, precision: 1 },
      { id: 'ml-tsp', name: 'Milliliters to Teaspoons', fromUnit: 'ml', toUnit: 'tsp', factor: 0.202884, precision: 2 },
      { id: 'qt-l', name: 'Quarts to Liters', fromUnit: 'qt', toUnit: 'L', factor: 0.946353, precision: 2 },
      { id: 'l-qt', name: 'Liters to Quarts', fromUnit: 'L', toUnit: 'qt', factor: 1.05669, precision: 2 }
    ]
  },
  {
    id: 'temperature',
    name: 'Temperature',
    icon: Thermometer,
    color: 'red',
    conversions: [
      { id: 'f-c', name: 'Fahrenheit to Celsius', fromUnit: '°F', toUnit: '°C', factor: 0, precision: 0 },
      { id: 'c-f', name: 'Celsius to Fahrenheit', fromUnit: '°C', toUnit: '°F', factor: 0, precision: 0 }
    ]
  },
  {
    id: 'time',
    name: 'Time',
    icon: Timer,
    color: 'purple',
    conversions: [
      { id: 'min-hr', name: 'Minutes to Hours', fromUnit: 'min', toUnit: 'hr', factor: 0.0166667, precision: 2 },
      { id: 'hr-min', name: 'Hours to Minutes', fromUnit: 'hr', toUnit: 'min', factor: 60, precision: 0 },
      { id: 'sec-min', name: 'Seconds to Minutes', fromUnit: 'sec', toUnit: 'min', factor: 0.0166667, precision: 2 },
      { id: 'min-sec', name: 'Minutes to Seconds', fromUnit: 'min', toUnit: 'sec', factor: 60, precision: 0 }
    ]
  }
];

function getColorClasses(color: string) {
  const colors = {
    blue: "bg-blue-50 border-blue-200 text-blue-700",
    green: "bg-green-50 border-green-200 text-green-700",
    red: "bg-red-50 border-red-200 text-red-700",
    purple: "bg-purple-50 border-purple-200 text-purple-700"
  };
  return colors[color as keyof typeof colors] || colors.blue;
}

export default function ConversionTool() {
  const [selectedCategory, setSelectedCategory] = useState<ConversionCategory>(CONVERSION_CATEGORIES[0]);
  const [selectedConversion, setSelectedConversion] = useState<ConversionType>(CONVERSION_CATEGORIES[0].conversions[0]);
  const [inputValue, setInputValue] = useState<string>('');
  const [result, setResult] = useState<string>('');

  const handleCategoryChange = (categoryId: string) => {
    const category = CONVERSION_CATEGORIES.find(c => c.id === categoryId);
    if (category) {
      setSelectedCategory(category);
      setSelectedConversion(category.conversions[0]);
      setInputValue('');
      setResult('');
    }
  };

  const handleConversionChange = (conversionId: string) => {
    const conversion = selectedCategory.conversions.find(c => c.id === conversionId);
    if (conversion) {
      setSelectedConversion(conversion);
      setInputValue('');
      setResult('');
    }
  };

  const convertValue = (value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) {
      setResult('');
      return;
    }

    let converted: number;
    
    // Special handling for temperature conversions
    if (selectedConversion.id === 'f-c') {
      converted = (num - 32) * 5/9;
    } else if (selectedConversion.id === 'c-f') {
      converted = (num * 9/5) + 32;
    } else {
      converted = num * selectedConversion.factor;
    }

    setResult(converted.toFixed(selectedConversion.precision));
  };

  const handleInputChange = (value: string) => {
    setInputValue(value);
    convertValue(value);
  };

  const swapConversion = () => {
    // Find the reverse conversion
    const reverseId = selectedConversion.id.split('-').reverse().join('-');
    const reverseConversion = selectedCategory.conversions.find(c => c.id === reverseId);
    
    if (reverseConversion) {
      setSelectedConversion(reverseConversion);
      // Swap input and result
      const newInput = result;
      setInputValue(newInput);
      convertValue(newInput);
    }
  };

  const clearAll = () => {
    setInputValue('');
    setResult('');
  };

  return (
    <MobileLayout title="Unit Converter" showBackButton backHref="/tools">
      <SEO
        title="Baking Unit Converter | Weight, Volume & Temperature Conversions"
        description="Convert between common baking units including ounces to grams, cups to milliliters, Fahrenheit to Celsius, and more. Essential tool for international recipes."
        keywords={['unit converter', 'baking conversions', 'ounces to grams', 'cups to ml', 'temperature converter', 'recipe conversion']}
      />
      
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-2xl font-bold">Unit Converter</h1>
          <p className="text-muted-foreground">
            Convert between common baking measurements for international recipes
          </p>
        </div>

        {/* Category Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <selectedCategory.icon className="h-5 w-5" />
              Conversion Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {CONVERSION_CATEGORIES.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory.id === category.id ? "default" : "outline"}
                  className="h-auto p-3 flex flex-col items-center gap-2"
                  onClick={() => handleCategoryChange(category.id)}
                >
                  <category.icon className="h-5 w-5" />
                  <span className="text-sm">{category.name}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Conversion Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Select Conversion</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedConversion.id} onValueChange={handleConversionChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {selectedCategory.conversions.map((conversion) => (
                  <SelectItem key={conversion.id} value={conversion.id}>
                    {conversion.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Converter Interface */}
        <Card className={getColorClasses(selectedCategory.color)}>
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  From ({selectedConversion.fromUnit})
                </label>
                <Input
                  type="number"
                  placeholder="Enter value"
                  value={inputValue}
                  onChange={(e) => handleInputChange(e.target.value)}
                  className="text-lg bg-white"
                />
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={swapConversion}
                  className="rounded-full"
                  disabled={!selectedCategory.conversions.find(c => c.id === selectedConversion.id.split('-').reverse().join('-'))}
                >
                  <ArrowRightLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" onClick={clearAll} size="sm">
                  Clear
                </Button>
              </div>

              {/* Result */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  To ({selectedConversion.toUnit})
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    value={result}
                    readOnly
                    className="text-lg font-semibold bg-white"
                    placeholder="Result will appear here"
                  />
                  {result && (
                    <Badge variant="secondary" className="absolute right-2 top-2">
                      Converted
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Reference */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Common {selectedCategory.name} Conversions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-2 text-sm">
              {selectedCategory.conversions.slice(0, 4).map((conversion) => (
                <div key={conversion.id} className="flex justify-between items-center p-2 bg-muted rounded">
                  <span>1 {conversion.fromUnit}</span>
                  <span className="text-muted-foreground">=</span>
                  <span className="font-medium">
                    {conversion.id.includes('f-c') ? '(°F - 32) × 5/9' :
                     conversion.id.includes('c-f') ? '(°C × 9/5) + 32' :
                     `${conversion.factor.toFixed(conversion.precision)} ${conversion.toUnit}`}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  );
}