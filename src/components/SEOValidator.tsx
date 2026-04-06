/**
 * SEO Validation Component
 * Real-time SEO monitoring and validation for development
 */

import { useState } from 'react';
import { AlertTriangle, CheckCircle, AlertCircle, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSEOMonitoring } from '@/hooks/useSEOAutomation';

interface SEOValidatorProps {
  showInProduction?: boolean;
  minimized?: boolean;
}

const SEOValidator = ({ 
  showInProduction = false, 
  minimized = false 
}: SEOValidatorProps) => {
  const { issues, score } = useSEOMonitoring();
  const [isVisible, setIsVisible] = useState(true);
  const [isMinimized, setIsMinimized] = useState(minimized);

  // Hide in production unless explicitly shown
  if (!showInProduction && process.env.NODE_ENV === 'production') {
    return null;
  }

  if (!isVisible) {
    return null;
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-awareness bg-awareness/20';
    if (score >= 70) return 'text-accent bg-accent/20';
    return 'text-destructive bg-destructive/20';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 90) return <CheckCircle className="w-4 h-4" />;
    if (score >= 70) return <AlertTriangle className="w-4 h-4" />;
    return <AlertCircle className="w-4 h-4" />;
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsMinimized(false)}
          variant="outline"
          size="sm"
          className={`${getScoreColor(score)} border-current`}
        >
          {getScoreIcon(score)}
          <span className="ml-2">SEO: {score}%</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Card className="p-4 shadow-lg border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Badge className={getScoreColor(score)}>
              {getScoreIcon(score)}
              <span className="ml-1">SEO Score: {score}%</span>
            </Badge>
          </div>
          <div className="flex gap-1">
            <Button
              onClick={() => setIsMinimized(true)}
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
            >
              −
            </Button>
            <Button
              onClick={() => setIsVisible(false)}
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {issues.length === 0 ? (
          <div className="flex items-center gap-2 text-awareness">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm">All SEO checks passed!</span>
          </div>
        ) : (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-foreground">
              Issues Found ({issues.length})
            </h4>
            <ul className="space-y-1">
              {issues.map((issue, index) => (
                <li key={index} className="flex items-start gap-2">
                  <AlertTriangle className="w-3 h-3 text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-xs text-muted-foreground">{issue}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-3 pt-3 border-t border-border">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Real-time monitoring</span>
            <span>DEV</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SEOValidator;