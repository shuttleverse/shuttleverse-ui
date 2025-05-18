import { Link } from "react-router-dom";
import LandingLayout from "../components/layout/landing-layout";
import { Button } from "@/components/ui/button";

const Index = () => {
  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <LandingLayout>
      <section className="relative min-h-[90vh] bg-primary flex items-center">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl text-white">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
              Welcome to Shuttleverse
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Your ultimate destination for everything badminton. Connect, play,
              and grow with the community.
            </p>
            <div className="flex gap-4">
              <Button
                size="lg"
                variant="default"
                className="bg-white text-primary hover:bg-gray-800 hover:text-white hover:scale-105 transition-all duration-200 shadow-md"
                asChild
              >
                <Link to="/login">Get Started</Link>
              </Button>
              <Button
                size="lg"
                variant="default"
                className="bg-white text-primary hover:bg-gray-800 hover:text-white hover:scale-105 transition-all duration-200 shadow-md"
                onClick={() => scrollToSection("features")}
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 bg-black/20"></div>
      </section>

      <section id="features" className="py-32 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Why Choose Shuttleverse?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover everything you need for your badminton journey in one
              place
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center group">
              <div className="aspect-square rounded-2xl overflow-hidden mb-6 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                <img
                  src="https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                  alt="Find Courts"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Find Courts</h3>
              <p className="text-gray-600 text-lg">
                Discover the best badminton courts in your area
              </p>
            </div>
            <div className="text-center group">
              <div className="aspect-square rounded-2xl overflow-hidden mb-6 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                <img
                  src="https://images.unsplash.com/photo-1613918431703-aa2b9fee3992?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                  alt="Compare Prices"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Compare Prices</h3>
              <p className="text-gray-600 text-lg">
                Find the best deals on badminton equipment and accessories
              </p>
            </div>
            <div className="text-center group">
              <div className="aspect-square rounded-2xl overflow-hidden mb-6 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                <img
                  src="https://images.unsplash.com/photo-1583824349157-5a99322e2a0a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                  alt="Professional Services"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <h3 className="text-2xl font-semibold mb-3">
                Professional Services
              </h3>
              <p className="text-gray-600 text-lg">
                Find coaches, stringers, and equipment suppliers
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="py-32 bg-gray-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5"></div>
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">About Shuttleverse</h2>
              <p className="text-xl text-gray-600">
                More than just a platform – it's a community-driven ecosystem
                for badminton enthusiasts
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <h3 className="text-2xl font-semibold mb-4">Our Mission</h3>
                <p className="text-gray-600 text-lg">
                  To make badminton more accessible and enjoyable for everyone
                  by connecting players with the resources they need.
                </p>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <h3 className="text-2xl font-semibold mb-4">Our Vision</h3>
                <p className="text-gray-600 text-lg">
                  To become the go-to platform for the global badminton
                  community, fostering growth and connection in the sport.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-32 bg-primary text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">
              Ready to Join the Community?
            </h2>
            <p className="text-xl mb-10 opacity-90">
              Sign in with Google to access all features and connect with other
              badminton enthusiasts.
            </p>
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-gray-100 text-lg px-8 py-6"
              onClick={() => (window.location.href = "/login")}
            >
              Sign in with Google
            </Button>
          </div>
        </div>
      </section>
    </LandingLayout>
  );
};

export default Index;
