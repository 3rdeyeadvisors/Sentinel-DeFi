import { BookOpen, Video, Trophy, Users, Zap, Shield } from 'lucide-react';
import AnimatedSection from './AnimatedSection';

const offerings = [
  {
    icon: BookOpen,
    label: "Structured Courses",
    headline: "Zero to DeFi in weeks, not years",
    body: "Five complete courses built for beginners. Start with how a blockchain works and finish understanding yield farming, staking, and protocol governance.",
    accent: "violet"
  },
  {
    icon: Video,
    label: "Step-by-Step Tutorials",
    headline: "Follow along. Do it live. Get it done.",
    body: "Twelve hands-on tutorials walk you through real actions: setting up your first wallet, making your first swap, reading on-chain data without getting lost.",
    accent: "blue"
  },
  {
    icon: Trophy,
    label: "Quizzes and Badges",
    headline: "Prove what you know. Earn what you deserve.",
    body: "Every module has a quiz. Pass it and earn a badge. Build a track record of verified knowledge that you actually own.",
    accent: "amber"
  },
  {
    icon: Shield,
    label: "Security Training",
    headline: "The one thing most courses skip entirely",
    body: "Scam identification, wallet security, smart contract risk, rug pull patterns. The skills that protect your capital before you ever deploy it.",
    accent: "green"
  },
  {
    icon: Users,
    label: "Community Powered",
    headline: "Learn with people who are figuring it out too",
    body: "Comments, Q&A, discussions, and ratings on every piece of content. The community votes on the roadmap. You help build what comes next.",
    accent: "violet"
  },
  {
    icon: Zap,
    label: "Orion AI Assistant",
    headline: "Ask anything. Get a straight answer.",
    body: "Orion is our built-in AI tutor. Ask it to explain a concept in simpler terms, quiz you on what you just learned, or help you understand a protocol.",
    accent: "purple"
  }
];

const accentMap: Record<string, string> = {
  violet: "border-violet-500/30 bg-violet-500/5 text-violet-400",
  blue: "border-blue-500/30 bg-blue-500/5 text-blue-400",
  amber: "border-amber-500/30 bg-amber-500/5 text-amber-400",
  green: "border-emerald-500/30 bg-emerald-500/5 text-emerald-400",
  purple: "border-purple-500/30 bg-purple-500/5 text-purple-400",
};

const FeaturesSection = () => {
  return (
    <section className="py-16 md:py-24 relative">
      <div className="max-w-7xl mx-auto px-6">
        <AnimatedSection animation="fade-up" className="text-center mb-14">
          <span className="inline-block font-body text-xs uppercase tracking-widest text-violet-400 mb-4">What Is Inside</span>
          <h2 className="font-consciousness text-3xl md:text-5xl font-bold text-white mb-5">
            One Platform. Everything You Need.
          </h2>
          <p className="font-body text-lg text-white/50 max-w-2xl mx-auto">
            Not a YouTube channel. Not a newsletter. A structured education system built to take you from confused to capable.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {offerings.map((item, index) => {
            const accent = accentMap[item.accent] || accentMap.violet;
            return (
              <AnimatedSection key={item.label} animation="fade-up" delay={index * 80}>
                <div className="group h-full p-6 rounded-2xl border border-white/8 bg-white/3 hover:border-violet-500/30 hover:bg-violet-500/5 transition-all duration-300 backdrop-blur-sm">
                  <div className={`inline-flex p-2.5 rounded-xl border mb-4 ${accent}`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <p className="font-body text-xs uppercase tracking-widest text-white/40 mb-1">{item.label}</p>
                  <h3 className="font-consciousness text-lg font-semibold text-white mb-3 leading-snug">{item.headline}</h3>
                  <p className="font-body text-sm text-white/50 leading-relaxed">{item.body}</p>
                </div>
              </AnimatedSection>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
