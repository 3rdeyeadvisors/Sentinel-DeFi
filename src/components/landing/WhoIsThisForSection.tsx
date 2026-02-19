import { Shield, Briefcase, Building } from 'lucide-react';
import AnimatedSection from './AnimatedSection';

const personas = [
  {
    icon: <Shield className="w-7 h-7" />,
    tag: "For the cautious beginner",
    headline: "You heard about crypto but you are scared to touch it",
    body: "Smart. Most people lose money because they skip the foundation. We start with the basics: what a wallet actually is, how to keep it secure, and why none of this requires trusting a stranger on the internet.",
  },
  {
    icon: <Briefcase className="w-7 h-7" />,
    tag: "For the professional catching up",
    headline: "Your clients are asking about crypto and you have no answer",
    body: "Financial advisors, accountants, and lawyers are watching their clients move money into assets they cannot explain, track, or advise on. We bridge that gap so you can advise with confidence instead of deflecting.",
  },
  {
    icon: <Building className="w-7 h-7" />,
    tag: "For the self-directed investor",
    headline: "You are tired of asking permission to access your own money",
    body: "Lending protocols, staking, yield strategies. We teach you how decentralized finance actually works so you can participate directly. No broker. No minimum balance. No geography required.",
  },
];

const WhoIsThisForSection = () => {
  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <AnimatedSection animation="fade-up" className="text-center mb-16">
          <h2 className="font-consciousness text-3xl md:text-5xl font-bold text-white mb-6">
            Who Is This For?
          </h2>
          <p className="font-body text-lg text-white/50 max-w-2xl mx-auto">
            Whether you are protecting a family estate or advising high net worth clients, the rules of money have changed.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {personas.map((persona, index) => (
            <AnimatedSection key={index} animation="fade-up" delay={index * 100}>
              <div className="h-full p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md hover:border-violet-500/30 transition-all duration-300">
                <div className="w-14 h-14 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-6">
                  {persona.icon}
                </div>
                <span className="inline-block font-body text-xs uppercase tracking-widest text-violet-400 border border-violet-500/30 bg-violet-500/10 rounded-full px-3 py-1 mb-3">
                  {persona.tag}
                </span>
                <h3 className="font-consciousness text-xl font-bold text-white mb-4 leading-snug">
                  {persona.headline}
                </h3>
                <p className="font-body text-white/50 leading-relaxed">
                  {persona.body}
                </p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhoIsThisForSection;
