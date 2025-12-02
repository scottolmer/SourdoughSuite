import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ArrowRight, 
  Scale, 
  Clock,
  Wheat,
  Layers, 
  Droplet, 
  FlaskConical 
} from "lucide-react";

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="py-14 md:py-20 bg-gradient-to-b from-amber-50 to-white border-b border-amber-100">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center mb-6 px-3 py-1 bg-amber-100 rounded-full">
                <Wheat size={16} className="text-amber-600 mr-2" />
                <span className="text-amber-700 text-sm font-medium">Artisan Sourdough Expertise</span>
              </div>
              <h1 className="tracking-tight text-[#2B2B2B] mb-6 text-4xl md:text-5xl font-serif leading-tight">
                Your Authority in<br />Specialty Sourdough
              </h1>
              <p className="text-[#6E6E6E] mb-8 text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Discover a new world of flavor with our unique starter cultures, expert guidance, and powerful baking tools.
              </p>
              {/* Buttons removed as requested */}
            </div>
            <div className="hidden lg:block rounded-sm overflow-hidden shadow-md border border-amber-100">
              <img 
                src="https://images.unsplash.com/photo-1613451771040-42070e1a7edf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
                alt="Artisan sourdough bread" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* Featured Starters */}
      <section className="py-14 px-4 md:px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-baseline mb-6">
            <div>
              <div className="text-amber-600 font-medium text-sm mb-2">OUR COLLECTION</div>
              <h2 className="text-[#2B2B2B] text-3xl md:text-4xl font-serif tracking-tight mb-4 md:mb-2">
                Specialty Sourdough Starters
              </h2>
              <p className="text-[#6E6E6E] max-w-2xl mb-4">
                Carefully cultivated cultures from around the world, each with its own unique flavor profile and baking characteristics.
              </p>
            </div>
            <Link href="/shop">
              <span className="text-amber-600 font-medium flex items-center text-sm hover:text-amber-700 transition-colors cursor-pointer">
                View catalogue <ArrowRight size={14} className="ml-1" />
              </span>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {/* Koji Starter */}
            <Link href="/starter/koji-starter">
              <div className="group cursor-pointer">
                <Card className="overflow-hidden rounded-sm border-gray-100 card shadow-none hover:shadow-md transition-shadow">
                  <div className="h-60 bg-[#F5F5F5] flex items-center justify-center relative overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1573333515743-56d57731dd1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
                      alt="Koji Starter" 
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute bottom-2 left-2 text-xs font-mono tracking-tight text-white bg-black bg-opacity-50 px-1">
                      KOJI-01
                    </div>
                  </div>
                  <CardContent className="pt-6 px-4">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-serif font-medium text-[#2B2B2B]">Koji Starter</h3>
                      <span className="bg-[#F5F5F5] text-[#2B2B2B] text-xs px-2 py-1 rounded-none font-mono">BESTSELLER</span>
                    </div>
                    <p className="text-sm text-[#6E6E6E] mb-4 leading-relaxed">
                      Japanese-inspired culture with subtle umami notes and exceptional enzymatic activity.
                    </p>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                      <span className="metric-display text-[#2B2B2B] font-medium">$18.99</span>
                      <span className="text-sm text-amber-600 font-medium group-hover:text-amber-700 transition-colors">
                        View Details →
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </Link>
            
            {/* San Francisco Starter */}
            <Link href="/starter/san-francisco-starter">
              <div className="group cursor-pointer">
                <Card className="overflow-hidden rounded-sm border-gray-100 card shadow-none hover:shadow-md transition-shadow">
                  <div className="h-60 bg-[#F5F5F5] flex items-center justify-center relative overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1586444248902-2f64eddc13df?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
                      alt="San Francisco Starter" 
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute bottom-2 left-2 text-xs font-mono tracking-tight text-white bg-black bg-opacity-50 px-1">
                      SF-01
                    </div>
                  </div>
                  <CardContent className="pt-6 px-4">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-serif font-medium text-[#2B2B2B]">San Francisco Style Starter</h3>
                      <span className="bg-[#F5F5F5] text-[#2B2B2B] text-xs px-2 py-1 rounded-none font-mono">CLASSIC</span>
                    </div>
                    <p className="text-sm text-[#6E6E6E] mb-4 leading-relaxed">
                      Traditional tangy flavor profile with the perfect balance of acidity and complexity.
                    </p>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                      <span className="metric-display text-[#2B2B2B] font-medium">$15.99</span>
                      <span className="text-sm text-amber-600 font-medium group-hover:text-amber-700 transition-colors">
                        View Details →
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </Link>
            
            {/* Traditional Rye Starter */}
            <Link href="/starter/traditional-rye-starter">
              <div className="group cursor-pointer">
                <Card className="overflow-hidden rounded-sm border-gray-100 card shadow-none hover:shadow-md transition-shadow">
                  <div className="h-60 bg-[#F5F5F5] flex items-center justify-center relative overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1509440159596-0249088772ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
                      alt="Traditional Rye Sourdough Starter" 
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute bottom-2 left-2 text-xs font-mono tracking-tight text-white bg-black bg-opacity-50 px-1">
                      RYE-08
                    </div>
                  </div>
                  <CardContent className="pt-6 px-4">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-serif font-medium text-[#2B2B2B]">Traditional Rye Starter</h3>
                      <span className="bg-[#F5F5F5] text-[#2B2B2B] text-xs px-2 py-1 rounded-none font-mono">SPECIALTY</span>
                    </div>
                    <p className="text-sm text-[#6E6E6E] mb-4 leading-relaxed">
                      Traditional European-style starter that creates deep, earthy flavors with dense, hearty crumb.
                    </p>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                      <span className="metric-display text-[#2B2B2B] font-medium">$22.00</span>
                      <span className="text-sm text-amber-600 font-medium group-hover:text-amber-700 transition-colors">
                        View Details →
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </Link>
            
            {/* Classic Sourdough Starter */}
            <Link href="/starter/classic-sourdough-starter">
              <div className="group cursor-pointer">
                <Card className="overflow-hidden rounded-sm border-gray-100 card shadow-none hover:shadow-md transition-shadow">
                  <div className="h-60 bg-[#F5F5F5] flex items-center justify-center relative overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
                      alt="Classic Sourdough Starter" 
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute bottom-2 left-2 text-xs font-mono tracking-tight text-white bg-black bg-opacity-50 px-1">
                      HB-01
                    </div>
                  </div>
                  <CardContent className="pt-6 px-4">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-serif font-medium text-[#2B2B2B]">Classic Sourdough Starter</h3>
                      <span className="bg-[#F5F5F5] text-[#2B2B2B] text-xs px-2 py-1 rounded-none font-mono">VERSATILE</span>
                    </div>
                    <p className="text-sm text-[#6E6E6E] mb-4 leading-relaxed">
                      Our signature blend combining elements from our specialty starters for versatility and reliability.
                    </p>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                      <span className="metric-display text-[#2B2B2B] font-medium">$14.99</span>
                      <span className="text-sm text-amber-600 font-medium group-hover:text-amber-700 transition-colors">
                        View Details →
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Interactive Tools Section */}
      <section className="py-14 px-4 md:px-6 bg-gradient-to-b from-white to-amber-50 border-t border-amber-100">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="text-amber-600 font-medium text-sm mb-2">EXPERT TOOLS</div>
            <h2 className="text-[#2B2B2B] text-3xl md:text-4xl font-serif tracking-tight mb-3">
              Interactive Sourdough Tools
            </h2>
            <p className="text-[#6E6E6E] max-w-3xl">
              Precision tools designed to help you analyze, optimize, and perfect your sourdough baking process.
              Each tool addresses a specific aspect of artisan bread making.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Texture & Structure Designer */}
            <Card className="rounded-sm border-amber-100 shadow-sm overflow-hidden hover:shadow-md transition-all">
              <div className="h-40 bg-gradient-to-br from-amber-50 to-white flex items-center justify-center relative">
                <Layers size={40} className="text-amber-500" />
                <div className="absolute bottom-2 left-2 text-xs font-mono tracking-tight text-amber-700">
                  TOOL-01
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="text-xl font-serif font-medium text-[#2B2B2B] mb-1">Texture Designer</h3>
                <p className="text-sm text-[#6E6E6E] mb-4 leading-relaxed">
                  Design your ideal crumb structure and crust characteristics for the perfect bread texture.
                </p>
                <Link href="/tools?tab=texture-designer">
                  <Button variant="outline" className="w-full border-amber-600 text-amber-700 hover:bg-amber-50 rounded-sm">
                    Design Texture Profile
                  </Button>
                </Link>
              </CardContent>
            </Card>
            
            {/* Recipe Validator */}
            <Card className="rounded-sm border-amber-100 shadow-sm overflow-hidden hover:shadow-md transition-all">
              <div className="h-40 bg-gradient-to-br from-amber-50 to-white flex items-center justify-center relative">
                <Scale size={40} className="text-amber-500" />
                <div className="absolute bottom-2 left-2 text-xs font-mono tracking-tight text-amber-700">
                  TOOL-02
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="text-xl font-serif font-medium text-[#2B2B2B] mb-1">Recipe Validator</h3>
                <p className="text-sm text-[#6E6E6E] mb-4 leading-relaxed">
                  Check your sourdough recipes for technical accuracy and get personalized suggestions for improvement.
                </p>
                <Link href="/tools/recipe-validator">
                  <Button variant="outline" className="w-full border-amber-600 text-amber-700 hover:bg-amber-50 rounded-sm">
                    Validate a Recipe
                  </Button>
                </Link>
              </CardContent>
            </Card>
            
            {/* Flavor Designer */}
            <Card className="rounded-sm border-amber-100 shadow-sm overflow-hidden hover:shadow-md transition-all">
              <div className="h-40 bg-gradient-to-br from-amber-50 to-white flex items-center justify-center relative">
                <Droplet size={40} className="text-amber-500" />
                <div className="absolute bottom-2 left-2 text-xs font-mono tracking-tight text-amber-700">
                  TOOL-03
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="text-xl font-serif font-medium text-[#2B2B2B] mb-1">Flavor Designer</h3>
                <p className="text-sm text-[#6E6E6E] mb-4 leading-relaxed">
                  Create your perfect flavor profile with interactive flavor mapping and customization tools.
                </p>
                <Link href="/tools?tab=flavor-designer">
                  <Button variant="outline" className="w-full border-amber-600 text-amber-700 hover:bg-amber-50 rounded-sm">
                    Design Flavor Profile
                  </Button>
                </Link>
              </CardContent>
            </Card>
            
            {/* Starter Quiz */}
            <Card className="rounded-sm border-amber-100 shadow-sm overflow-hidden hover:shadow-md transition-all">
              <div className="h-40 bg-gradient-to-br from-amber-50 to-white flex items-center justify-center relative">
                <FlaskConical size={40} className="text-amber-500" />
                <div className="absolute bottom-2 left-2 text-xs font-mono tracking-tight text-amber-700">
                  TOOL-04
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="text-xl font-serif font-medium text-[#2B2B2B] mb-1">Starter Quiz</h3>
                <p className="text-sm text-[#6E6E6E] mb-4 leading-relaxed">
                  Find your perfect sourdough starter match by taking our interactive quiz about your preferences.
                </p>
                <Link href="/tools?tab=starter-quiz">
                  <Button variant="outline" className="w-full border-amber-600 text-amber-700 hover:bg-amber-50 rounded-sm">
                    Find Your Starter
                  </Button>
                </Link>
              </CardContent>
            </Card>
            
            {/* Baking Timeline */}
            <Card className="rounded-sm border-amber-100 shadow-sm overflow-hidden hover:shadow-md transition-all">
              <div className="h-40 bg-gradient-to-br from-amber-50 to-white flex items-center justify-center relative">
                <Clock size={40} className="text-amber-500" />
                <div className="absolute bottom-2 left-2 text-xs font-mono tracking-tight text-amber-700">
                  TOOL-05
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="text-xl font-serif font-medium text-[#2B2B2B] mb-1">Baking Timeline</h3>
                <p className="text-sm text-[#6E6E6E] mb-4 leading-relaxed">
                  Create a personalized baking schedule that works backward from when you want your bread to be ready.
                </p>
                <Link href="/tools?tab=timeline-calculator">
                  <Button variant="outline" className="w-full border-amber-600 text-amber-700 hover:bg-amber-50 rounded-sm">
                    Plan Your Bake
                  </Button>
                </Link>
              </CardContent>
            </Card>
            
            {/* Bread Recommendation Engine */}
            <Card className="rounded-sm border-amber-100 shadow-sm overflow-hidden hover:shadow-md transition-all">
              <div className="h-40 bg-gradient-to-br from-amber-50 to-white flex items-center justify-center relative">
                <FlaskConical size={40} className="text-amber-500" />
                <div className="absolute bottom-2 left-2 text-xs font-mono tracking-tight text-amber-700">
                  TOOL-06
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="text-xl font-serif font-medium text-[#2B2B2B] mb-1">Recommendation Engine</h3>
                <p className="text-sm text-[#6E6E6E] mb-4 leading-relaxed">
                  Find your perfect bread match by defining your preferred texture and flavor characteristics.
                </p>
                <Link href="/recommend">
                  <Button variant="outline" className="w-full border-amber-600 text-amber-700 hover:bg-amber-50 rounded-sm">
                    Find Your Bread Match
                  </Button>
                </Link>
              </CardContent>
            </Card>
            
            {/* View All Tools */}
            <Card className="rounded-sm bg-gradient-to-br from-amber-100/50 to-amber-50 border-dashed border-amber-200 shadow-sm overflow-hidden hover:shadow-md transition-all">
              <div className="h-full p-4 flex flex-col justify-center">
                <div className="mb-4 flex justify-center">
                  <div className="h-14 w-14 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center">
                    <ArrowRight size={24} className="text-amber-600" />
                  </div>
                </div>
                <h3 className="text-xl font-serif font-medium text-[#2B2B2B] mb-1 text-center">Explore All Tools</h3>
                <p className="text-sm text-[#6E6E6E] mb-4 leading-relaxed text-center">
                  Discover our complete suite of baking tools designed for professional-level precision.
                </p>
                <Link href="/tools">
                  <Button className="w-full bg-[#D97706] hover:bg-amber-700 text-white rounded-sm">
                    View All Tools
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </section>
      
      {/* Newsletter section removed as requested */}
    </>
  );
}