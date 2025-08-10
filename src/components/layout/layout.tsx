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
      <main className="flex-grow pt-16 pb-20 md:pb-0 min-h-[calc(100vh-4rem)]">
        <div className="w-full mx-auto">{children}</div>
        <div className="h-64"></div>
      </main>
      <Footer />
      {isMobile && <BottomNavigation />}
    </div>
  );
};

export default Layout;
