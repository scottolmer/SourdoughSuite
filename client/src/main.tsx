import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./admin-mobile-fix.css";

// Add custom styling for Modernist Bread aesthetic
const style = document.createElement('style');
style.textContent = `
  /* Google Fonts Import */
  @import url('https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700&family=Merriweather:wght@400;700&family=Inter:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');
  
  /* Custom font styles */
  h1, h2, h3, h4, h5, h6 {
    font-family: 'Merriweather', 'Lora', serif;
    color: #2B2B2B;
    letter-spacing: -0.02em;
  }
  
  body {
    font-family: 'Inter', sans-serif;
    background-color: #F5F5F5;
    color: #2B2B2B;
    line-height: 1.6;
  }
  
  .metric-display {
    font-family: 'IBM Plex Mono', 'JetBrains Mono', monospace;
    letter-spacing: -0.03em;
  }
  
  p, li, span {
    color: #2B2B2B;
  }
  
  .text-secondary {
    color: #6E6E6E;
  }
  
  .bg-primary-subtle {
    background-color: #FEF3C7;
  }
  
  /* Scientific/Editorial styling */
  .caption {
    font-size: 0.85rem;
    color: #6E6E6E;
    font-family: 'Inter', sans-serif;
    font-weight: 300;
  }
  
  /* Modernist spacing */
  .section-spacer {
    margin: 4rem 0;
  }
  
  /* Card styling */
  .card {
    border-radius: 2px;
    overflow: hidden;
  }
`;

document.head.appendChild(style);

createRoot(document.getElementById("root")!).render(<App />);
