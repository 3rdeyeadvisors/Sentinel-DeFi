import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Loader2, MailX } from "lucide-react";

const SUPABASE_URL = "https://zapbkuaejvzpqerkkcnc.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InphcGJrdWFlanZ6cHFlcmtrY25jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5NjAxMTksImV4cCI6MjA2ODUzNjExOX0.kmzeGjrbpI2qB5UhKoAOoEspxWYGk8UthowEA_f154o";

type Status = "loading" | "valid" | "invalid" | "confirming" | "success" | "error" | "already";

const Unsubscribe = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      return;
    }
    fetch(`${SUPABASE_URL}/functions/v1/handle-email-unsubscribe?token=${token}`, {
      headers: { apikey: SUPABASE_ANON_KEY },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.valid === false && data.reason === "already_unsubscribed") {
          setStatus("already");
        } else if (data.valid) {
          setStatus("valid");
        } else {
          setStatus("invalid");
        }
      })
      .catch(() => setStatus("invalid"));
  }, [token]);

  const handleUnsubscribe = async () => {
    setStatus("confirming");
    try {
      const { data, error } = await supabase.functions.invoke("handle-email-unsubscribe", {
        body: { token },
      });
      if (error) throw error;
      if (data?.success) {
        setStatus("success");
      } else if (data?.reason === "already_unsubscribed") {
        setStatus("already");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-border/50">
        <CardHeader className="text-center">
          <MailX className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
          <CardTitle className="text-foreground">Email Unsubscribe</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {status === "loading" && (
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Validating...</span>
            </div>
          )}
          {status === "valid" && (
            <>
              <p className="text-muted-foreground">
                Click below to unsubscribe from Sentinel DeFi emails.
              </p>
              <Button onClick={handleUnsubscribe} variant="destructive" className="w-full">
                Confirm Unsubscribe
              </Button>
            </>
          )}
          {status === "confirming" && (
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Processing...</span>
            </div>
          )}
          {status === "success" && (
            <div className="flex flex-col items-center gap-2 text-green-500">
              <CheckCircle className="h-8 w-8" />
              <p>You've been successfully unsubscribed.</p>
            </div>
          )}
          {status === "already" && (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <CheckCircle className="h-8 w-8" />
              <p>You're already unsubscribed.</p>
            </div>
          )}
          {status === "invalid" && (
            <div className="flex flex-col items-center gap-2 text-destructive">
              <XCircle className="h-8 w-8" />
              <p>Invalid or expired unsubscribe link.</p>
            </div>
          )}
          {status === "error" && (
            <div className="flex flex-col items-center gap-2 text-destructive">
              <XCircle className="h-8 w-8" />
              <p>Something went wrong. Please try again later.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Unsubscribe;
