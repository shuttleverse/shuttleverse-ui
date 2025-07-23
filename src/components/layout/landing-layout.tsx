import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

interface LandingLayoutProps {
  children: React.ReactNode;
}

const LandingLayout: React.FC<LandingLayoutProps> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
    setIsMenuOpen(false);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-bold text-primary">
                Shuttleverse
              </Link>
            </div>

            <div className="flex items-center">
              <div className="hidden md:flex items-center space-x-1">
                <button
                  onClick={() => scrollToSection("features")}
                  className="px-4 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-primary hover:underline decoration-primary decoration-2 underline-offset-4 transition-colors"
                >
                  Features
                </button>
                <button
                  onClick={() => scrollToSection("about")}
                  className="px-4 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-primary hover:underline decoration-primary decoration-2 underline-offset-4 transition-colors"
                >
                  About
                </button>
              </div>

              <button
                className="md:hidden p-2 text-gray-600 hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {isMenuOpen && (
            <div className="md:hidden py-4 border-t">
              <div className="flex flex-col space-y-4">
                <button
                  onClick={() => scrollToSection("features")}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary rounded-md transition-colors hover:underline decoration-primary decoration-2 underline-offset-4 text-left w-full"
                >
                  Features
                </button>
                <button
                  onClick={() => scrollToSection("about")}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary rounded-md transition-colors hover:underline decoration-primary decoration-2 underline-offset-4 text-left w-full"
                >
                  About
                </button>
                <Button
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors w-full"
                  asChild
                >
                  <Link to="/home">Get Started</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </nav>

      <main className="flex-grow">{children}</main>

      <footer className="bg-gray-50 py-8">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-600 mb-4 md:mb-0">
              © 2024 Shuttleverse. All rights reserved.
            </div>
            <div className="flex space-x-6">
              <Link
                to="/privacy"
                className="text-gray-600 hover:text-primary hover:underline transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms"
                className="text-gray-600 hover:text-primary hover:underline transition-colors"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingLayout;
