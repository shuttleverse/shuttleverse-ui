import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-white/30 backdrop-blur-lg border-t border-gray-300/80 shadow-lg">
      <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
        <nav className="flex flex-wrap justify-center -mx-5 -my-2">
          <div className="px-5 py-2">
            <Link
              to="/about"
              className="text-base text-gray-500 hover:text-gray-900"
            >
              About
            </Link>
          </div>
          <div className="px-5 py-2">
            <Link
              to="/contact"
              className="text-base text-gray-500 hover:text-gray-900"
            >
              Contact
            </Link>
          </div>
          <div className="px-5 py-2">
            <Link
              to="/privacy-policy"
              className="text-base text-gray-500 hover:text-gray-900"
            >
              Privacy Policy
            </Link>
          </div>
          <div className="px-5 py-2">
            <Link
              to="/terms-of-service"
              className="text-base text-gray-500 hover:text-gray-900"
            >
              Terms of Service
            </Link>
          </div>
        </nav>

        <p className="mt-8 text-center text-base text-gray-400">
          &copy; {new Date().getFullYear()} Shuttleverse. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
