import Navbar from "./navbar";
import Footer from "./footer";
import BottomNavigation from "./bottom-navigation";
import { useIsMobile } from "@/hooks/use-mobile";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const isMobile = useIsMobile();
  return (
    <div className="flex flex-col min-h-screen bg-neutral-light">
      <Navbar />
      <main className="flex-grow pt-20 md:pb-0 pb-4 min-h-[calc(100vh-5rem)] flex flex-col overflow-hidden">
        <div className="w-full mx-auto flex-1 flex flex-col min-h-0 overflow-hidden">
          {children}
        </div>
        {!isMobile && <div className="h-64 flex-shrink-0"></div>}
      </main>
      {!isMobile && <Footer />}
      {isMobile && <BottomNavigation />}
    </div>
  );
};

export default Layout;
