import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

function Navbar() {
  const location = useLocation();
  const [activeLink, setActiveLink] = useState(location.pathname);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setActiveLink(location.pathname);
  }, [location]);

  const navItems = [
    { path: "/calendar", label: "Calendar", icon: "📅" },
    { path: "/dashboard", label: "Dashboard", icon: "📊" },
    { 
      path: "/login", 
      label: "Login", 
      icon: "🚪",
      onClick: () => {
        localStorage.clear();
        setIsMenuOpen(false);
      }
    },
  ];

  return (
    <nav className="bg-gradient-to-r from-indigo-600 to-purple-700 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:text-gray-200 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={item.onClick}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                  activeLink === item.path
                    ? "bg-white text-indigo-700 shadow-md transform -translate-y-0.5"
                    : "text-white hover:bg-indigo-500 hover:bg-opacity-50 hover:shadow-sm"
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>

          {/* Logo/Brand can be added here */}
          <div className="text-white font-bold text-xl hidden md:block">
            Attendance Tracker
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {isMenuOpen && (
        <div className="md:hidden bg-indigo-700">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={item.onClick || (() => setIsMenuOpen(false))}
                className={`flex items-center px-3 py-2 rounded-md text-base font-medium block ${
                  activeLink === item.path
                    ? "bg-white text-indigo-700"
                    : "text-white hover:bg-indigo-500 hover:bg-opacity-50"
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
