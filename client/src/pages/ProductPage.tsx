import { useParams } from "wouter";
import { MobileLayout } from "@/components/mobile-layout";

// Products data (same as in ShopPage)
const products = [
  {
    id: 1,
    name: "San Francisco Classic",
    description: "Our most tangy and resilient sourdough starter.",
    price: "$15.99",
    slug: "san-francisco-classic",
    category: "Starters",
    longDescription: "The San Francisco Classic is our signature sourdough starter, cultivated from a 20-year-old mother culture. It produces a distinctively tangy flavor profile that's characteristic of traditional San Francisco sourdough bread. This starter is extremely resilient and easy to maintain, making it perfect for both beginners and experienced bakers."
  },
  {
    id: 2,
    name: "Ancient Grain Blend",
    description: "A versatile starter featuring a blend of ancient grains.",
    price: "$18.99",
    slug: "ancient-grain-blend",
    category: "Starters",
    longDescription: "Our Ancient Grain Blend sourdough starter is cultivated using a special mix of einkorn, emmer, and spelt flours. This blend creates a complex, nutty flavor profile that adds depth to your artisan breads. The culture has been carefully developed to work well with both ancient and modern grain varieties."
  },
  {
    id: 3,
    name: "Italian Country",
    description: "Mild and versatile starter perfect for Italian-style breads.",
    price: "$14.99",
    slug: "italian-country",
    category: "Starters",
    longDescription: "Inspired by traditional Italian bread making, our Italian Country starter culture produces a mild, slightly sweet flavor profile ideal for rustic Italian breads like ciabatta and focaccia. This versatile starter has been optimized for higher hydration doughs and creates an open, airy crumb structure."
  },
  {
    id: 4,
    name: "Modernist Bread",
    description: "The ultimate guide to bread baking.",
    price: "$125.00",
    slug: "modernist-bread",
    category: "Books",
    longDescription: "Modernist Bread is the definitive guide to the art and science of bread-making. This comprehensive, five-volume set covers the history, techniques, ingredients, and equipment behind artisanal bread production. With over 1,200 recipes and thousands of photographs, it's an essential resource for any serious baker."
  }
];

export function ProductPage() {
  // Get the slug parameter from the URL
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;
  
  // Find the product with the matching slug
  const product = products.find(p => p.slug === slug);
  
  // If no product is found, show a "not found" message
  if (!product) {
    return (
      <MobileLayout title="Product Not Found" showBackButton>
        <div style={{ 
          padding: '20px', 
          textAlign: 'center',
          color: '#666'
        }}>
          <h2 style={{ marginBottom: '10px' }}>Product Not Found</h2>
          <p>Sorry, the product you're looking for doesn't exist.</p>
        </div>
      </MobileLayout>
    );
  }
  
  return (
    <MobileLayout title={product.name} showBackButton>
      <div style={{ padding: '10px 0' }}>
        {/* Product header */}
        <div style={{ marginBottom: '20px' }}>
          <h1 style={{ 
            fontSize: '24px', 
            fontWeight: 'bold', 
            marginBottom: '5px' 
          }}>
            {product.name}
          </h1>
          <div style={{ 
            fontSize: '18px', 
            fontWeight: 'bold', 
            color: '#444',
            marginBottom: '10px'
          }}>
            {product.price}
          </div>
          <div style={{ 
            display: 'inline-block',
            padding: '4px 8px',
            backgroundColor: '#f3f4f6',
            borderRadius: '4px', 
            fontSize: '14px',
            color: '#666'
          }}>
            {product.category}
          </div>
        </div>
        
        {/* Product description */}
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ 
            fontSize: '18px', 
            fontWeight: '500',
            marginBottom: '10px'
          }}>
            Description
          </h2>
          <p style={{ 
            fontSize: '16px',
            lineHeight: '1.6',
            color: '#333'
          }}>
            {product.longDescription}
          </p>
        </div>
        
        {/* Add to cart button */}
        <button style={{
          width: '100%',
          padding: '12px 20px',
          backgroundColor: '#f97316',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          fontSize: '16px',
          fontWeight: '500',
          cursor: 'pointer'
        }}
        onClick={() => alert(`Added ${product.name} to cart!`)}
        >
          Add to Cart - {product.price}
        </button>
      </div>
    </MobileLayout>
  );
}