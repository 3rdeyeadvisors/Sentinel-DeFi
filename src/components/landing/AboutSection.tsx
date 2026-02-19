import { Shield, Lock, Globe } from 'lucide-react';
import AnimatedSection from './AnimatedSection';

const valueProps = [
  {
    icon: Shield,
    title: "Protect Your Wealth",
    subtitle: "Beat inflation and own what is yours"
  },
  {
    icon: Lock,
    title: "True Ownership",
    subtitle: "No banks, no borders, no limits"
  },
  {
    icon: Globe,
    title: "Global Access",
    subtitle: "No geographic discrimination"
  }
];

const AboutSection = () => {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <AnimatedSection animation="fade-right">
            <h2 className="font-consciousness text-4xl md:text-5xl font-bold text-white mb-8">
              What Is 3EA?
            </h2>
            <div className="space-y-6">
              <p className="font-body text-lg text-white/70 leading-relaxed">
                3EA teaches you to protect and grow what you own in a system where no institution can freeze it, inflate it away, or restrict your access to it. This is not an investment course. It is a new way of thinking about money, freedom, and what it means to own something.
              </p>
              <p className="font-body text-lg text-white/70 leading-relaxed">
                Traditional finance locks people out based on geography, credit history, and arbitrary gatekeeping. Decentralized finance opens the door to anyone with an internet connection. We teach you how to walk through it safely.
              </p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {valueProps.map((prop, index) => (
              <AnimatedSection
                key={index}
                animation="fade-up"
                delay={index * 100}
                className={index === 2 ? "sm:col-span-2" : ""}
              >
                <div className="p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
                  <prop.icon className="w-8 h-8 text-violet-400 mb-4" />
                  <h3 className="font-consciousness text-xl font-bold text-white mb-2">{prop.title}</h3>
                  <p className="font-body text-white/40">{prop.subtitle}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
