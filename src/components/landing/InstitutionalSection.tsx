import { Building2, Users2, ShieldCheck, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import AnimatedSection from './AnimatedSection';

const InstitutionalSection = () => {
  return (
    <section className="py-24 relative overflow-hidden bg-violet-950/10">
      <div className="max-w-7xl mx-auto px-6">
        <AnimatedSection animation="fade-up" className="text-center mb-16">
          <h2 className="font-consciousness text-3xl md:text-5xl font-bold text-white mb-6">
            Your Clients Are Already In Crypto
          </h2>
          <p className="font-body text-xl text-white/60 max-w-3xl mx-auto">
            Financial advisors and lawyers across the country are watching high-value clients move money into digital assets they cannot explain, track, or advise on. That gap is a liability.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <AnimatedSection animation="fade-up" delay={100} className="h-full">
            <div className="h-full p-8 rounded-3xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all flex flex-col">
              <Users2 className="w-10 h-10 text-violet-400 mb-6" />
              <h3 className="font-consciousness text-xl font-bold text-white mb-4">Generational Wealth in a New Asset Class</h3>
              <p className="font-body text-white/50 flex-1">
                Estate planning now includes digital assets. Understand how to preserve and transfer them correctly.
              </p>
            </div>
          </AnimatedSection>

          <AnimatedSection animation="fade-up" delay={200} className="h-full">
            <div className="h-full p-8 rounded-3xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all flex flex-col">
              <ShieldCheck className="w-10 h-10 text-violet-400 mb-6" />
              <h3 className="font-consciousness text-xl font-bold text-white mb-4">Personal Portfolio That No One Can Freeze</h3>
              <p className="font-body text-white/50 flex-1">
                Self-custody, yield strategies, and portfolio diversification outside the traditional system.
              </p>
            </div>
          </AnimatedSection>

          <AnimatedSection animation="fade-up" delay={300} className="h-full">
            <div className="h-full p-8 rounded-3xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all flex flex-col">
              <Building2 className="w-10 h-10 text-violet-400 mb-6" />
              <h3 className="font-consciousness text-xl font-bold text-white mb-4">Treasury Diversification and Reserve Management</h3>
              <p className="font-body text-white/50 flex-1">
                Corporations and funds are adding digital asset exposure. We provide the education infrastructure.
              </p>
            </div>
          </AnimatedSection>
        </div>

        <AnimatedSection animation="fade-up" className="flex justify-center">
          <Link to="/contact">
            <Button size="lg" className="font-body bg-white text-black hover:bg-white/90 px-8 py-6 text-lg rounded-xl flex items-center gap-2 group">
              Talk to Us About Your Organization
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default InstitutionalSection;
