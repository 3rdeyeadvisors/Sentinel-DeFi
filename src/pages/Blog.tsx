import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { getBlogPosts, getBlogPostsByCategory, getBlogCategories } from "@/data/blogContent";
import SEO from "@/components/SEO";

const Blog = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentFeaturedIndex, setCurrentFeaturedIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  const posts = getBlogPostsByCategory(selectedCategory);
  
  // Helper to parse date strings as local dates to avoid timezone issues
  const parseLocalDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  };
  
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  const featuredPosts = posts.filter(post => {
    const postDate = parseLocalDate(post.date);
    return !isNaN(postDate.getTime()) && postDate >= cutoff && post.featured === true;
  });
  
  const regularPosts = posts.filter(post => {
    const postDate = parseLocalDate(post.date);
    return !isNaN(postDate.getTime()) && (postDate < cutoff || post.featured !== true);
  });

  const categories = getBlogCategories();

  // Simplified sliding handlers
  const handleStart = (clientX: number) => {
    setIsDragging(true);
    setStartX(clientX);
    setTranslateX(0);
  };

  const handleMove = (clientX: number) => {
    if (!isDragging) return;
    const diff = clientX - startX;
    setTranslateX(diff);
  };

  const handleEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    const threshold = 50;
    if (translateX > threshold && currentFeaturedIndex > 0) {
      setCurrentFeaturedIndex(currentFeaturedIndex - 1);
    } else if (translateX < -threshold && currentFeaturedIndex < featuredPosts.length - 1) {
      setCurrentFeaturedIndex(currentFeaturedIndex + 1);
    }
    setTranslateX(0);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "DeFi Education":
      case "Education": 
        return "bg-awareness/20 text-awareness-foreground border-awareness/40 hover:bg-awareness/30";
      case "Security": 
        return "bg-primary/20 text-primary-foreground border-primary/40 hover:bg-primary/30";
      case "Innovation": 
        return "bg-accent/20 text-accent-foreground border-accent/40 hover:bg-accent/30";
      case "DeFi Tools":
      case "Tools": 
        return "bg-secondary/20 text-secondary-foreground border-secondary/40 hover:bg-secondary/30";
      case "Analysis": 
        return "bg-muted text-muted-foreground border-border hover:bg-muted/80";
      case "Web3 Gaming":
        return "bg-accent/20 text-accent-foreground border-accent/40 hover:bg-accent/30";
      case "DeFAI":
      case "DEFAI":
        return "bg-primary text-primary-foreground border-primary/60 hover:bg-primary/90";
      case "Regulation":
      case "Policy":
        return "bg-primary text-primary-foreground border-primary/60 hover:bg-primary/90";
      case "DeFi Trends":
        return "bg-primary text-primary-foreground border-primary/60 hover:bg-primary/90";
      default: 
        return "bg-primary/20 text-primary-foreground border-primary/40 hover:bg-primary/30";
    }
  };

  return (
    <>
      <SEO 
        title="DeFi Blog: Cryptocurrency Articles & Blockchain Education"
        description="Expert DeFi blog with cryptocurrency analysis, yield farming insights, blockchain education, and DeFi security guides. Stay updated with the latest decentralized finance trends and strategies."
        keywords="DeFi blog, cryptocurrency articles, blockchain education, DeFi analysis, crypto news, yield farming insights, DeFi security, cryptocurrency trends, blockchain analysis"
        url="https://www.the3rdeyeadvisors.com/blog"
        schema={{
          type: 'WebPage',
          data: {
            mainEntity: {
              "@type": "Blog",
              name: "3rdeyeadvisors DeFi Blog",
              description: "Educational content about decentralized finance, cryptocurrency, and blockchain technology"
            }
          }
        }}
        faq={[
          {
            question: "What topics does your DeFi blog cover?",
            answer: "Our DeFi blog covers yield farming strategies, cryptocurrency analysis, blockchain technology insights, DeFi security best practices, market trends, and educational content for all skill levels."
          },
          {
            question: "How often do you publish new cryptocurrency articles?",
            answer: "We regularly publish new articles covering the latest DeFi developments, market analysis, and educational content. Our blog is updated with fresh insights on decentralized finance trends and opportunities."
          },
          {
            question: "Are your DeFi articles suitable for beginners?",
            answer: "Yes! Our blog features content for all levels, from beginner-friendly explanations of DeFi concepts to advanced analysis for experienced crypto investors. Each article is clearly marked by difficulty level."
          }
        ]}
      />
      <div className="py-12 md:py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-consciousness font-bold text-foreground mb-4">
            Blog & Articles
          </h1>
          <p className="text-xl text-muted-foreground font-consciousness max-w-2xl mx-auto">
            Insights, analysis, and consciousness expansion for the evolving DeFi ecosystem
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <Badge 
              key={category}
              className={`px-4 py-2 cursor-pointer transition-all duration-cosmic hover:scale-105 ${
                category === selectedCategory 
                  ? "bg-primary/40 text-primary border-primary/60" 
                  : getCategoryColor(category)
              }`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Badge>
          ))}
        </div>

        {/* Debug Info */}
        {posts.length === 0 && (
          <div className="text-center p-8 bg-red-100 text-red-800 rounded">
            <p>No blog posts found! Debug info:</p>
            <p>Selected Category: {selectedCategory}</p>
            <p>Posts array length: {posts.length}</p>
          </div>
        )}
        

        {/* Featured Posts Section */}
        {featuredPosts.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl section-heading mb-6">Featured This Week</h2>
            <div className="max-w-xs md:max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto">
              <Card 
                className="p-6 md:p-8 bg-gradient-consciousness border-primary/20 shadow-consciousness cursor-grab active:cursor-grabbing select-none"
                ref={sliderRef}
                onMouseDown={(e) => handleStart(e.clientX)}
                onMouseMove={(e) => handleMove(e.clientX)}
                onMouseUp={handleEnd}
                onMouseLeave={handleEnd}
                onTouchStart={(e) => handleStart(e.touches[0].clientX)}
                onTouchMove={(e) => handleMove(e.touches[0].clientX)}
                onTouchEnd={handleEnd}
              >
                <div className="overflow-hidden">
                  <div 
                    className={`flex ${isDragging ? '' : 'transition-transform duration-300 ease-out'}`}
                    style={{ 
                      transform: `translateX(${-currentFeaturedIndex * 100 + (isDragging ? (translateX / (sliderRef.current?.offsetWidth || 320)) * 100 : 0)}%)` 
                    }}
                  >
                    {featuredPosts.map((post) => (
                      <div key={post.id} className="w-full flex-shrink-0 flex flex-col">
                        {/* Badge */}
                        <div className="flex justify-center mb-4">
                          <Badge className={`w-fit ${getCategoryColor(post.category)}`}>
                            {post.category}
                          </Badge>
                        </div>

                        {/* Content */}
                        <h3 className="text-xl md:text-2xl font-consciousness font-semibold text-foreground mb-3 line-clamp-2 text-center">
                          {post.title}
                        </h3>
                        
                        <p className="text-base md:text-lg text-muted-foreground font-consciousness mb-4 leading-relaxed line-clamp-3 text-center max-w-2xl mx-auto">
                          {post.excerpt}
                        </p>
                        
                        {/* Footer */}
                        <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground mb-6">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span className="font-system">{parseLocalDate(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span className="font-system">{post.readTime}</span>
                          </div>
                        </div>
                        
                        <div className="flex justify-center">
                          <Button 
                            variant="outline" 
                            size="lg"
                            className="font-consciousness bg-background/90 hover:bg-primary/10 border-primary/40 px-8"
                            onClick={() => navigate(`/blog/${post.slug}`)}
                          >
                            Read More
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Navigation bars */}
                {featuredPosts.length > 1 && (
                  <div className="flex mt-3 pt-3 border-t border-primary/20">
                    {featuredPosts.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentFeaturedIndex(index)}
                        className={`flex-1 h-1 transition-colors ${
                          index === currentFeaturedIndex 
                            ? 'bg-primary' 
                            : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </div>
        )}

        {/* Regular Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {regularPosts.map((post, index) => (
            <Card 
              key={post.id}
              className="p-6 bg-card/60 border-border hover:border-primary/40 transition-all duration-cosmic hover:shadow-consciousness group flex flex-col h-full"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <Badge className={`mb-4 ${getCategoryColor(post.category)}`}>
                {post.category}
              </Badge>
              
              <h3 className="text-xl font-consciousness font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
                {post.title}
              </h3>
              
              <p className="text-muted-foreground font-consciousness mb-4 leading-relaxed flex-grow">
                {post.excerpt}
              </p>
              
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span className="font-system">{parseLocalDate(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span className="font-system">{post.readTime}</span>
                </div>
              </div>
              
              <Button 
                variant="cosmic" 
                size="sm" 
                className="w-full font-consciousness"
                onClick={() => navigate(`/blog/${post.slug}`)}
              >
                Read More
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
    </>
  );
};

export default Blog;