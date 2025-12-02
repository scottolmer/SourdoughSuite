import { useEffect } from "react";
import { useLocation, Link } from "wouter";
import OrderConfirmationLayout from "@/components/OrderConfirmationLayout";
import { Button } from "@/components/ui/button";
import { CheckCircle, ShoppingBag, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function OrderConfirmation() {
  const [, navigate] = useLocation();

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  return (
    <OrderConfirmationLayout>
      <div className="container max-w-3xl py-16 flex flex-col items-center text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-8"
        >
          <CheckCircle className="h-12 w-12 text-primary" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <h1 className="text-3xl font-serif font-semibold mb-4">
            Order Confirmed!
          </h1>
          <p className="text-muted-foreground mb-8 max-w-lg">
            Thank you for your purchase! Your order has been received and is now being processed.
            You'll receive an order confirmation email shortly with the details of your purchase.
          </p>

          <div className="w-full max-w-md mx-auto bg-muted/30 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-medium mb-4">What's Next?</h2>
            <ul className="text-left space-y-4">
              <li className="flex items-start">
                <span className="bg-primary/10 rounded-full p-1 mr-3 mt-0.5">
                  <CheckCircle className="h-4 w-4 text-primary" />
                </span>
                <span>
                  <strong>Order Processing:</strong> We're preparing your items for shipment.
                </span>
              </li>
              <li className="flex items-start">
                <span className="bg-primary/10 rounded-full p-1 mr-3 mt-0.5">
                  <CheckCircle className="h-4 w-4 text-primary" />
                </span>
                <span>
                  <strong>Shipping:</strong> You'll receive tracking information once your order ships.
                </span>
              </li>
              <li className="flex items-start">
                <span className="bg-primary/10 rounded-full p-1 mr-3 mt-0.5">
                  <CheckCircle className="h-4 w-4 text-primary" />
                </span>
                <span>
                  <strong>Delivery:</strong> Depending on your location, your order should arrive within 3-7 business days.
                </span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="default" 
              className="flex items-center" 
              asChild
            >
              <Link href="/shop">
                <ShoppingBag className="mr-2 h-4 w-4" />
                Continue Shopping
              </Link>
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center" 
              onClick={() => navigate("/account/orders")}
            >
              View Your Orders
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      </div>
    </OrderConfirmationLayout>
  );
}