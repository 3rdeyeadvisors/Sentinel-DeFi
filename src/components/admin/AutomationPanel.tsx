import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap, Loader2, Mail, FileText, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Automation {
  id: string;
  label: string;
  action: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

export function AutomationPanel() {
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const runAutomation = async (automation: Automation) => {
    setLoading(automation.id);
    try {
      const { data, error } = await supabase.functions.invoke('admin-ai-command', {
        body: { command: automation.action }
      });

      if (error) throw error;

      // Handle specific action responses
      if (data?.message?.includes("not yet implemented") || data?.data?.action === "unknown") {
        toast({
          title: "Action Not Available",
          description: `"${automation.label}" is not currently implemented.`,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Automation Complete",
        description: data?.message || `Successfully executed: ${automation.label}`,
      });
    } catch (error: any) {
      console.error("Automation error:", error);
      toast({
        title: "Automation Failed",
        description: error.message || "An error occurred while running the automation.",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const automations: Automation[] = [
    { 
      id: "resend-failed", 
      label: "Resend Failed Emails", 
      action: "resend all failed emails",
      icon: Mail,
      description: "Queue all failed emails for resending"
    },
    { 
      id: "weekly-report", 
      label: "Generate Weekly Report", 
      action: "generate weekly report",
      icon: FileText,
      description: "Generate platform summary and insights"
    },
    { 
      id: "sync-orders", 
      label: "Sync Printify Orders", 
      action: "sync all orders",
      icon: RefreshCw,
      description: "Sync order status from Printify"
    },
  ];

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          Quick Automations
        </CardTitle>
        <CardDescription>Execute common administrative tasks with one click</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {automations.map((auto) => (
          <Button
            key={auto.id}
            onClick={() => runAutomation(auto)}
            disabled={loading !== null}
            variant="outline"
            className="h-auto py-4 flex-col gap-2 relative"
          >
            {loading === auto.id ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <auto.icon className="h-5 w-5" />
            )}
            <span className="font-medium">{auto.label}</span>
            <span className="text-xs text-muted-foreground font-normal">{auto.description}</span>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
