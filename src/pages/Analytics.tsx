import { DefiCharts } from '@/components/DefiCharts';
import { CryptoPricesWidget } from '@/components/CryptoPricesWidget';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Activity, BarChart3, AlertTriangle } from 'lucide-react';
import SEO from '@/components/SEO';

const Analytics = () => {
  return (
    <>
      <SEO 
        title="DeFi Analytics & Market Data: Real-Time Protocol Insights"
        description="Live DeFi analytics dashboard powered by DefiLlama API with real-time market data, yield farming insights, TVL tracking, and protocol performance metrics from Aave, Uniswap, and 200+ protocols."
        keywords="DeFi analytics, real-time DeFi data, DefiLlama API, yield farming analytics, TVL tracking, DeFi market insights, protocol analytics, crypto market data, DeFi charts, blockchain analytics, Aave data, Uniswap analytics"
        url="https://www.the3rdeyeadvisors.com/analytics"
        schema={{
          type: 'SoftwareApplication',
          data: {
            applicationCategory: "FinanceApplication",
            operatingSystem: "Web Browser",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD"
            },
            featureList: [
              "Real-time DeFi protocol data",
              "Yield farming analytics",
              "TVL tracking and insights",
              "Market performance metrics",
              "Interactive DeFi charts"
            ]
          }
        }}
        faq={[
          {
            question: "What DeFi analytics data do you provide?",
            answer: "Our analytics dashboard provides real-time data on DeFi protocols including Total Value Locked (TVL), yield farming rates, liquidity pool performance, and market trends across major DeFi platforms."
          },
          {
            question: "How accurate is your DeFi market data?",
            answer: "Our DeFi analytics are updated every 5 minutes and sourced from multiple reliable data providers to ensure accuracy. We track over 200+ DeFi protocols and their performance metrics."
          },
          {
            question: "Can I use this data for investment decisions?",
            answer: "Our analytics provide educational insights for learning purposes. While the data reflects real market patterns, always conduct your own research and consider multiple sources before making any investment decisions."
          }
        ]}
      />
      <div className="min-h-screen pt-20 pb-8">
      <div className="container mx-auto px-4 mobile-typography-center">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BarChart3 className="w-12 h-12 text-primary" />
            <h1 className="text-4xl md:text-5xl font-consciousness font-bold text-foreground">
              DeFi Analytics
            </h1>
          </div>
          <p className="text-xl text-muted-foreground font-consciousness max-w-3xl mx-auto">
            Real-time market data from DefiLlama API, tracking 200+ protocols with live updates every 5 minutes
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <Badge variant="secondary" className="animate-pulse">
              <Activity className="w-4 h-4 mr-2" />
              Live Data
            </Badge>
            <Badge variant="outline">
              <TrendingUp className="w-4 h-4 mr-2" />
              Auto-Updates Every 5 min
            </Badge>
          </div>
        </div>

        {/* Live Crypto Prices */}
        <CryptoPricesWidget />

        {/* Live Analytics Dashboard */}
        <div className="mt-6">
          <DefiCharts />
        </div>

        {/* Market Insights Card */}
        <Card className="mt-6 p-6 bg-card/60 border-border">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-4 text-center md:text-left">
            <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-1" />
            <div className="max-w-none md:max-w-full">
              <h3 className="text-lg font-consciousness font-semibold text-foreground mb-2">
                Market Data Disclaimer
              </h3>
              <p className="text-muted-foreground font-consciousness leading-relaxed">
                This data is sourced live from DefiLlama API and leading DeFi protocols for educational and informational purposes. 
                While the data represents real market conditions, it should not be used as the sole basis for investment decisions. 
                Always verify data from multiple sources and conduct your own research before making any financial decisions in the DeFi space.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
    </>
  );
};

export default Analytics;