import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";

interface NavigationProps {
  variant?: 'default' | 'gradient';
  currentPage?: 'home' | 'training' | 'contact' | 'get-the-goods' | 'vidpod' | 'tubelab' | 'helpers';
}

export function Navigation({ variant = 'default', currentPage }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const location = useLocation();
  
  // Check dark mode from localStorage when on TubeLab page
  useEffect(() => {
    const checkDarkMode = () => {
      const saved = localStorage.getItem('tubelab-dark-mode');
      setIsDarkMode(saved ? JSON.parse(saved) : false);
    };
    
    checkDarkMode();
    
    // Listen for storage changes (for when dark mode is toggled)
    window.addEventListener('storage', checkDarkMode);
    
    // Also listen for custom event from VideoDatabase
    const handleDarkModeChange = () => checkDarkMode();
    window.addEventListener('darkModeChange', handleDarkModeChange);
    
    return () => {
      window.removeEventListener('storage', checkDarkMode);
      window.removeEventListener('darkModeChange', handleDarkModeChange);
    };
  }, [location.pathname]);
  
  // Determine current page from URL if not explicitly provided
  const getCurrentPage = () => {
    if (currentPage) return currentPage;
    const path = location.pathname.slice(1); // Remove leading slash
    if (path === '') return 'home';
    if (path === 'tubelab' || path === 'video-database') return 'tubelab';
    return path as any;
  };
  
  const activePage = getCurrentPage();
  const isGradient = variant === 'gradient';
  const navClasses = isGradient 
    ? "w-full py-12" 
    : "w-full py-6 border-b border-border";
  
  const getLinkClasses = (pageKey: string) => {
    const isActive = activePage === pageKey;
    
    if (isGradient) {
      return isActive 
        ? "text-white font-bold" 
        : "text-white/80 hover:text-white transition-colors duration-200 font-bold";
    } else {
      return isActive 
        ? "text-[#5928CB] hover:text-[#5928CB]/80 transition-colors duration-200 font-bold" 
        : "text-gray-600 hover:text-[#5928CB] transition-colors duration-200 font-bold";
    }
  };
    
  const mobileButtonClasses = isGradient
    ? "text-white hover:text-white/80 transition-colors duration-200 p-2 font-bold"
    : "text-gray-600 hover:text-[#5928CB] transition-colors duration-200 p-2 font-bold";

  return (
    <nav className={navClasses}>
      <div className="max-w-7xl mx-auto px-6 lg:mx-[75px] lg:max-w-none relative">
        {/* Desktop Navigation */}
        <ul className="hidden md:flex justify-center items-center gap-8">
          <li>
            <Link
              to="/"
              className={getLinkClasses('home')}
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              to="/training"
              className={getLinkClasses('training')}
            >
              1-1 Personal Training
            </Link>
          </li>
          <li>
            <a
              href="https://michellebuggy.com"
              target="_blank"
              rel="noopener noreferrer"
              className={getLinkClasses('')}
            >
              Portfolio
            </a>
          </li>
          <li>
            <Link
              to="/contact"
              className={getLinkClasses('contact')}
            >
              Contact
            </Link>
          </li>
          <li>
            <Link
              to="/get-the-goods"
              className={getLinkClasses('get-the-goods')}
            >
              Get the Goods
            </Link>
          </li>
          <li>
            <Link
              to="/vidpod"
              className={getLinkClasses('vidpod')}
            >
              VidPod
            </Link>
          </li>
          <li>
            <Link
              to="/helpers"
              className={getLinkClasses('helpers')}
            >
              Helpers
            </Link>
          </li>
        </ul>

        {/* Mobile Hamburger Button */}
        <div className="md:hidden flex justify-end">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={mobileButtonClasses}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        
        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
          <div className={`md:hidden absolute top-full right-6 bg-white rounded-lg shadow-2xl py-4 px-6 z-50 min-w-[200px] ${!isGradient ? 'border border-border' : ''}`}>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/"
                  onClick={() => setIsMenuOpen(false)}
                  className={`w-full text-left transition-colors duration-200 font-bold block ${
                    activePage === 'home' 
                      ? 'text-[#5928CB]' 
                      : 'text-gray-700 hover:text-[#5928CB]'
                  }`}
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/training"
                  onClick={() => setIsMenuOpen(false)}
                  className={`w-full text-left transition-colors duration-200 font-bold block ${
                    activePage === 'training' 
                      ? 'text-[#5928CB]' 
                      : 'text-gray-700 hover:text-[#5928CB]'
                  }`}
                >
                  1-1 Personal Training
                </Link>
              </li>
              <li>
                <a
                  href="https://michellebuggy.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-700 hover:text-[#5928CB] transition-colors duration-200 block font-bold"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Portfolio
                </a>
              </li>
              <li>
                <Link
                  to="/contact"
                  onClick={() => setIsMenuOpen(false)}
                  className={`w-full text-left transition-colors duration-200 font-bold block ${
                    activePage === 'contact' 
                      ? 'text-[#5928CB]' 
                      : 'text-gray-700 hover:text-[#5928CB]'
                  }`}
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  to="/get-the-goods"
                  onClick={() => setIsMenuOpen(false)}
                  className={`w-full text-left transition-colors duration-200 font-bold block ${
                    activePage === 'get-the-goods' 
                      ? 'text-[#5928CB]' 
                      : 'text-gray-700 hover:text-[#5928CB]'
                  }`}
                >
                  Get the Goods
                </Link>
              </li>
              <li>
                <Link
                  to="/vidpod"
                  onClick={() => setIsMenuOpen(false)}
                  className={`w-full text-left transition-colors duration-200 font-bold block ${
                    activePage === 'vidpod' 
                      ? 'text-[#5928CB]' 
                      : 'text-gray-700 hover:text-[#5928CB]'
                  }`}
                >
                  VidPod
                </Link>
              </li>
              <li>
                <Link
                  to="/app"
                  onClick={() => setIsMenuOpen(false)}
                  className={`w-full text-left transition-colors duration-200 font-bold block ${
                    activePage === 'tubelab' 
                      ? 'text-[#5928CB]' 
                      : 'text-gray-700 hover:text-[#5928CB]'
                  }`}
                >
                  TubeLab
                </Link>
              </li>
              <li>
                <Link
                  to="/helpers"
                  onClick={() => setIsMenuOpen(false)}
                  className={`w-full text-left transition-colors duration-200 font-bold block ${
                    activePage === 'helpers' 
                      ? 'text-[#5928CB]' 
                      : 'text-gray-700 hover:text-[#5928CB]'
                  }`}
                >
                  Helpers
                </Link>
              </li>
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
}