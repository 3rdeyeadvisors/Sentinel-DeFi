import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { UserX } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/auth/AuthProvider';

interface RemoveFromRaffleButtonProps {
  raffleId: string;
  onRemoved?: () => void;
}

export const RemoveFromRaffleButton = ({ raffleId, onRemoved }: RemoveFromRaffleButtonProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleRemove = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('admin-remove-from-raffle', {
        body: { raffleId }
      });

      if (error) throw error;

      toast({
        title: 'Removed from Raffle',
        description: 'You have been successfully removed from this raffle.',
      });

      if (onRemoved) onRemoved();
      
      // Refresh the page to update UI
      window.location.reload();
    } catch (error: any) {
      console.error('Error removing from raffle:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove from raffle',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={handleRemove}
      disabled={loading}
      className="gap-2"
    >
      <UserX className="h-4 w-4" />
      {loading ? 'Removing...' : 'Remove Me from Raffle'}
    </Button>
  );
};
