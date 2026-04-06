import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
  MessageSquare,
  Loader2,
  ArrowUpRight,
  Check,
  X,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  useFeatureSuggestions,
  useFeatureSuggestionsAdmin,
  FeatureSuggestion
} from '@/hooks/useFeatureSuggestions';

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'pending', label: 'Pending', className: 'bg-amber-500/20 text-amber-400' },
  { value: 'approved', label: 'Approved', className: 'bg-emerald-500/20 text-emerald-400' },
  { value: 'rejected', label: 'Rejected', className: 'bg-red-500/20 text-red-400' },
  { value: 'promoted', label: 'Promoted', className: 'bg-primary/20 text-primary' },
];

export const FeatureSuggestionsManager = () => {
  const { suggestions, loading, refreshSuggestions } = useFeatureSuggestions();
  const { loading: adminLoading, updateStatus, promoteToRoadmap } = useFeatureSuggestionsAdmin();

  const [statusFilter, setStatusFilter] = useState('all');
  const [viewingSuggestion, setViewingSuggestion] = useState<FeatureSuggestion | null>(null);
  const [promotingId, setPromotingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectNotes, setRejectNotes] = useState('');

  const filteredSuggestions = statusFilter === 'all'
    ? suggestions
    : suggestions.filter(s => s.status === statusFilter);

  const pendingCount = suggestions.filter(s => s.status === 'pending').length;

  const handlePromote = async (suggestion: FeatureSuggestion) => {
    const success = await promoteToRoadmap(suggestion);
    if (success) {
      setPromotingId(null);
      refreshSuggestions();
    }
  };

  const handleReject = async (suggestionId: string) => {
    const success = await updateStatus(suggestionId, 'rejected', rejectNotes);
    if (success) {
      setRejectingId(null);
      setRejectNotes('');
      refreshSuggestions();
    }
  };

  const handleApprove = async (suggestionId: string) => {
    const success = await updateStatus(suggestionId, 'approved');
    if (success) {
      refreshSuggestions();
    }
  };

  const getStatusBadge = (status: string) => {
    const statusInfo = statusOptions.find(s => s.value === status);
    if (!statusInfo) return null;
    return (
      <Badge variant="outline" className={statusInfo.className}>
        {statusInfo.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <MessageSquare className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-consciousness font-bold">
              Feature Suggestions
            </h2>
            <p className="text-sm text-muted-foreground">
              Review and promote community ideas
            </p>
          </div>
          {pendingCount > 0 && (
            <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
              {pendingCount} pending
            </Badge>
          )}
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Suggestions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">All Suggestions</CardTitle>
          <CardDescription>
            {filteredSuggestions.length} suggestion{filteredSuggestions.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : filteredSuggestions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p>No suggestions found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead className="hidden md:table-cell">Submitted By</TableHead>
                    <TableHead className="hidden sm:table-cell">Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSuggestions.map(suggestion => (
                    <TableRow key={suggestion.id}>
                      <TableCell className="max-w-[200px]">
                        <span className="font-medium line-clamp-1">{suggestion.title}</span>
                        <p className="text-xs text-muted-foreground line-clamp-1 md:hidden">
                          by {suggestion.submitter_name}
                        </p>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                        {suggestion.submitter_name}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(suggestion.created_at), { addSuffix: true })}
                      </TableCell>
                      <TableCell>{getStatusBadge(suggestion.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* View */}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setViewingSuggestion(suggestion)}
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>

                          {/* Promote - available for pending and approved */}
                          {(suggestion.status === 'pending' || suggestion.status === 'approved') && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-primary hover:text-primary hover:bg-primary/10"
                              onClick={() => setPromotingId(suggestion.id)}
                              disabled={adminLoading}
                              title="Promote to vote"
                            >
                              <ArrowUpRight className="w-4 h-4" />
                            </Button>
                          )}

                          {suggestion.status === 'pending' && (
                            <>
                              {/* Approve */}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-emerald-400 hover:text-emerald-400 hover:bg-emerald-500/10"
                                onClick={() => handleApprove(suggestion.id)}
                                disabled={adminLoading}
                                title="Approve"
                              >
                                <Check className="w-4 h-4" />
                              </Button>

                              {/* Reject */}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-400 hover:text-red-400 hover:bg-red-500/10"
                                onClick={() => setRejectingId(suggestion.id)}
                                disabled={adminLoading}
                                title="Reject"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog open={!!viewingSuggestion} onOpenChange={() => setViewingSuggestion(null)}>
        <DialogContent className="max-w-lg">
          {viewingSuggestion && (
            <>
              <DialogHeader>
                <DialogTitle className="font-consciousness">
                  {viewingSuggestion.title}
                </DialogTitle>
                <div className="flex items-center gap-2 pt-1">
                  {getStatusBadge(viewingSuggestion.status)}
                  <span className="text-xs text-muted-foreground">
                    by {viewingSuggestion.submitter_name}
                  </span>
                </div>
              </DialogHeader>
              <DialogDescription className="text-sm text-foreground whitespace-pre-wrap max-h-[300px] overflow-y-auto">
                {viewingSuggestion.description}
              </DialogDescription>
              {viewingSuggestion.admin_notes && (
                <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Admin Notes:</p>
                  <p className="text-sm">{viewingSuggestion.admin_notes}</p>
                </div>
              )}
              <DialogFooter>
                <div className="flex flex-wrap gap-2">
                  {/* Promote - available for pending and approved */}
                  {(viewingSuggestion.status === 'pending' || viewingSuggestion.status === 'approved') && (
                    <Button
                      size="sm"
                      onClick={() => {
                        setViewingSuggestion(null);
                        setPromotingId(viewingSuggestion.id);
                      }}
                    >
                      <ArrowUpRight className="w-4 h-4 mr-1" />
                      Promote to Vote
                    </Button>
                  )}

                  {viewingSuggestion.status === 'pending' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleApprove(viewingSuggestion.id)}
                        disabled={adminLoading}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setViewingSuggestion(null);
                          setRejectingId(viewingSuggestion.id);
                        }}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Promote Confirmation */}
      <AlertDialog open={!!promotingId} onOpenChange={() => setPromotingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Promote to Roadmap Vote?</AlertDialogTitle>
            <AlertDialogDescription>
              This will create a new roadmap item for community voting.
              The voting window will be set to 7 days.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const suggestion = suggestions.find(s => s.id === promotingId);
                if (suggestion) handlePromote(suggestion);
              }}
              disabled={adminLoading}
            >
              {adminLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Promote
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog */}
      <Dialog open={!!rejectingId} onOpenChange={() => {
        setRejectingId(null);
        setRejectNotes('');
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Suggestion</DialogTitle>
            <DialogDescription>
              Optionally add notes explaining why this suggestion wasn't selected.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Notes (optional, not visible to users)..."
            value={rejectNotes}
            onChange={e => setRejectNotes(e.target.value)}
            rows={3}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setRejectingId(null);
              setRejectNotes('');
            }}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => rejectingId && handleReject(rejectingId)}
              disabled={adminLoading}
            >
              {adminLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FeatureSuggestionsManager;
