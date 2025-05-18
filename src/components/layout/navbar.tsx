import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, User, LogOut, Bell } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-court-green font-bold text-xl">
                Shuttleverse
              </span>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/courts"
                className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Courts
              </Link>
              <Link
                to="/coaches"
                className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Coaches
              </Link>
              <Link
                to="/stringers"
                className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Stringers
              </Link>
              <Link
                to="/clubs"
                className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Clubs
              </Link>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-court-green focus:border-court-green sm:text-sm"
              />
            </div>

            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <div className="relative group">
                  <button className="flex items-center text-gray-500 hover:text-gray-700">
                    <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 font-medium">
                      {user?.username?.charAt(0) || "U"}
                    </div>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <User size={16} className="inline mr-2" />
                      Profile
                    </Link>
                    <Link
                      to="/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Settings
                    </Link>
                    <Link
                      to="/logout"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut size={16} className="inline mr-2" />
                      Log out
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Button variant="outline">Log In</Button>
                <Button>Sign Up</Button>
              </div>
            )}
          </div>
          <div className="sm:hidden flex items-center">
            <button
              type="button"
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              to="/clubs"
              className="text-gray-500 hover:text-gray-700 hover:bg-gray-50 block px-3 py-2 text-base font-medium"
            >
              Clubs
            </Link>
            <Link
              to="/courts"
              className="text-gray-500 hover:text-gray-700 hover:bg-gray-50 block px-3 py-2 text-base font-medium"
            >
              Courts
            </Link>
            <Link
              to="/coaches"
              className="text-gray-500 hover:text-gray-700 hover:bg-gray-50 block px-3 py-2 text-base font-medium"
            >
              Coaches
            </Link>
            <Link
              to="/stringers"
              className="text-gray-500 hover:text-gray-700 hover:bg-gray-50 block px-3 py-2 text-base font-medium"
            >
              Stringers
            </Link>
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200 flex flex-col space-y-2 px-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-court-green focus:border-court-green text-sm"
              />
            </div>

            {isAuthenticated ? (
              <div className="space-y-2">
                <Link
                  to="/contribute"
                  className="text-emerald-600 hover:text-emerald-800 font-medium text-sm block w-full text-center py-2"
                >
                  Contribute
                </Link>
                <Link
                  to="/profile"
                  className="flex items-center w-full px-3 py-2 text-base font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                >
                  <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 font-medium mr-3">
                    {user?.username?.charAt(0) || "U"}
                  </div>
                  Profile
                </Link>
                <Link
                  to="/settings"
                  className="block w-full px-3 py-2 text-base font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                >
                  Settings
                </Link>
                <Link
                  to="/logout"
                  className="block w-full px-3 py-2 text-base font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                >
                  Log out
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                <Button variant="outline" className="w-full">
                  Log In
                </Button>
                <Button className="w-full">Sign Up</Button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
