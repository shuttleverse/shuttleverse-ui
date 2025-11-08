import { Link, useLocation } from "react-router-dom";
import { Home, Map, Plus, User, MessageSquare } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useChats } from "@/services/chat";

const BottomNavigation = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { data: chatsData } = useChats(isAuthenticated);

  const totalUnreadCount =
    chatsData?.chats.reduce((sum, chat) => sum + (chat.unreadCount || 0), 0) ||
    0;

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
    ...(isAuthenticated
      ? [
          {
            path: "/chat",
            icon: MessageSquare,
            label: "Messages",
            badge: totalUnreadCount > 0 ? totalUnreadCount : undefined,
          },
        ]
      : []),
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
            const isActive =
              location.pathname === item.path ||
              (item.path === "/chat" && location.pathname.startsWith("/chat"));

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center py-2 px-3 flex-1 transition-colors relative ${
                  isActive
                    ? "text-primary"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <div className="relative">
                  <Icon size={20} />
                  {item.badge && item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
                      {item.badge > 99 ? "99+" : item.badge}
                    </span>
                  )}
                </div>
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
