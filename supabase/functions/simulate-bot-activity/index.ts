import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Point values for different actions (matching the frontend POINTS_VALUES)
const POINT_ACTIONS = [
  { type: 'module_completion', points: 25 },
  { type: 'quiz_passed', points: 50 },
  { type: 'daily_login', points: 10 },
  { type: 'tutorial_completion', points: 15 },
  { type: 'course_completion', points: 100 },
];

// Get random number between min and max
function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Pick random action with weighted probability
function pickRandomAction(): { type: string; points: number } {
  const weights = [40, 15, 30, 12, 3]; // Probability weights
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let random = Math.random() * totalWeight;
  
  for (let i = 0; i < POINT_ACTIONS.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return POINT_ACTIONS[i];
    }
  }
  return POINT_ACTIONS[0];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Require admin auth — bot simulation directly affects leaderboards.
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const token = authHeader.replace(/^Bearer\s+/i, '');
    const { data: u, error: uErr } = await supabaseAdmin.auth.getUser(token);
    if (uErr || !u?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const { data: roleRow } = await supabaseAdmin.from('user_roles')
      .select('role').eq('user_id', u.user.id).eq('role', 'admin').maybeSingle();
    if (!roleRow) {
      return new Response(JSON.stringify({ error: 'Admin role required' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
    console.log(`Running bot simulation for month: ${currentMonth}`);

    // Step 1: Get all bot profiles first (avoiding join issues)
    const { data: botProfiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('user_id, display_name')
      .eq('is_bot', true);

    if (profilesError) {
      console.error('Error fetching bot profiles:', profilesError);
      return new Response(JSON.stringify({ error: 'Failed to fetch bot profiles' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!botProfiles || botProfiles.length === 0) {
      return new Response(JSON.stringify({ message: 'No bots found. Run seed-bot-users first.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const botUserIds = botProfiles.map(p => p.user_id);
    console.log(`Found ${botProfiles.length} bot profiles`);

    // Step 2: Get bot configs for these user_ids
    const { data: botConfigs, error: configsError } = await supabaseAdmin
      .from('bot_config')
      .select('user_id, personality_type, max_point_percentage')
      .in('user_id', botUserIds);

    if (configsError) {
      console.error('Error fetching bot configs:', configsError);
      return new Response(JSON.stringify({ error: 'Failed to fetch bot configs' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Create a map of user_id to config
    const configMap = new Map();
    botConfigs?.forEach(config => {
      configMap.set(config.user_id, config);
    });

    console.log(`Found ${botConfigs?.length || 0} bot configs`);

    // Step 3: Get top real user points (excluding bots)
    const { data: allMonthlyPoints, error: monthlyPointsError } = await supabaseAdmin
      .from('user_points_monthly')
      .select('user_id, total_points')
      .eq('month_year', currentMonth)
      .order('total_points', { ascending: false });

    if (monthlyPointsError) {
      console.error('Error fetching monthly points:', monthlyPointsError);
    }

    // Filter out bots to find top real user
    const topRealUser = allMonthlyPoints?.find(u => !botUserIds.includes(u.user_id));

    // If no real user has points this month, let's look at all-time or last month
    let topRealPoints = topRealUser?.total_points || 0;

    if (topRealPoints < 100) {
      console.log('Top real user points for this month is low, checking all-time or using default...');
      const { data: topAllTime, error: allTimeError } = await supabaseAdmin
        .from('profiles')
        .select('user_id')
        .eq('is_bot', false)
        .limit(10);

      if (!allTimeError && topAllTime && topAllTime.length > 0) {
        const { data: topHistory } = await supabaseAdmin
          .from('user_points_monthly')
          .select('total_points')
          .in('user_id', topAllTime.map(u => u.user_id))
          .order('total_points', { ascending: false })
          .limit(1);

        if (topHistory && topHistory.length > 0) {
          topRealPoints = Math.max(topHistory[0].total_points, 100);
        }
      }
    }

    if (topRealPoints < 100) topRealPoints = 1000; // Sensible default for simulation

    console.log(`Reference points for simulation: ${topRealPoints}`);

    // Step 4: Process each bot
    const results: { name: string; pointsAwarded: number; currentTotal: number }[] = [];

    for (const profile of botProfiles) {
      const botName = profile.display_name || 'Unknown Bot';
      const config = configMap.get(profile.user_id);
      
      // Default config values if not found
      const personalityType = config?.personality_type || 'steady';
      const maxPointPercentage = config?.max_point_percentage || 60;
      const maxPoints = Math.floor(topRealPoints * (maxPointPercentage / 100));

      // Get bot's current points for this month
      const { data: currentPoints } = await supabaseAdmin
        .from('user_points_monthly')
        .select('total_points')
        .eq('user_id', profile.user_id)
        .eq('month_year', currentMonth)
        .single();

      const botCurrentPoints = currentPoints?.total_points || 0;
      
      // Calculate how many points the bot can still earn
      const pointsRemaining = maxPoints - botCurrentPoints;
      
      if (pointsRemaining <= 0) {
        console.log(`Bot ${botName} at cap (${botCurrentPoints}/${maxPoints}), skipping...`);
        results.push({ name: botName, pointsAwarded: 0, currentTotal: botCurrentPoints });
        continue;
      }

      // Determine activity level based on personality
      let activityChance: number;
      let maxActionsPerRun: number;
      
      switch (personalityType) {
        case 'aggressive':
          activityChance = 0.9; // 90% chance to be active
          maxActionsPerRun = randomBetween(3, 5);
          break;
        case 'steady':
          activityChance = 0.7;
          maxActionsPerRun = randomBetween(2, 4);
          break;
        case 'casual':
          activityChance = 0.5;
          maxActionsPerRun = randomBetween(1, 3);
          break;
        case 'low_activity':
        default:
          activityChance = 0.3;
          maxActionsPerRun = randomBetween(1, 2);
          break;
      }

      // Random chance to skip this bot entirely (adds natural variation)
      if (Math.random() > activityChance) {
        console.log(`Bot ${botName} not active this run`);
        results.push({ name: botName, pointsAwarded: 0, currentTotal: botCurrentPoints });
        continue;
      }

      let totalPointsAwarded = 0;
      const numActions = randomBetween(1, maxActionsPerRun);

      for (let i = 0; i < numActions; i++) {
        const action = pickRandomAction();
        
        // Don't exceed the bot's cap
        if (botCurrentPoints + totalPointsAwarded + action.points > maxPoints) {
          console.log(`Bot ${botName} would exceed cap, stopping actions`);
          break;
        }

        // Generate a unique action ID to prevent duplicates
        const actionId = `bot-${profile.user_id}-${Date.now()}-${i}`;

        // Award points using the database function
        // Note: award_user_points RPC expected parameters are (_user_id, _points, _action_type, _action_id, _metadata)
        const { data: awardResult, error: awardError } = await supabaseAdmin
          .rpc('award_user_points', {
            _user_id: profile.user_id,
            _points: action.points,
            _action_type: action.type,
            _action_id: actionId,
            _metadata: { simulated: true, run_timestamp: new Date().toISOString() }
          });

        if (awardError) {
          console.error(`Error awarding points to ${botName}:`, awardError);

          // Fallback: Try direct insertion if RPC fails (useful if RPC is not available or has different signature)
          console.log(`Attempting direct insert for ${botName}...`);
          const { error: insertError } = await supabaseAdmin
            .from('user_points')
            .insert({
              user_id: profile.user_id,
              points: action.points,
              action_type: action.type,
              action_id: actionId,
              metadata: { simulated: true, run_timestamp: new Date().toISOString() }
            });

          if (!insertError) {
            totalPointsAwarded += action.points;
          } else {
            console.error(`Direct insert also failed for ${botName}:`, insertError);
          }
        } else {
          // RPC success handling
          // The RPC might return an array of results or just a single result depending on implementation
          const result = Array.isArray(awardResult) ? awardResult[0] : awardResult;
          if (result?.success || result?.points_awarded) {
            totalPointsAwarded += result.points_awarded || action.points;
          } else {
             // Some RPCs return success: false but still worked, or have different return shapes
             console.log(`RPC returned unusual result for ${botName}:`, awardResult);
             totalPointsAwarded += action.points;
          }
        }

        // Small delay to prevent overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      const newTotal = botCurrentPoints + totalPointsAwarded;
      console.log(`Bot ${botName}: awarded ${totalPointsAwarded} points, new total: ${newTotal}/${maxPoints}`);
      results.push({ name: botName, pointsAwarded: totalPointsAwarded, currentTotal: newTotal });
    }

    const totalAwarded = results.reduce((sum, r) => sum + r.pointsAwarded, 0);
    const activeBots = results.filter(r => r.pointsAwarded > 0).length;

    return new Response(JSON.stringify({
      success: true,
      message: `Simulation complete. ${activeBots} bots active, ${totalAwarded} total points awarded.`,
      topRealUserPoints: topRealPoints,
      results
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in simulate-bot-activity:', error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
