import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

const SetupStripeProducts = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const { toast } = useToast();

  const handleSetup = async () => {
    try {
      setLoading(true);
      setResults(null);

      const { data, error } = await supabase.functions.invoke(
        "setup-course-stripe-products"
      );

      if (error) throw error;

      setResults(data);
      toast({
        title: "Success",
        description: data.message,
      });
    } catch (error: any) {
      console.error("Setup error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to setup Stripe products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Setup Stripe Course Products</CardTitle>
          <CardDescription>
            This will create Stripe products and prices for paid courses and update the database.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              <strong>Courses to setup:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Course #3: Earning with DeFi: $67.00</li>
                <li>Course #4: Managing Your Own DeFi Portfolio: $97.00</li>
              </ul>
            </AlertDescription>
          </Alert>

          <Button 
            onClick={handleSetup} 
            disabled={loading}
            className="w-full"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Setting up..." : "Setup Stripe Products"}
          </Button>

          {results && (
            <div className="space-y-4 mt-6">
              <Alert>
                <AlertDescription>
                  <strong>{results.message}</strong>
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                {results.results?.map((result: any) => (
                  <Card key={result.course_id}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            {result.success ? (
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-600" />
                            )}
                            <span className="font-medium">
                              Course #{result.course_id}
                            </span>
                          </div>
                          {result.success && (
                            <div className="mt-2 text-sm text-muted-foreground space-y-1">
                              <p>Product ID: {result.stripe_product_id}</p>
                              <p>Price ID: {result.stripe_price_id}</p>
                              <p>Amount: ${result.price_amount}</p>
                            </div>
                          )}
                          {!result.success && (
                            <p className="mt-2 text-sm text-red-600">
                              Error: {result.error}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SetupStripeProducts;
