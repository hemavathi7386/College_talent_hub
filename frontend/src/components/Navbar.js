import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import NotificationBell from './NotificationBell';
import { 
  Home, 
  User, 
  Briefcase, 
  Trophy, 
  Users, 
  LogOut, 
  Menu, 
  X,
  GraduationCap,
  MessageCircle,
  Star,
  Award,
  BarChart3,
  Sparkles,
  Zap,
  ChevronDown,
  Grid3X3,
  Shield,
  Bell
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const mainNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Jobs', href: '/jobs', icon: Briefcase },
    { name: 'Competitions', href: '/competitions', icon: Trophy },
    ...(user?.role === 'student' ? [
      { name: 'Recommendations', href: '/recommendations', icon: Star },
      { name: 'Leaderboard', href: '/leaderboard', icon: Award }
    ] : []),
    { name: 'Profile', href: '/profile', icon: User },
  ];

  const panelNavigation = [
    ...(user?.role !== 'student' ? [{ name: 'Students', href: '/students', icon: Users }] : []),
    { name: 'Chat', href: '/chat', icon: MessageCircle },
    ...(user?.role !== 'student' ? [{ name: 'Analytics', href: '/analytics', icon: BarChart3 }] : []),
    ...(user?.role === 'admin' ? [{ name: 'Admin Panel', href: '/admin', icon: Shield }] : []),
  ];

  const allNavigation = [...mainNavigation, ...panelNavigation];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-background/95 backdrop-blur-md shadow-2xl border-b border-background-light sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex justify-between h-18">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-2 group">
              <div className="bg-primary p-2 rounded-xl shadow-lg">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-base sm:text-lg font-semibold text-primary whitespace-nowrap leading-none">
                  College Talent Hub
                </h1>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {mainNavigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`relative flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-primary text-text-light'
                      : 'text-text-body hover:text-primary hover:bg-primary-light'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
            
            {/* Dropdown Panel */}
            {panelNavigation.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`relative flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    panelNavigation.some(item => isActive(item.href))
                      ? 'bg-primary text-text-light'
                      : 'text-text-body hover:text-primary hover:bg-primary-light'
                  }`}
                >
                  <Grid3X3 className="h-5 w-5" />
                  <span>More</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${
                    isDropdownOpen ? 'rotate-180' : ''
                  }`} />
                </button>
                
                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-background rounded-lg shadow-2xl border border-background-light py-1 z-50">
                    <div className="p-2">
                      {panelNavigation.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.name}
                            to={item.href}
                            onClick={() => setIsDropdownOpen(false)}
                            className={`flex items-center px-4 py-2 text-sm transition-colors duration-200 ${
                              isActive(item.href)
                                ? 'bg-primary text-text-light'
                                : 'text-text-body hover:text-primary hover:bg-primary-light'
                            }`}
                          >
                            <Icon className="h-5 w-5" />
                            <span>{item.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {/* Notification Bell for Students */}
            <div className="transform hover:scale-110 transition-transform duration-300 text-text-body hover:text-primary transition-colors duration-200">
              <NotificationBell />
            </div>
            
            <div className="hidden md:block text-right bg-background-light px-4 py-2 rounded-lg border border-background-light">
              <p className="text-sm font-bold text-text">
                <span>{user?.name}</span>
              </p>
              <p className="text-xs font-medium text-text-body capitalize">{user?.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-primary bg-primary-light px-3 py-2 rounded-md text-sm font-medium"
            >
              <LogOut className="mr-3 h-4 w-4 text-secondary" />
              <span className="hidden sm:block">Logout</span>
            </button>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-3 rounded-lg bg-primary text-text-light hover:bg-primary-dark transition-colors"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Bell className="mr-3 h-4 w-4 text-primary" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-4 pt-4 pb-6 space-y-3 bg-background-light border-t border-background-light">
            <div className="bg-background px-4 py-3 rounded-lg border border-background-light mb-4">
              <p className="text-lg font-bold text-text">
                <span>{user?.name}</span>
              </p>
              <p className="text-sm font-medium text-text-body capitalize">{user?.role}</p>
            </div>
            {allNavigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-text-body hover:text-primary transition-colors duration-200 block px-3 py-2 rounded-md text-base font-medium"
                >
                  <Icon className="h-6 w-6" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
