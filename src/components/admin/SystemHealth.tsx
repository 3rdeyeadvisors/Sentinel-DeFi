import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, ShieldAlert, History, Mail } from "lucide-react";
import { Loader2 } from "lucide-react";

export const SystemHealth = () => {
  // 1. Fetch Email Failures
  const { data: emailLogs, isLoading: emailsLoading } = useQuery({
    queryKey: ["admin-system-health-emails"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("email_logs")
        .select("*")
        .neq("status", "sent")
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
  });

  // 2. Fetch Security/RLS Events
  const { data: securityLogs, isLoading: securityLoading } = useQuery({
    queryKey: ["admin-system-health-security"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("security_audit_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
  });

  // 3. Fetch Recent Point Activity
  const { data: recentPoints, isLoading: pointsLoading } = useQuery({
    queryKey: ["admin-system-health-points"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_points")
        .select("*, profiles(display_name)")
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
  });

  const isLoading = emailsLoading || securityLoading || pointsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-white/5 border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Email Health</CardTitle>
            <Mail className="h-4 w-4 text-violet-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {emailLogs?.length === 0 ? "Healthy" : `${emailLogs?.length} Issues`}
            </div>
            <p className="text-xs text-white/50">Last 5 non-sent logs</p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Security Events</CardTitle>
            <ShieldAlert className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{securityLogs?.length || 0}</div>
            <p className="text-xs text-white/50">Recent audit entries</p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Point Activity</CardTitle>
            <History className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">Active</div>
            <p className="text-xs text-white/50">System-wide transactions</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-violet-400" />
            System Issues & Alerts
          </CardTitle>
          <CardDescription className="text-white/50">
            Real-time overview of system anomalies and audit logs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {/* Email Logs Section */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Failed/Pending Emails</h3>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-white/10">
                    <TableHead className="text-white/70">Recipient</TableHead>
                    <TableHead className="text-white/70">Subject</TableHead>
                    <TableHead className="text-white/70">Status</TableHead>
                    <TableHead className="text-white/70">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {emailLogs?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-white/30 py-4">
                        No email issues detected.
                      </TableCell>
                    </TableRow>
                  ) : (
                    emailLogs?.map((log) => (
                      <TableRow key={log.id} className="border-white/10 hover:bg-white/5">
                        <TableCell className="text-white/80">{log.recipient_email}</TableCell>
                        <TableCell className="text-white/80">{log.subject}</TableCell>
                        <TableCell>
                          <Badge variant="destructive">{log.status}</Badge>
                        </TableCell>
                        <TableCell className="text-white/50">
                          {new Date(log.created_at).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Security Audit Section */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Security & Admin Audit</h3>
              <div className="space-y-4">
                {securityLogs?.length === 0 ? (
                  <p className="text-white/30 text-center py-4">No recent security events.</p>
                ) : (
                  securityLogs?.map((log) => (
                    <div key={log.id} className="p-4 rounded-lg bg-white/5 border border-white/10 flex items-start gap-4">
                      <ShieldAlert className="h-5 w-5 text-red-400 mt-1 shrink-0" />
                      <div>
                        <div className="text-white font-medium capitalize">
                          {log.event_type.replace(/_/g, " ")}
                        </div>
                        <div className="text-sm text-white/50">
                          {JSON.stringify(log.details)}
                        </div>
                        <div className="text-xs text-white/30 mt-1">
                          {new Date(log.created_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Point Activity Section */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Recent Point Transactions</h3>
              <div className="space-y-3">
                {recentPoints?.map((p: any) => (
                  <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-emerald-500/10">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      </div>
                      <div>
                        <div className="text-white font-medium">
                          {p.profiles?.display_name || "Unknown User"}
                        </div>
                        <div className="text-xs text-white/50 capitalize">
                          {p.action_type.replace(/_/g, " ")}
                        </div>
                      </div>
                    </div>
                    <div className="text-emerald-400 font-bold">+{p.points}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
