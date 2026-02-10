import { Card } from "@/components/ui/card";
import SEO from "@/components/SEO";
import { Shield, Brain, Zap, Heart } from "lucide-react";
import AnimatedSection from "@/components/landing/AnimatedSection";

const OurStory = () => {
  const values = [
    {
      icon: Shield,
      title: "Protection",
      description: "Securing financial futures through decentralized sovereignty."
    },
    {
      icon: Brain,
      title: "Education",
      description: "Empowering individuals with the knowledge to navigate the new financial paradigm."
    },
    {
      icon: Zap,
      title: "Empowerment",
      description: "Providing the tools and confidence to take control of your own assets."
    }
  ];

  return (
    <>
      <SEO
        title="Our Story - Nina Armend & 3EA"
        description="Learn about the journey of Nina Armend and the mission behind 3EA (3rdeyeadvisors) to democratize financial consciousness through DeFi."
        keywords="Nina Armend, 3rdeyeadvisors, DeFi story, financial consciousness, founder journey"
        url="https://www.the3rdeyeadvisors.com/our-story"
      />

      <div className="py-12 md:py-20 lg:py-24">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-10">
          {/* Header Section */}
          <div className="text-center mb-14 md:mb-20">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-consciousness font-bold text-foreground mb-6 animate-awareness-float leading-tight">
              Our Story
            </h1>
            <p className="text-lg md:text-xl text-primary font-consciousness animate-cosmic-pulse">
              Bridging the gap between traditional finance and the decentralized future.
            </p>
          </div>

          {/* Founder Section */}
          <AnimatedSection>
            <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16 mb-20">
              <div className="w-48 h-48 md:w-64 md:h-64 flex-shrink-0 relative group">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl group-hover:bg-primary/30 transition-all duration-500" />
                <img
                  src="/lovable-uploads/aefbbf1a-e30e-4002-9925-836a5e183a48.png"
                  alt="Nina Armend - Founder of 3EA"
                  className="w-full h-full object-cover rounded-full border-2 border-primary/30 shadow-consciousness relative z-10 transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl md:text-3xl font-consciousness font-bold text-foreground mb-4">
                  Meet the Founder
                </h2>
                <h3 className="text-xl text-primary font-consciousness font-semibold mb-6">
                  Nina Armend
                </h3>
                <div className="space-y-4 text-foreground/80 font-consciousness leading-relaxed">
                  <p>
                    Nina Armend founded 3EA with a single mission: to make financial sovereignty accessible to everyone.
                    With a background in both traditional finance and emerging technologies, Nina saw the transformative
                    potential of DeFi early on.
                  </p>
                  <p>
                    She realized that while the technology was revolutionary, the barrier to entry was often too high due
                    to complexity and a lack of clear, consciousness-driven education.
                  </p>
                </div>
              </div>
            </div>
          </AnimatedSection>

          {/* Mission Section */}
          <div className="mb-20">
            <Card className="p-8 md:p-12 bg-card/60 border-border backdrop-blur-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/10 transition-all duration-500" />
              <div className="relative z-10 text-center max-w-2xl mx-auto">
                <Heart className="w-12 h-12 text-primary mx-auto mb-6 opacity-80" />
                <h2 className="text-2xl md:text-3xl font-consciousness font-bold text-foreground mb-6">
                  The Mission
                </h2>
                <p className="text-base md:text-lg text-foreground/70 font-consciousness leading-relaxed">
                  We believe that financial freedom is a fundamental right, not a privilege. Our goal is to empower
                  1 million individuals to take control of their financial destiny through education, community,
                  and the tools provided by the decentralized ecosystem.
                </p>
              </div>
            </Card>
          </div>

          {/* Values Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
            {values.map((value, index) => (
              <Card
                key={value.title}
                className="p-6 bg-card/40 border-border hover:border-primary/40 transition-all duration-500 hover:shadow-consciousness group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4 p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <value.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h4 className="text-lg font-consciousness font-bold text-foreground mb-2">
                    {value.title}
                  </h4>
                  <p className="text-sm text-foreground/60 font-consciousness leading-relaxed">
                    {value.description}
                  </p>
                </div>
              </Card>
            ))}
          </div>

          {/* Final Call to Action */}
          <div className="text-center">
            <Card className="p-8 md:p-10 bg-gradient-consciousness border-primary/20 shadow-consciousness relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(155,135,245,0.1),transparent)] pointer-events-none" />
              <h2 className="text-xl md:text-2xl font-consciousness font-bold text-foreground mb-4">
                Join the Evolution
              </h2>
              <p className="text-base md:text-lg text-primary-glow font-consciousness font-medium max-w-xl mx-auto">
                Your journey towards financial sovereignty starts here. Be part of the story we're writing together.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default OurStory;
