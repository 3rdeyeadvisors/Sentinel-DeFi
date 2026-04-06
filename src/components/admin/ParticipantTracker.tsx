import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Users, Clock, TrendingUp, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/components/auth/AuthProvider';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface ParticipantTrackerProps {
  contentType: 'course' | 'tutorial' | 'module';
  contentId: string;
}

interface Participant {
  user_id: string;
  display_name: string;
  last_seen: string | null;
  progress_percentage: number;
  metadata: any;
}

export const ParticipantTracker = ({ contentType, contentId }: ParticipantTrackerProps) => {
  const { user } = useAuth();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if user is admin
  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();
      
      setIsAdmin(!!data);
    };

    checkAdmin();
  }, [user]);

  // Fetch participants in real-time
  useEffect(() => {
    if (!isAdmin) return;

    const fetchParticipants = async () => {
      setLoading(true);
      try {
        // Get presence data from last 30 minutes
        const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
        
        const { data: presenceData, error } = await supabase
          .from('user_presence')
          .select('user_id, last_seen, progress_percentage, metadata')
          .eq('content_type', contentType)
          .eq('content_id', contentId)
          .gte('last_seen', thirtyMinutesAgo)
          .order('last_seen', { ascending: false });

        if (error) throw error;

        if (presenceData && presenceData.length > 0) {
          // Fetch profiles for these users using the secure batch function
          const userIds = presenceData.map(p => p.user_id);
          const { data: profiles } = await supabase
            .rpc('get_profiles_batch', { user_ids: userIds });

          const enrichedData: Participant[] = presenceData.map(p => ({
            user_id: p.user_id,
            display_name: profiles?.find(prof => prof.user_id === p.user_id)?.display_name || 'Anonymous',
            last_seen: p.last_seen,
            progress_percentage: Number(p.progress_percentage) || 0,
            metadata: p.metadata || {}
          }));

          setParticipants(enrichedData);
        } else {
          setParticipants([]);
        }
      } catch (error) {
        console.error('Error fetching participants:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchParticipants();

    // Subscribe to real-time updates with error handling
    try {
      const channel = supabase
        .channel(`presence-${contentType}-${contentId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'user_presence',
            filter: `content_type=eq.${contentType},content_id=eq.${contentId}`
          },
          () => {
            fetchParticipants();
          }
        )
        .subscribe();

      return () => {
        try {
          supabase.removeChannel(channel);
        } catch (error) {
          console.debug('Error removing presence channel:', error);
        }
      };
    } catch (error) {
      console.debug('Presence realtime subscription unavailable:', error);
      // Return empty cleanup function if subscription fails
      return () => {};
    }
  }, [isAdmin, contentType, contentId]);

  if (!isAdmin) return null;

  const activeCount = participants.length;
  const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
  const recentlyActiveCount = participants.filter(
    p => new Date(p.last_seen).getTime() > fiveMinutesAgo
  ).length;

  const formatTimeSince = (timestamp: string) => {
    const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-primary hover:text-primary/80 hover:bg-primary/10"
        >
          <Users className="h-4 w-4" />
          <Badge variant="secondary" className="bg-primary/20 text-primary hover:bg-primary/30">
            {activeCount}
          </Badge>
          <Eye className="h-3 w-3 opacity-60" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Active Participants
          </DialogTitle>
          <DialogDescription>
            Users currently viewing or recently active in this {contentType}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Users className="h-4 w-4" />
                <span className="text-sm">Total Active</span>
              </div>
              <p className="text-2xl font-bold text-primary">{activeCount}</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Clock className="h-4 w-4" />
                <span className="text-sm">Active (5m)</span>
              </div>
              <p className="text-2xl font-bold text-awareness">{recentlyActiveCount}</p>
            </Card>
          </div>

          {/* Participants List */}
          {loading ? (
            <p className="text-center text-muted-foreground py-4">Loading participants...</p>
          ) : participants.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No active participants in the last 30 minutes</p>
          ) : (
            <div className="space-y-2">
              {participants.map((participant) => (
                <Card key={participant.user_id} className="p-4 hover:bg-accent/5 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/20 text-primary text-xs">
                          {participant.display_name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-foreground">{participant.display_name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{formatTimeSince(participant.last_seen)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {participant.progress_percentage > 0 && (
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-awareness" />
                          <span className="text-sm font-medium text-awareness">
                            {Math.round(participant.progress_percentage)}%
                          </span>
                        </div>
                      )}
                      <Badge
                        variant="outline"
                        className={
                          new Date(participant.last_seen).getTime() > fiveMinutesAgo
                            ? "bg-awareness/20 text-awareness border-awareness/30"
                            : "bg-muted/20 text-muted-foreground border-muted"
                        }
                      >
                        {new Date(participant.last_seen).getTime() > fiveMinutesAgo ? "Active" : "Away"}
                      </Badge>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
