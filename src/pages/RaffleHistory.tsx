import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trophy, Calendar, Users, DollarSign, Search, History } from "lucide-react";
import SEO from "@/components/SEO";
import { Link } from "react-router-dom";

interface RaffleHistoryItem {
  id: string;
  title: string;
  description: string;
  prize: string;
  prize_amount: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  winner_user_id?: string;
  winner_selected_at?: string;
  winner_display_name?: string;
  participant_count?: number;
}

const RaffleHistory = () => {
  const { user } = useAuth();
  const [raffles, setRaffles] = useState<RaffleHistoryItem[]>([]);
  const [filteredRaffles, setFilteredRaffles] = useState<RaffleHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("recent");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminStatus();
    fetchRaffleHistory();
  }, [user]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [searchQuery, filterStatus, sortBy, raffles]);

  const checkAdminStatus = async () => {
    if (!user) {
      setIsAdmin(false);
      return;
    }

    try {
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();

      setIsAdmin(!!data);
    } catch (error) {
      setIsAdmin(false);
    }
  };

  const fetchRaffleHistory = async () => {
    try {
      setLoading(true);

      // Fetch raffles that have a winner or are active (excludes inactive test raffles)
      const { data: rafflesData, error: rafflesError } = await supabase
        .from('raffles')
        .select('*')
        .or('winner_user_id.not.is.null,is_active.eq.true')
        .order('created_at', { ascending: false });

      if (rafflesError) throw rafflesError;

      // For each raffle, fetch participant count and winner info
      const enrichedRaffles = await Promise.all(
        (rafflesData || []).map(async (raffle) => {
          // Get participant count
          const { count } = await supabase
            .from('raffle_entries')
            .select('*', { count: 'exact', head: true })
            .eq('raffle_id', raffle.id);

          // Get winner display name if exists using secure function
          let winnerDisplayName = undefined;
          if (raffle.winner_user_id) {
            const { data: profiles } = await supabase
              .rpc('get_profiles_batch', { user_ids: [raffle.winner_user_id] });

            winnerDisplayName = profiles?.[0]?.display_name || 'Anonymous';
          }

          return {
            ...raffle,
            participant_count: count || 0,
            winner_display_name: winnerDisplayName,
          };
        })
      );

      setRaffles(enrichedRaffles);
    } catch (error) {
      console.error('Error fetching raffle history:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...raffles];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (raffle) =>
          raffle.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          raffle.prize.toLowerCase().includes(searchQuery.toLowerCase()) ||
          raffle.winner_display_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (filterStatus === "completed") {
      filtered = filtered.filter((raffle) => raffle.winner_user_id);
    } else if (filterStatus === "active") {
      filtered = filtered.filter((raffle) => raffle.is_active && !raffle.winner_user_id);
    } else if (filterStatus === "closed") {
      filtered = filtered.filter((raffle) => !raffle.is_active && !raffle.winner_user_id);
    }

    // Apply sorting
    if (sortBy === "recent") {
      filtered.sort((a, b) => new Date(b.end_date).getTime() - new Date(a.end_date).getTime());
    } else if (sortBy === "oldest") {
      filtered.sort((a, b) => new Date(a.end_date).getTime() - new Date(b.end_date).getTime());
    } else if (sortBy === "participants") {
      filtered.sort((a, b) => (b.participant_count || 0) - (a.participant_count || 0));
    } else if (sortBy === "prize") {
      filtered.sort((a, b) => b.prize_amount - a.prize_amount);
    }

    setFilteredRaffles(filtered);
  };

  const getRaffleStatus = (raffle: RaffleHistoryItem) => {
    if (raffle.winner_user_id) {
      return { label: "Completed", color: "bg-success" };
    } else if (raffle.is_active) {
      return { label: "Active", color: "bg-primary" };
    } else {
      return { label: "Closed", color: "bg-muted" };
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title="Raffle History: 3rdeyeadvisors"
        description="View all past Learn-to-Earn raffles, winners, and prize distributions. See the complete history of our community reward program."
        keywords="raffle history, past winners, crypto giveaways, defi rewards"
      />

      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <History className="w-10 h-10 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold">Raffle History</h1>
          </div>
          <p className="text-xl text-muted-foreground mb-6">
            Complete timeline of Learn-to-Earn raffles and winners
          </p>
          <Link to="/raffles">
            <Button variant="outline">
              View Current Raffle
            </Button>
          </Link>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Raffles</p>
                  <p className="text-3xl font-bold">{raffles.length}</p>
                </div>
                <Trophy className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-3xl font-bold">
                    {raffles.filter((r) => r.winner_user_id).length}
                  </p>
                </div>
                <Trophy className="w-8 h-8 text-success" />
              </div>
            </CardContent>
          </Card>

          {isAdmin && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Participants</p>
                    <p className="text-3xl font-bold">
                      {raffles.reduce((sum, r) => sum + (r.participant_count || 0), 0)}
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Prizes</p>
                  <p className="text-3xl font-bold">
                    ${raffles.reduce((sum, r) => sum + r.prize_amount, 0)}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-warning" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search raffles, prizes, or winners..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Raffles</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="participants">Most Participants</SelectItem>
                  <SelectItem value="prize">Highest Prize</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            Showing {filteredRaffles.length} of {raffles.length} raffles
          </p>
        </div>

        {/* Timeline */}
        <div className="space-y-6">
          {filteredRaffles.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No raffles found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or filters
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredRaffles.map((raffle) => {
              const status = getRaffleStatus(raffle);
              return (
                <Card key={raffle.id} className="relative overflow-hidden">
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${status.color}`} />
                  <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-2xl">{raffle.title}</CardTitle>
                          <Badge className={`${status.color} text-foreground`}>
                            {status.label}
                          </Badge>
                        </div>
                        <CardDescription className="text-base">
                          {raffle.description}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-primary">
                          ${raffle.prize_amount}
                        </div>
                        <p className="text-sm text-muted-foreground">{raffle.prize}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Duration</p>
                          <p className="text-sm font-medium">
                            {new Date(raffle.start_date).toLocaleDateString()} -{" "}
                            {new Date(raffle.end_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {isAdmin && (
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Participants</p>
                            <p className="text-sm font-medium">
                              {raffle.participant_count || 0} {raffle.participant_count === 1 ? 'person' : 'people'}
                            </p>
                          </div>
                        </div>
                      )}

                      {raffle.winner_user_id && (
                        <div className="flex items-center gap-2">
                          <Trophy className="w-4 h-4 text-warning" />
                          <div>
                            <p className="text-xs text-muted-foreground">Winner</p>
                            <p className="text-sm font-medium">{raffle.winner_display_name}</p>
                            {raffle.winner_selected_at && (
                              <p className="text-xs text-muted-foreground">
                                Selected {new Date(raffle.winner_selected_at).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Call to Action */}
        {filteredRaffles.some((r) => r.is_active) && (
          <Card className="mt-8 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="pt-6 text-center">
              <Trophy className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="text-2xl font-bold mb-2">Active Raffle Available!</h3>
              <p className="text-muted-foreground mb-4">
                Don't miss your chance to win. Participate now!
              </p>
              <Link to="/raffles">
                <Button size="lg">
                  Join Now
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Legal Disclaimer */}
        <Card className="mt-8 border-muted">
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground text-center">
              <strong>About Raffle History:</strong> This page displays the complete history of our Learn-to-Earn raffles. 
              All winners were selected randomly from verified participants using a weighted selection based on entry counts.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default RaffleHistory;
