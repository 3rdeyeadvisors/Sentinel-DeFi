import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export const ManualOrderProcessor = () => {
  const [sessionId, setSessionId] = useState("");
  const [loading, setLoading] = useState(false);

  const handleProcess = async () => {
    if (!sessionId.trim()) {
      toast.error("Please enter a Stripe Session ID");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('manual-process-order', {
        body: { paymentId: sessionId.trim() }
      });

      if (error) throw error;

      toast.success("Order processed successfully!");
      setSessionId("");
    } catch (error: any) {
      console.error("Error processing order:", error);
      toast.error(error.message || "Failed to process order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manual Order Processing</CardTitle>
        <CardDescription>
          Process failed Stripe orders manually by entering the Checkout Session ID (starts with cs_)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          placeholder="cs_live_..."
          value={sessionId}
          onChange={(e) => setSessionId(e.target.value)}
        />
        <Button onClick={handleProcess} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Process Order"
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
