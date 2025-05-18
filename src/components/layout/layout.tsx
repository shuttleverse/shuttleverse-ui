
import React from "react";
import Navbar from "./navbar";
import Footer from "./footer";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-neutral-light">
      <Navbar />
      <main className="flex-grow pt-16">
        <div className="w-full mx-auto">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
