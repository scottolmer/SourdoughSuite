import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Loader2 } from "lucide-react";

interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: string;
  displayOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function Learn() {
  // Fetch published FAQs
  const { 
    data: faqs, 
    isLoading, 
    isError 
  } = useQuery({
    queryKey: ["/api/faqs/published"],
  });

  // Function to group FAQs by category
  const getFaqsByCategory = () => {
    if (!faqs || !Array.isArray(faqs)) return {} as Record<string, FAQ[]>;
    
    return (faqs as FAQ[]).reduce((acc: Record<string, FAQ[]>, faq: FAQ) => {
      const category = faq.category || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(faq);
      return acc;
    }, {} as Record<string, FAQ[]>);
  };

  const categorizedFaqs = getFaqsByCategory();
  
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-16">
      <div className="mb-12">
        <div className="flex items-center mb-2">
          <span className="text-xs font-mono text-[#6E6E6E] mr-2">LEARN.01</span>
          <div className="h-px bg-gray-300 flex-grow"></div>
        </div>
        <h1 className="text-[#2B2B2B] text-3xl md:text-4xl font-serif tracking-tight mb-6">
          Sourdough Knowledge Base
        </h1>
        <p className="text-[#6E6E6E] max-w-3xl mb-8 leading-relaxed">
          A comprehensive collection of scientific knowledge, traditional techniques, and practical insights 
          to enhance your artisanal bread making skills.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        <div className="md:col-span-1">
          <div className="sticky top-24">
            <div className="flex items-center mb-4">
              <span className="text-xs font-mono text-[#6E6E6E] mr-2">CATEGORIES</span>
              <div className="h-px bg-gray-200 w-20"></div>
            </div>
            <nav className="space-y-1">
              <a href="#faq" className="block py-2 border-l-2 border-[#2B2B2B] pl-4 text-[#2B2B2B] font-medium">
                FAQs
              </a>
            </nav>
          </div>
        </div>

        <div className="md:col-span-2">
          {/* FAQ Section - Dynamic from API */}
          <section id="faq" className="mb-16">
            <div className="flex items-center mb-6">
              <span className="text-xs font-mono text-[#6E6E6E] mr-2">MANUAL.01</span>
              <div className="h-px bg-gray-200 w-20"></div>
            </div>
            <h2 className="text-2xl font-serif text-[#2B2B2B] mb-6">Frequently Asked Questions</h2>
            
            {isLoading && (
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
              </div>
            )}
            
            {isError && (
              <div className="bg-red-50 text-red-800 p-6 rounded-md">
                <p>Failed to load FAQs. Please try refreshing the page.</p>
              </div>
            )}
            
            {!isLoading && !isError && Object.keys(categorizedFaqs).length === 0 && (
              <div className="bg-white border border-gray-100 p-8 text-center text-gray-500">
                <p>No FAQs available at this time.</p>
              </div>
            )}
            
            {Object.entries(categorizedFaqs).map(([category, faqList]: [string, FAQ[]]) => (
              <div key={category} className="mb-8">
                <h3 className="text-xl font-serif text-[#2B2B2B] mb-4 capitalize">{category}</h3>
                
                <div className="bg-white border border-gray-100 p-8">
                  <Accordion type="single" collapsible className="space-y-6">
                    {faqList.map((faq) => (
                      <AccordionItem key={faq.id} value={`faq-${faq.id}`} className="border-none">
                        <AccordionTrigger className="text-lg font-serif text-[#2B2B2B] hover:no-underline py-2 [&[data-state=open]]:text-[#D97706]">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-[#6E6E6E] leading-relaxed pt-4">
                          <p>{faq.answer}</p>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </div>
            ))}
          </section>
        </div>
      </div>
    </div>
  );
}