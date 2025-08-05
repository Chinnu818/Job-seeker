import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Bars3Icon, 
  XMarkIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, loading } = useAuth();

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
    navigate('/');
  };

  const navigation = [
    { name: 'Home', href: '/', icon: '🏠' },
    { name: 'Jobs', href: '/jobs', icon: '💼' },
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
    { name: 'AI Features', href: '/ai', icon: '🤖' },
    { name: 'Connections', href: '/connections', icon: '👥' },
    { name: 'Feed', href: '/feed', icon: '📰' }
  ];

  const isActive = (path: string) => location.pathname === path;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  const mobileMenuVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: {
      opacity: 1,
      height: 'auto',
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.2,
        ease: "easeIn"
      }
    }
  };

  return (
    <nav className="bg-gradient-to-r from-gray-900 via-purple-900 to-blue-900 border-b border-purple-500/20 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <motion.div 
            className="flex items-center space-x-3"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.div
              className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center"
              variants={itemVariants}
            >
              <span className="text-white font-bold text-lg sm:text-xl">R</span>
            </motion.div>
            <motion.span 
              className="text-white font-bold text-lg sm:text-xl sm:text-2xl"
              variants={itemVariants}
            >
              Rizeos
            </motion.span>
          </motion.div>

          {/* Desktop Navigation */}
          <motion.div 
            className="hidden md:flex items-center space-x-1"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            {navigation.map((item) => (
              <motion.div
                key={item.name}
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to={item.href}
                  className={`px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-medium transition-all duration-200 ${
                    isActive(item.href)
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.name}
                </Link>
              </motion.div>
            ))}
          </motion.div>

          {/* User Menu */}
          <motion.div 
            className="flex items-center space-x-2 sm:space-x-4"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            {/* Desktop User Menu */}
            {loading ? (
              <motion.div 
                className="hidden md:block"
                variants={itemVariants}
              >
                <div className="flex items-center space-x-2 p-2 rounded-lg text-gray-300">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-600 rounded-full animate-pulse"></div>
                  <div className="w-20 h-4 bg-gray-600 rounded animate-pulse"></div>
                </div>
              </motion.div>
            ) : user ? (
              <motion.div 
                className="hidden md:block relative"
                variants={itemVariants}
              >
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700/50 transition-all duration-200"
                >
                  <UserCircleIcon className="w-6 h-6 sm:w-8 sm:h-8" />
                  <span className="text-sm sm:text-base">
                    {user.firstName} {user.lastName}
                  </span>
                </button>

              <AnimatePresence>
                {isUserMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-48 bg-gradient-to-br from-gray-800 to-purple-800 rounded-xl shadow-xl border border-purple-500/20 backdrop-blur-sm"
                  >
                    <div className="py-2">
                      <Link
                        to="/profile"
                        className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-700/50 transition-all duration-200"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <UserCircleIcon className="w-5 h-5" />
                        <span className="text-sm">Profile</span>
                      </Link>
                      <Link
                        to="/settings"
                        className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-700/50 transition-all duration-200"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Cog6ToothIcon className="w-5 h-5" />
                        <span className="text-sm">Settings</span>
                      </Link>
                      <div className="border-t border-gray-700/50 my-2"></div>
                      <button
                        className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-700/50 transition-all duration-200 w-full"
                        onClick={handleLogout}
                      >
                        <ArrowRightOnRectangleIcon className="w-5 h-5" />
                        <span className="text-sm">Logout</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
            ) : (
              <motion.div 
                className="hidden md:flex items-center space-x-2"
                variants={itemVariants}
              >
                <Link
                  to="/login"
                  className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all duration-200"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
                >
                  Sign Up
                </Link>
              </motion.div>
            )}

            {/* Mobile Menu Button */}
            <motion.button
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700/50 transition-all duration-200"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </motion.button>
          </motion.div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              variants={mobileMenuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="md:hidden border-t border-gray-700/50"
            >
              <div className="px-2 pt-2 pb-3 space-y-1">
                {navigation.map((item) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <Link
                      to={item.href}
                      className={`flex items-center space-x-3 px-3 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                        isActive(item.href)
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                          : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span>{item.name}</span>
                    </Link>
                  </motion.div>
                ))}
                
                {/* Mobile User Menu */}
                {user ? (
                  <div className="border-t border-gray-700/50 pt-2 mt-2">
                    <div className="flex items-center space-x-3 px-3 py-3">
                      <UserCircleIcon className="w-6 h-6 text-gray-300" />
                      <span className="text-gray-300 text-base">
                        {user.firstName} {user.lastName}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <Link
                        to="/profile"
                        className="flex items-center space-x-3 px-3 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700/50 transition-all duration-200"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <UserCircleIcon className="w-5 h-5" />
                        <span className="text-sm">Profile</span>
                      </Link>
                      <Link
                        to="/settings"
                        className="flex items-center space-x-3 px-3 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700/50 transition-all duration-200"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Cog6ToothIcon className="w-5 h-5" />
                        <span className="text-sm">Settings</span>
                      </Link>
                      <button
                        className="flex items-center space-x-3 px-3 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700/50 transition-all duration-200 w-full"
                        onClick={handleLogout}
                      >
                        <ArrowRightOnRectangleIcon className="w-5 h-5" />
                        <span className="text-sm">Logout</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="border-t border-gray-700/50 pt-2 mt-2">
                    <div className="space-y-1">
                      <Link
                        to="/login"
                        className="flex items-center space-x-3 px-3 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700/50 transition-all duration-200"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <UserCircleIcon className="w-5 h-5" />
                        <span className="text-sm">Login</span>
                      </Link>
                      <Link
                        to="/register"
                        className="flex items-center space-x-3 px-3 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700/50 transition-all duration-200"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Cog6ToothIcon className="w-5 h-5" />
                        <span className="text-sm">Sign Up</span>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar; 