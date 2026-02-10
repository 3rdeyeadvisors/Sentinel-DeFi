import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { usePoints } from '@/hooks/usePoints';
import { useAuth } from '@/components/auth/AuthProvider';
import { Trophy, Medal, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LeaderboardEntry {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  total_points: number;
  rank: number;
}

export const PointsLeaderboard = () => {
  const { user } = useAuth();
  const { getLeaderboard, rank: userRank } = usePoints();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadLeaderboard = async () => {
      const data = await getLeaderboard();
      setLeaderboard(data);
      setLoading(false);
    };
    loadLeaderboard();
  }, [getLeaderboard]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-muted-foreground">{rank}</span>;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30';
      case 2:
        return 'bg-gray-400/20 text-gray-600 border-gray-400/30';
      case 3:
        return 'bg-amber-600/20 text-amber-700 border-amber-600/30';
      default:
        return '';
    }
  };

  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  if (loading) {
    return (
      <Card className="p-4 animate-pulse">
        <div className="h-48 bg-muted rounded" />
      </Card>
    );
  }

  return (
    <Card className="p-4 sm:p-6 border-primary/20">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">{currentMonth} Leaderboard</h3>
      </div>

      {leaderboard.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Trophy className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No points earned yet this month.</p>
          <p className="text-sm">Be the first to get on the leaderboard!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {leaderboard.map((entry) => {
            const isCurrentUser = entry.user_id === user?.id;
            
            return (
              <div
                key={entry.user_id}
                onClick={() => navigate(`/profile/${entry.user_id}`)}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all hover:bg-muted/50 ${
                  isCurrentUser ? 'bg-primary/10 border border-primary/30' : 'bg-background/50'
                } ${getRankBadgeColor(entry.rank)}`}
              >
                <div className="w-8 flex items-center justify-center">
                  {getRankIcon(entry.rank)}
                </div>
                
                <Avatar className="w-8 h-8">
                  <AvatarImage src={entry.avatar_url || ''} />
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                    {(entry.display_name || 'A').charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <p className={`font-medium truncate ${isCurrentUser ? 'text-primary' : ''}`}>
                    {entry.display_name || 'Anonymous'}
                    {isCurrentUser && (
                      <Badge variant="secondary" className="ml-2 text-xs">You</Badge>
                    )}
                  </p>
                </div>
                
                <div className="text-right">
                  <span className="font-bold">{entry.total_points.toLocaleString()}</span>
                  <span className="text-xs text-muted-foreground ml-1">pts</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Show user's position if not in top 10 */}
      {userRank && userRank.rank > 10 && (
        <>
          <div className="border-t border-border my-4" />
          <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/30">
            <div className="w-8 flex items-center justify-center">
              <span className="text-sm font-bold text-muted-foreground">#{userRank.rank}</span>
            </div>
            
            <Avatar className="w-8 h-8">
              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                You
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <p className="font-medium text-primary">Your Position</p>
            </div>
            
            <div className="text-right">
              <span className="font-bold">{userRank.total_points.toLocaleString()}</span>
              <span className="text-xs text-muted-foreground ml-1">pts</span>
            </div>
          </div>
        </>
      )}
    </Card>
  );
};
