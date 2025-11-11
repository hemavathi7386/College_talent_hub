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
  BarChart3,
  ChevronDown,
  MoreHorizontal,
  Shield
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
      { name: 'Recommendations', href: '/recommendations', icon: Star }
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
    <nav className="bg-white shadow-sm border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <div className="bg-primary p-2 rounded-lg">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-base sm:text-lg font-semibold text-text">
                  College Talent Hub
                </h1>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {mainNavigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-primary text-white'
                      : 'text-gray-600 hover:text-primary hover:bg-cyan-50'
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
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    panelNavigation.some(item => isActive(item.href))
                      ? 'bg-primary text-white'
                      : 'text-gray-600 hover:text-primary hover:bg-cyan-50'
                  }`}
                >
                  <MoreHorizontal className="h-5 w-5" />
                  <span>More</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${
                    isDropdownOpen ? 'rotate-180' : ''
                  }`} />
                </button>
                
                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <div className="p-2">
                      {panelNavigation.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.name}
                            to={item.href}
                            onClick={() => setIsDropdownOpen(false)}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm transition-colors ${
                              isActive(item.href)
                                ? 'bg-primary text-white'
                                : 'text-gray-600 hover:text-primary hover:bg-cyan-50'
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
          <div className="flex items-center space-x-3">
            {/* Notification Bell */}
            <div className="text-gray-600 hover:text-primary transition-colors">
              <NotificationBell />
            </div>
            
            <div className="hidden md:block bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
              <p className="text-sm font-semibold text-gray-900">
                {user?.name}
              </p>
              <p className="text-xs text-gray-600 capitalize">{user?.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 bg-red-50 text-red-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:block">Logout</span>
            </button>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-4 pt-4 pb-6 space-y-2 bg-gray-50 border-t border-gray-200">
            <div className="bg-white px-4 py-3 rounded-lg border border-gray-200 mb-4">
              <p className="text-base font-semibold text-gray-900">
                {user?.name}
              </p>
              <p className="text-sm text-gray-600 capitalize">{user?.role}</p>
            </div>
            {allNavigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center space-x-3 text-gray-600 hover:text-primary hover:bg-cyan-50 transition-colors px-3 py-2 rounded-lg text-base font-medium"
                >
                  <Icon className="h-5 w-5" />
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
