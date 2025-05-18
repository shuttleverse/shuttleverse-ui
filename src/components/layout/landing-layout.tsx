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
              <Link to="/" className="text-2xl font-bold text-court-green">
                Shuttleverse
              </Link>
            </div>

            <div className="flex items-center">
              <div className="hidden md:flex items-center gap-8">
                <button
                  onClick={() => scrollToSection("features")}
                  className="text-gray-600 hover:text-court-green transition-colors"
                >
                  Features
                </button>
                <button
                  onClick={() => scrollToSection("about")}
                  className="text-gray-600 hover:text-court-green transition-colors"
                >
                  About
                </button>
              </div>

              <button
                className="md:hidden p-2 text-gray-600 hover:text-court-green transition-colors"
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
                  className="text-gray-600 hover:text-court-green transition-colors text-left px-2 py-1"
                >
                  Features
                </button>
                <button
                  onClick={() => scrollToSection("about")}
                  className="text-gray-600 hover:text-court-green transition-colors text-left px-2 py-1"
                >
                  About
                </button>
                <Button
                  variant="outline"
                  className="border-court-green text-court-green hover:bg-court-green hover:text-white transition-colors w-full"
                  onClick={() => (window.location.href = "/login")}
                >
                  Sign In
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
                className="text-gray-600 hover:text-court-green transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms"
                className="text-gray-600 hover:text-court-green transition-colors"
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
