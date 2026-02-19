import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Wallet, BarChart3, Shield, BookOpen, Globe } from "lucide-react";
import DefiCalculators from "@/components/DefiCalculators";
import NewsletterSignup from "@/components/NewsletterSignup";
import SEO from "@/components/SEO";

const Resources = () => {
  const resourceCategories = [
    {
      title: "Trusted Wallets",
      icon: Wallet,
      description: "Secure, beginner-friendly wallets for safe DeFi interaction",
      resources: [
        { name: "MetaMask", description: "Most popular and user-friendly browser wallet for Ethereum DeFi", url: "https://metamask.io", verified: true },
        { name: "Trust Wallet", description: "Mobile-first wallet with built-in DeFi browser and staking", url: "https://trustwallet.com", verified: true },
        { name: "Ledger Hardware Wallet", description: "Ultimate security for storing larger amounts long-term", url: "https://ledger.com", verified: true }
      ]
    },
    {
      title: "Portfolio Trackers",
      icon: BarChart3,
      description: "Track your DeFi positions across multiple chains and protocols",
      resources: [
        { name: "DeBank", description: "Clean, comprehensive multi-chain portfolio tracking", url: "https://debank.com", verified: true },
        { name: "Zapper", description: "Portfolio management with DeFi position entry/exit tools", url: "https://zapper.fi", verified: true },
        { name: "DeFiLlama", description: "Best source for protocol data and TVL tracking", url: "https://defillama.com", verified: true }
      ]
    },
    {
      title: "Beginner-Friendly DEXs",
      icon: Globe,
      description: "Decentralized exchanges perfect for first-time DeFi users",
      resources: [
        { name: "Uniswap", description: "Most trusted and liquid DEX on Ethereum", url: "https://uniswap.org", verified: true },
        { name: "PancakeSwap", description: "Popular Binance Smart Chain DEX with lower fees", url: "https://pancakeswap.finance", verified: true },
        { name: "1inch", description: "DEX aggregator that finds you the best swap rates", url: "https://1inch.io", verified: true }
      ]
    },
    {
      title: "Educational Resources",
      icon: BookOpen,
      description: "Practical guides and templates for financial planning",
      resources: [
        { name: "DeFi Security Guide", description: "Essential security steps before using any DeFi protocol: downloadable guide", url: "/resources/security-guide.pdf", verified: true }
      ]
    },
    {
      title: "Learning Resources",
      icon: Shield,
      description: "Official educational resources and deeper reading",
      resources: [
        { name: "CoinGecko Learn", description: "Comprehensive crypto and DeFi educational articles", url: "https://coinmarketcap.com/academy", verified: true },
        { name: "Ethereum.org DeFi Guide", description: "Official Ethereum Foundation DeFi documentation", url: "https://ethereum.org/defi", verified: true },
        { name: "Our Blog Articles", description: "In-depth guides and analysis from our education team", url: "/blog", verified: true }
      ]
    }
  ];

  return (
    <>
      <SEO 
        title="DeFi Tools & Calculators: Essential Resources for Crypto Investing"
        description="Comprehensive DeFi tools including yield farming calculators, portfolio trackers, trusted wallets, and essential platforms for decentralized finance investing and passive income strategies."
        keywords="DeFi calculators, crypto tools, yield farming calculator, DeFi portfolio tracker, cryptocurrency calculators, DeFi platforms, blockchain tools, passive income calculators"
        url="https://www.the3rdeyeadvisors.com/resources"
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
              "DeFi yield calculators",
              "Portfolio tracking tools",
              "Risk assessment calculators",
              "APY comparison tools",
              "Impermanent loss calculators"
            ]
          }
        }}
        faq={[
          {
            question: "What DeFi calculators do you provide?",
            answer: "We offer comprehensive DeFi calculators including yield farming APY calculators, impermanent loss estimators, portfolio rebalancing tools, and risk assessment calculators to help you make informed DeFi investment decisions."
          },
          {
            question: "Are your DeFi tools free to use?",
            answer: "Yes, all our DeFi calculators and basic tools are completely free. We provide these resources to help educate users about decentralized finance and support informed decision-making in crypto investing."
          },
          {
            question: "Which DeFi platforms do you recommend?",
            answer: "We curate trusted DeFi platforms including leading DEXs, lending protocols, and yield farming platforms. All recommendations are based on security audits, track record, and community trust in the DeFi ecosystem."
          },
          {
            question: "How do I calculate DeFi yields and returns?",
            answer: "Our DeFi calculators help you estimate yields from staking, liquidity providing, and yield farming. Input your investment amount, duration, and platform APY to see projected returns and understand associated risks."
          }
        ]}
      />
      <div className="min-h-screen py-20">
      <div className="container mx-auto px-4 mobile-typography-center">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-consciousness font-bold text-foreground mb-4">
            Resource Hub
          </h1>
          <p className="text-xl text-muted-foreground font-consciousness max-w-2xl mx-auto">
            Curated tools, platforms, and resources to navigate the DeFi ecosystem safely and effectively
          </p>
        </div>

        {/* Resource Categories */}
        <div className="grid gap-12 mb-16">
          {resourceCategories.map((category, categoryIndex) => (
            <section key={category.title} className="space-y-6">
              {/* Category Header */}
              <div className="flex flex-col md:flex-row items-center md:items-start gap-3 pb-4 border-b border-border/50 text-center md:text-left">
                <div className="p-2.5 rounded-lg bg-primary/10">
                  <category.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-consciousness font-bold text-foreground">
                    {category.title}
                  </h2>
                  <p className="text-sm text-muted-foreground font-consciousness">
                    {category.description}
                  </p>
                </div>
              </div>

              {/* Resources Grid - 3 columns on desktop */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {category.resources.map((resource, index) => (
                  <Card 
                    key={resource.name}
                    className="p-5 bg-card/60 border-border hover:border-primary/40 transition-all duration-300 hover:shadow-lg group flex flex-col"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-base font-consciousness font-semibold text-foreground group-hover:text-primary transition-colors leading-tight">
                        {resource.name}
                      </h3>
                      {resource.verified && (
                        <Badge className="bg-awareness/20 text-awareness border-awareness/30 text-xs shrink-0">
                          Verified
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground font-consciousness mb-4 leading-relaxed flex-1">
                      {resource.description}
                    </p>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full font-consciousness text-sm group-hover:border-primary/60 group-hover:text-primary"
                      onClick={() => window.open(resource.url, '_blank')}
                    >
                      Access Resource
                      <ExternalLink className="w-3.5 h-3.5 ml-2" />
                    </Button>
                  </Card>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* DeFi Calculators */}
        <section className="mb-16">
          <DefiCalculators />
        </section>

        {/* Disclaimer */}
        <Card className="mt-16 p-6 bg-secondary/40 border-border">
          <div className="text-center">
            <h3 className="text-lg font-consciousness font-semibold text-foreground mb-3">
              Important Disclaimer
            </h3>
            <p className="text-muted-foreground font-consciousness leading-relaxed">
              These resources are provided for educational purposes only. Always conduct your own research 
              and never invest more than you can afford to lose. DeFi protocols carry inherent risks 
              including smart contract vulnerabilities, impermanent loss, and market volatility.
            </p>
          </div>
        </Card>

        {/* Newsletter Signup */}
        <section className="mt-16">
          <NewsletterSignup variant="default" />
        </section>
      </div>
    </div>
    </>
  );
};

export default Resources;