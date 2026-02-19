import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import AnimatedSection from './AnimatedSection';

const benefits = [
  "Beat inflation. Stop watching your money lose value",
  "True ownership. Assets only you control",
  "No borders. Access financial tools from anywhere",
  "No permission needed. No credit checks, no gatekeepers"
];

const CTASection = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-violet-600/5 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6">
        <div className="relative z-10 p-8 md:p-16 rounded-[2.5rem] border border-violet-500/20 bg-gradient-to-br from-violet-600/10 via-black to-black overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/10 blur-[100px] -translate-y-1/2 translate-x-1/2" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <AnimatedSection animation="fade-right">
              <h2 className="font-consciousness text-4xl md:text-6xl font-bold text-white mb-8 leading-tight">
                Ready to Begin Your Journey?
              </h2>
              <p className="font-body text-xl text-white/60 mb-10 leading-relaxed">
                Start learning today. No hype. No confusion. Just clear education.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/auth">
                  <Button size="lg" className="font-body bg-violet-600 hover:bg-violet-500 text-white px-10 py-7 text-lg rounded-2xl shadow-xl shadow-violet-900/20 flex items-center gap-2 group w-full sm:w-auto">
                    Create Your Account
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/courses">
                  <Button variant="outline" size="lg" className="font-body border-white/10 hover:border-white/20 text-white px-10 py-7 text-lg rounded-2xl w-full sm:w-auto">
                    Explore Courses
                  </Button>
                </Link>
              </div>
            </AnimatedSection>

            <AnimatedSection animation="fade-left" className="space-y-6">
              <p className="font-body text-lg text-white/80 mb-8 italic">
                Your bank can freeze your account. Your government can inflate your savings away. DeFi gives you tools they cannot control. This is not about getting rich. It is about reclaiming ownership of what is yours.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-violet-400 flex-shrink-0" />
                    <span className="font-body text-white/70">{benefit}</span>
                  </div>
                ))}
              </div>
            </AnimatedSection>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
