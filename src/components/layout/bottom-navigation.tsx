import { Link, useLocation } from "react-router-dom";
import { Home, Map, Plus, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const BottomNavigation = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const navItems = [
    {
      path: "/",
      icon: Home,
      label: "Home",
    },
    {
      path: "/map",
      icon: Map,
      label: "Discover",
    },
    {
      path: "/add",
      icon: Plus,
      label: "Add",
    },
    {
      path: isAuthenticated ? "/profile" : "/login",
      icon: User,
      label: isAuthenticated ? "Profile" : "Login",
    },
  ];

  return (
    <div className="mt-10">
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 md:hidden">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center py-2 px-3 flex-1 transition-colors ${
                  isActive
                    ? "text-primary"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Icon size={20} />
                <span className="text-xs mt-1 font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default BottomNavigation;
