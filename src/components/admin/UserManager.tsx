import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Trash2, Loader2, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function UserManager() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingInactive, setDeletingInactive] = useState(false);
  const [deletionResults, setDeletionResults] = useState<any>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase.rpc('get_user_emails_with_profiles');

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteInactiveAccounts = async () => {
    setDeletingInactive(true);
    setDeletionResults(null);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("You must be logged in to perform this action");
        return;
      }

      const response = await fetch(
        "https://zapbkuaejvzpqerkkcnc.supabase.co/functions/v1/delete-inactive-accounts",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete inactive accounts");
      }

      setDeletionResults(result.results);
      toast.success(`Successfully processed ${result.results.totalProcessed} inactive accounts`);
      
      // Reload users list
      loadUsers();
    } catch (error: any) {
      console.error("Error deleting inactive accounts:", error);
      toast.error(error.message || "Failed to delete inactive accounts");
    } finally {
      setDeletingInactive(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.user_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <Skeleton className="h-96 w-full" />;
  }

  return (
    <div className="space-y-6 font-body">
      {/* Inactive Account Deletion Card */}
      <Card className="border-destructive/30 bg-destructive/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive font-consciousness">
            <AlertTriangle className="h-5 w-5" />
            Delete Inactive Accounts
          </CardTitle>
          <CardDescription className="font-body">
            Send deletion notification emails and remove accounts inactive for 30+ days
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground font-body">
            This will identify all users who have not signed in for 30+ days (or never signed in),
            send them an email notification about the account removal and platform upgrade, 
            then delete their accounts and all associated data.
          </p>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={deletingInactive} className="font-body">
                {deletingInactive ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Inactive Accounts
                  </>
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription className="space-y-2">
                  <p>This action cannot be undone. This will:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Identify all users inactive for 30+ days</li>
                    <li>Send each user an email about their account removal</li>
                    <li>Delete all their data (profiles, progress, purchases, etc.)</li>
                    <li>Permanently remove their auth accounts</li>
                  </ul>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteInactiveAccounts}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Yes, Delete All Inactive Accounts
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Results Display */}
          {deletionResults && (
            <div className="mt-4 p-4 bg-muted rounded-lg space-y-2">
              <h4 className="font-semibold">Deletion Results:</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Total Processed: <span className="font-medium">{deletionResults.totalProcessed}</span></div>
                <div>Emails Sent: <span className="font-medium text-green-500">{deletionResults.emailsSent}</span></div>
                <div>Accounts Deleted: <span className="font-medium text-green-500">{deletionResults.accountsDeleted}</span></div>
                <div>Errors: <span className="font-medium text-destructive">{deletionResults.errors?.length || 0}</span></div>
              </div>
              {deletionResults.processedUsers?.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs text-muted-foreground mb-1">Processed Users:</p>
                  <div className="max-h-32 overflow-y-auto text-xs space-y-1">
                    {deletionResults.processedUsers.map((u: any, i: number) => (
                      <div key={i} className="flex justify-between">
                        <span>{u.email}</span>
                        <span className={u.status === "deleted" ? "text-green-500" : "text-destructive"}>
                          {u.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Database Card */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="font-consciousness">User Database</CardTitle>
          <CardDescription className="font-body">Manage users and their roles ({users.length} total users)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search users..."
              className="pl-10 font-body"
            />
          </div>

          <div className="rounded-xl border border-white/8 overflow-hidden bg-white/3">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b border-white/8">
                  <TableHead className="font-body text-xs uppercase tracking-widest text-white/40 py-3 px-4">Name</TableHead>
                  <TableHead className="font-body text-xs uppercase tracking-widest text-white/40 py-3 px-4">Email</TableHead>
                  <TableHead className="font-body text-xs uppercase tracking-widest text-white/40 py-3 px-4">Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground font-body py-8">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.user_id} className="border-b border-white/5 last:border-0">
                      <TableCell className="font-body text-sm text-white/70 py-3 px-4">{user.display_name || "Anonymous"}</TableCell>
                      <TableCell className="font-body text-sm text-white/70 py-3 px-4">{user.email}</TableCell>
                      <TableCell className="font-body text-sm text-white/70 py-3 px-4">{new Date(user.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
