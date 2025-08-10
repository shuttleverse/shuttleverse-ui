import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, User, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLogout } from "@/services/auth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import LocationDisplay from "@/components/shared/location-display";

const Navbar = () => {
  const { isAuthenticated, user } = useAuth();
  const logout = useLogout();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout.mutate();
  };

  const navLinkStyle =
    "px-4 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-primary hover:underline decoration-primary decoration-2 underline-offset-4 transition-colors";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-primary mr-4">
              Shuttleverse
            </Link>
            <div className="hidden md:flex items-center space-x-1">
              <Link to="/courts" className={navLinkStyle}>
                Courts
              </Link>
              <Link to="/coaches" className={navLinkStyle}>
                Coaches
              </Link>
              <Link to="/stringers" className={navLinkStyle}>
                Stringers
              </Link>
            </div>
          </div>

          <div className="flex items-center">
            <div className="hidden md:flex md:items-center ml-4 space-x-4">
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="p-0">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-emerald-100 text-emerald-800">
                          {user?.username?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link
                        to="/profile"
                        className="flex items-center cursor-pointer"
                      >
                        <User size={16} className="mr-2" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="cursor-pointer"
                    >
                      <LogOut size={16} className="mr-2" />
                      {logout.isPending ? "Logging out..." : "Log out"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center space-x-4">
                  <Button variant="outline" asChild>
                    <Link to="/login">Log In</Link>
                  </Button>
                </div>
              )}
            </div>

            <button
              className="hidden md:block p-2 text-gray-600 hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="hidden md:block py-4 border-t">
            <div className="flex flex-col space-y-4">
              <div className="px-4 pb-2">
                <LocationDisplay variant="full" />
              </div>

              <div className="space-y-2 pt-2">
                <Link
                  to="/courts"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary rounded-md transition-colors hover:underline decoration-primary decoration-2 underline-offset-4"
                >
                  Courts
                </Link>
                <Link
                  to="/coaches"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary rounded-md transition-colors hover:underline decoration-primary decoration-2 underline-offset-4"
                >
                  Coaches
                </Link>
                <Link
                  to="/stringers"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary rounded-md transition-colors hover:underline decoration-primary decoration-2 underline-offset-4"
                >
                  Stringers
                </Link>
              </div>

              {isAuthenticated ? (
                <div className="space-y-2 pt-2 border-t">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary rounded-md transition-colors flex items-center"
                  >
                    <Avatar className="h-6 w-6 mr-2">
                      <AvatarFallback className="bg-emerald-100 text-emerald-800">
                        {user?.username?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span>Profile</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary rounded-md transition-colors flex items-center"
                    disabled={logout.isPending}
                  >
                    <LogOut size={16} className="mr-2" />
                    {logout.isPending ? "Logging out..." : "Log out"}
                  </button>
                </div>
              ) : (
                <div className="space-y-2 pt-2 border-t">
                  <Button
                    variant="outline"
                    className="border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors w-full"
                    asChild
                  >
                    <Link to="/login">Log In</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
