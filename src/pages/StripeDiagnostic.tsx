import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, Database, CreditCard, Package, Webhook } from "lucide-react";
import { toast } from "sonner";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const StripeDiagnostic = () => {
  const [loading, setLoading] = useState(false);
  const [diagnostics, setDiagnostics] = useState<any>(null);

  const runDiagnostics = async () => {
    setLoading(true);
    try {
      // Check courses with Stripe configuration
      const { data: courses } = await supabase
        .from('courses')
        .select('id, title, price_cents, stripe_price_id, is_active')
        .eq('is_active', true);

      // Check Printify products
      const { data: printifyProducts } = await supabase
        .from('printify_products')
        .select('printify_id, title, variants, is_active')
        .eq('is_active', true);

      // Check recent webhook activity
      const { data: recentOrders } = await supabase
        .from('order_action_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      // Check digital product files
      const { data: digitalFiles } = await supabase
        .from('digital_product_files')
        .select('id, product_id, file_path');

      setDiagnostics({
        courses: courses || [],
        printifyProducts: printifyProducts || [],
        recentOrders: recentOrders || [],
        digitalFiles: digitalFiles || [],
        timestamp: new Date().toISOString()
      });

      toast.success("Diagnostics completed");
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const getStatusIcon = (condition: boolean) => {
    return condition ? (
      <CheckCircle className="w-5 h-5 text-green-500" />
    ) : (
      <XCircle className="w-5 h-5 text-red-500" />
    );
  };

  const getStatusBadge = (condition: boolean, trueText: string, falseText: string) => {
    return condition ? (
      <Badge variant="secondary">{trueText}</Badge>
    ) : (
      <Badge variant="destructive">{falseText}</Badge>
    );
  };

  if (!diagnostics) {
    return (
      <div className="min-h-screen py-20 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const coursesWithStripe = diagnostics.courses.filter((c: any) => c.stripe_price_id);
  const freeCourses = diagnostics.courses.filter((c: any) => !c.price_cents || c.price_cents === 0);
  const coursesWithoutStripe = diagnostics.courses.filter((c: any) => !c.stripe_price_id && c.price_cents > 0);
  const totalPrintifyVariants = diagnostics.printifyProducts.reduce(
    (sum: number, p: any) => sum + (p.variants?.length || 0), 0
  );

  return (
    <ProtectedRoute requireRole="admin">
      <div className="min-h-screen py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-consciousness font-bold text-foreground mb-2">
              Stripe Integration Diagnostics
            </h1>
            <p className="text-muted-foreground">
              Comprehensive verification of Stripe connections and product syncs
            </p>
            <Button 
              onClick={runDiagnostics} 
              disabled={loading}
              className="mt-4"
              size="sm"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh Diagnostics
            </Button>
          </div>

          {/* Status Summary */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <CreditCard className="w-6 h-6 text-primary" />
                {getStatusIcon(true)}
              </div>
              <h3 className="text-2xl font-bold">{coursesWithStripe.length}</h3>
              <p className="text-sm text-muted-foreground">Courses with Stripe</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Package className="w-6 h-6 text-primary" />
                {getStatusIcon(diagnostics.printifyProducts.length > 0)}
              </div>
              <h3 className="text-2xl font-bold">{diagnostics.printifyProducts.length}</h3>
              <p className="text-sm text-muted-foreground">Printify Products</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Webhook className="w-6 h-6 text-primary" />
                {getStatusIcon(diagnostics.recentOrders.length > 0)}
              </div>
              <h3 className="text-2xl font-bold">{diagnostics.recentOrders.length}</h3>
              <p className="text-sm text-muted-foreground">Recent Webhook Logs</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Database className="w-6 h-6 text-primary" />
                {getStatusIcon(diagnostics.digitalFiles.length > 0)}
              </div>
              <h3 className="text-2xl font-bold">{diagnostics.digitalFiles.length}</h3>
              <p className="text-sm text-muted-foreground">Digital Product Files</p>
            </Card>
          </div>

          {/* Overall Status Report */}
          <Alert className="mb-8">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-semibold">Integration Status:</p>
                <ul className="space-y-1 text-sm">
                  <li className="flex items-center gap-2">
                    {getStatusIcon(coursesWithStripe.length > 0)}
                    <span>Stripe Secret Key: {coursesWithStripe.length > 0 ? '✅ Connected' : '⚠️ Missing or Invalid'}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    {getStatusIcon(diagnostics.printifyProducts.length > 0)}
                    <span>Printify Products: {diagnostics.printifyProducts.length > 0 ? `✅ ${diagnostics.printifyProducts.length} active` : '⚠️ No products found'}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    {getStatusIcon(diagnostics.recentOrders.length > 0)}
                    <span>Webhook Activity: {diagnostics.recentOrders.length > 0 ? '✅ Active' : '⚠️ No recent activity'}</span>
                  </li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>

          {/* Courses/Digital Products */}
          <Card className="mb-6 p-6">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <CreditCard className="w-6 h-6" />
              Digital Products (Courses)
            </h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Courses with Stripe Integration:</h3>
                {coursesWithStripe.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No courses configured with Stripe Price IDs</p>
                ) : (
                  <div className="space-y-2">
                    {coursesWithStripe.map((course: any) => (
                      <div key={course.id} className="border rounded p-3 bg-muted/30">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{course.title}</p>
                            <p className="text-sm text-muted-foreground">Price ID: {course.stripe_price_id}</p>
                            <p className="text-sm text-muted-foreground">
                              Price: ${course.price_cents ? (course.price_cents / 100).toFixed(2) : 'Not Set'}
                            </p>
                          </div>
                          {getStatusBadge(!!course.stripe_price_id, "Synced", "Missing")}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {freeCourses.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2 text-white/60">Free Courses (No Stripe Required):</h3>
                  <div className="space-y-2">
                    {freeCourses.map((course: any) => (
                      <div key={course.id} className="border rounded p-3 bg-muted/30">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-foreground">{course.title}</p>
                            <p className="text-sm text-muted-foreground">Price: Free</p>
                          </div>
                          <Badge variant="secondary">Free</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {coursesWithoutStripe.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2 text-destructive">Paid Courses WITHOUT Stripe Integration:</h3>
                  <div className="space-y-2">
                    {coursesWithoutStripe.map((course: any) => (
                      <div key={course.id} className="border border-destructive/30 rounded p-3 bg-destructive/5">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-foreground">{course.title}</p>
                            <p className="text-sm text-muted-foreground">
                              Price: ${(course.price_cents / 100).toFixed(2)}
                            </p>
                          </div>
                          {getStatusBadge(false, "Synced", "Not Synced")}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Printify Products */}
          <Card className="mb-6 p-6">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Package className="w-6 h-6" />
              Printify Products (Merchandise)
            </h2>
            
            {diagnostics.printifyProducts.length === 0 ? (
              <p className="text-muted-foreground">No Printify products synced</p>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Total: {diagnostics.printifyProducts.length} products, {totalPrintifyVariants} variants
                </p>
                {diagnostics.printifyProducts.map((product: any) => (
                  <div key={product.printify_id} className="border rounded p-3 bg-muted/30">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium">{product.title}</p>
                        <p className="text-sm text-muted-foreground">Printify ID: {product.printify_id}</p>
                      </div>
                      {getStatusBadge(product.variants?.length > 0, "Active", "No Variants")}
                    </div>
                    <details className="text-sm">
                      <summary className="cursor-pointer text-primary">Show Variants ({product.variants?.length || 0})</summary>
                      <div className="mt-2 space-y-1 pl-4">
                        {product.variants?.slice(0, 5).map((variant: any, idx: number) => (
                          <div key={idx} className="text-xs text-muted-foreground">
                            • {variant.title}: ${variant.price}
                          </div>
                        ))}
                        {product.variants?.length > 5 && (
                          <p className="text-xs text-muted-foreground">... and {product.variants.length - 5} more</p>
                        )}
                      </div>
                    </details>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Webhook Activity */}
          <Card className="mb-6 p-6">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Webhook className="w-6 h-6" />
              Recent Webhook Activity
            </h2>
            
            {diagnostics.recentOrders.length === 0 ? (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  No recent webhook activity detected. This may indicate:
                  <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                    <li>Webhook URL not configured in Stripe Dashboard</li>
                    <li>No recent test or production orders</li>
                    <li>Webhook signature validation issues</li>
                  </ul>
                  <p className="mt-2 text-sm font-semibold">
                    Expected webhook URL: https://zapbkuaejvzpqerkkcnc.supabase.co/functions/v1/stripe-webhook
                  </p>
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-2">
                {diagnostics.recentOrders.map((log: any) => (
                  <div key={log.id} className="border rounded p-3 bg-muted/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{log.action_type}</p>
                        <p className="text-sm text-muted-foreground">
                          Order: {log.order_id} | {new Date(log.created_at).toLocaleString()}
                        </p>
                        {log.error_message && (
                          <p className="text-sm text-red-600 mt-1">Error: {log.error_message}</p>
                        )}
                      </div>
                      {getStatusBadge(log.status === 'success', "Success", "Error")}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Recommendations */}
          <Card className="p-6 bg-accent/20 border-accent/50">
            <h2 className="text-2xl font-bold mb-4">Recommendations</h2>
            <ul className="space-y-2 text-sm">
              {coursesWithoutStripe.length > 0 && (
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">
                    <strong>{coursesWithoutStripe.length} courses</strong> are missing Stripe Price IDs. 
                    Create products in Stripe and update the database with the price IDs.
                  </span>
                </li>
              )}
              {diagnostics.recentOrders.length === 0 && (
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">
                    Configure webhook in Stripe Dashboard at: 
                    <code className="ml-1 px-2 py-1 bg-muted rounded text-xs text-foreground">
                      https://zapbkuaejvzpqerkkcnc.supabase.co/functions/v1/stripe-webhook
                    </code>
                  </span>
                </li>
              )}
              {diagnostics.printifyProducts.length === 0 && (
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">No Printify products found. Sync products from Printify via the Store admin panel.</span>
                </li>
              )}
            </ul>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default StripeDiagnostic;
