import { MobileLayout } from "@/components/mobile-layout";
import { useLocation } from "wouter";

// Products data with slugs for routing
const products = [
  {
    id: 1,
    name: "San Francisco Classic",
    description: "Our most tangy and resilient sourdough starter.",
    price: "$15.99",
    slug: "san-francisco-classic",
    category: "Starters"
  },
  {
    id: 2,
    name: "Ancient Grain Blend",
    description: "A versatile starter featuring a blend of ancient grains.",
    price: "$18.99",
    slug: "ancient-grain-blend",
    category: "Starters"
  },
  {
    id: 3,
    name: "Italian Country",
    description: "Mild and versatile starter perfect for Italian-style breads.",
    price: "$14.99",
    slug: "italian-country",
    category: "Starters"
  },
  {
    id: 4,
    name: "Modernist Bread",
    description: "The ultimate guide to bread baking.",
    price: "$125.00",
    slug: "modernist-bread",
    category: "Books"
  }
];

// Ultra simple product listing that should work on any device
export function ShopPage() {
  const [_, navigate] = useLocation();
  
  // Function to handle product click
  const handleProductClick = (slug: string) => {
    navigate(`/products/${slug}`);
  };

  return (
    <MobileLayout title="Starter Shop" showBackButton>
      <div style={{ padding: '10px 0' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
          Shop
        </h1>
        
        <div style={{ marginBottom: '20px' }}>
          <select 
            style={{ 
              width: '100%', 
              padding: '10px', 
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          >
            <option>All Products</option>
            <option>Starters</option>
            <option>Equipment</option>
            <option>Ingredients</option>
            <option>Books</option>
          </select>
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          {products.map(product => (
            <div 
              key={product.id}
              style={{ 
                padding: '15px', 
                borderBottom: '1px solid #eee',
                position: 'relative',
                cursor: 'pointer'
              }}
              onClick={() => handleProductClick(product.slug)}
            >
              <div style={{ marginBottom: '10px' }}>
                <h3 style={{ 
                  fontSize: '16px', 
                  fontWeight: '500',
                  color: '#0066cc', // Add link color
                  textDecoration: 'none' // Remove underline
                }}>
                  {product.name}
                </h3>
                <p style={{ fontSize: '14px', color: '#666' }}>
                  {product.description}
                </p>
                <div style={{ fontWeight: 'bold', margin: '5px 0' }}>{product.price}</div>
              </div>
              
              <div style={{ 
                position: 'absolute', 
                right: '15px', 
                bottom: '15px',
                zIndex: 10 // Make sure button is above the clickable area
              }}>
                <button 
                  style={{ 
                    backgroundColor: '#f97316', 
                    color: 'white',
                    padding: '5px 15px',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent product click when button is clicked
                    alert('Added to cart!');
                  }}
                >
                  Add
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <button style={{ 
          width: '100%', 
          padding: '10px',
          backgroundColor: 'transparent',
          border: '1px solid #ccc',
          borderRadius: '4px',
          color: '#666',
          fontSize: '14px',
          cursor: 'pointer'
        }}>
          Load More
        </button>
      </div>
    </MobileLayout>
  );
}
