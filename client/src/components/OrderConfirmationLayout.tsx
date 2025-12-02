import { ReactNode } from "react";
import { ScrollToTop } from "./ScrollToTop";

interface OrderConfirmationLayoutProps {
  children: ReactNode;
}

// A layout specifically for order confirmation pages that doesn't include NavBar
export default function OrderConfirmationLayout({ children }: OrderConfirmationLayoutProps) {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <ScrollToTop />
      <main>
        {children}
      </main>
    </div>
  );
}