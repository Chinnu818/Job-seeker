import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowRightIcon, 
  ChartBarIcon, 
  UserGroupIcon, 
  SparklesIcon,
  RocketLaunchIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

const Home: React.FC = () => {
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
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    },
    hover: {
      scale: 1.05,
      y: -5,
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    }
  };

  const buttonVariants = {
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.2,
        ease: "easeInOut"
      }
    },
    tap: {
      scale: 0.95
    }
  };

  const iconVariants = {
    hidden: { rotate: -180, opacity: 0 },
    visible: {
      rotate: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
      {/* Hero Section */}
      <motion.section 
        className="relative overflow-hidden py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center"
            variants={itemVariants}
          >
            <motion.div
              className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl mb-6 sm:mb-8"
              variants={iconVariants}
            >
              <RocketLaunchIcon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </motion.div>
            
            <motion.h1 
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-4 sm:mb-6"
              variants={itemVariants}
            >
              Take Control of Your{' '}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Career Journey
              </span>
            </motion.h1>
            
            <motion.p 
              className="text-base sm:text-lg md:text-xl text-gray-300 mb-6 sm:mb-8 max-w-3xl mx-auto px-4"
              variants={itemVariants}
            >
              Discover opportunities, connect with professionals, and advance your career with AI-powered insights and blockchain-secured payments.
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center px-4"
              variants={itemVariants}
            >
              <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                <Link
                  to="/jobs"
                  className="inline-flex items-center justify-center w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base"
                >
                  Explore Jobs
                  <ArrowRightIcon className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                </Link>
              </motion.div>
              
              <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base"
                >
                  Get Started
                  <SparklesIcon className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Stats Section */}
      <motion.section 
        className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
      >
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="bg-gradient-to-br from-gray-800/50 to-purple-800/50 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-purple-500/20 shadow-xl"
            variants={cardVariants}
            whileHover="hover"
          >
            <motion.h2 
              className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8 text-center"
              variants={itemVariants}
            >
              YOUR MONTHLY EXPENSES
            </motion.h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[
                { name: 'AI-FEATURES', amount: 1200, percentage: 40, color: 'from-red-500 to-pink-500' },
                { name: 'WEB3', amount: 600, percentage: 20, color: 'from-green-500 to-emerald-500' },
                { name: 'BLOACKCHAIN', amount: 300, percentage: 10, color: 'from-blue-500 to-cyan-500' }
              ].map((expense, index) => (
                <motion.div
                  key={expense.name}
                  className="bg-gradient-to-br from-gray-700/50 to-gray-800/50 rounded-xl p-4 sm:p-6 border border-gray-600/50"
                  variants={itemVariants}
                  whileHover={{ scale: 1.05, y: -2 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <h3 className="text-white font-semibold text-sm sm:text-base">{expense.name}</h3>
                    <span className="text-gray-300 text-sm sm:text-base">${expense.amount}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                    <motion.div
                      className={`h-2 bg-gradient-to-r ${expense.color} rounded-full`}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${expense.percentage}%` }}
                      transition={{ duration: 1, delay: index * 0.2 }}
                    />
                  </div>
                  <p className="text-gray-400 text-xs sm:text-sm">{expense.percentage}% of total</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section 
        className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
      >
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-12 sm:mb-16"
            variants={itemVariants}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Why Choose Rizeos?
            </h2>
            <p className="text-lg sm:text-xl text-gray-300">
              Advanced features powered by AI and blockchain technology
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                icon: SparklesIcon,
                title: 'AI-Powered Matching',
                description: 'Advanced algorithms match you with the perfect job opportunities based on your skills and preferences.'
              },
              {
                icon: ShieldCheckIcon,
                title: 'Blockchain Security',
                description: 'Secure payments and smart contracts ensure transparent and safe transactions.'
              },
              {
                icon: UserGroupIcon,
                title: 'Professional Network',
                description: 'Connect with industry professionals and expand your career network.'
              },
              {
                icon: ChartBarIcon,
                title: 'Analytics Dashboard',
                description: 'Track your application progress and career growth with detailed insights.'
              },
              {
                icon: CurrencyDollarIcon,
                title: 'Crypto Payments',
                description: 'Accept payments in cryptocurrency for freelance work and consulting.'
              },
              {
                icon: GlobeAltIcon,
                title: 'Global Opportunities',
                description: 'Access job opportunities from around the world with remote work options.'
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                className="bg-gradient-to-br from-gray-800/50 to-purple-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20 shadow-xl"
                variants={cardVariants}
                whileHover="hover"
                transition={{ delay: index * 0.1 }}
              >
                <motion.div
                  className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4"
                  variants={iconVariants}
                >
                  <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </motion.div>
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-300 text-sm sm:text-base">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section 
        className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
      >
        <div className="max-w-4xl mx-auto text-center">
          <motion.div 
            className="bg-gradient-to-br from-gray-800/50 to-purple-800/50 backdrop-blur-sm rounded-2xl p-8 sm:p-12 border border-purple-500/20 shadow-xl"
            variants={cardVariants}
            whileHover="hover"
          >
            <motion.h2 
              className="text-3xl sm:text-4xl font-bold text-white mb-4 sm:mb-6"
              variants={itemVariants}
            >
              Ready to Transform Your Career?
            </motion.h2>
            <motion.p 
              className="text-lg sm:text-xl text-gray-300 mb-6 sm:mb-8"
              variants={itemVariants}
            >
              Join thousands of professionals who have already discovered their dream opportunities.
            </motion.p>
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              variants={itemVariants}
            >
              <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base"
                >
                  Start Your Journey
                  <ArrowRightIcon className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Technology Stack */}
      <motion.section 
        className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
      >
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-8 sm:mb-12"
            variants={itemVariants}
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Powered by Modern Technology
            </h2>
            <p className="text-gray-300 text-sm sm:text-base">
              Built with cutting-edge technologies for the best user experience
            </p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6"
            variants={containerVariants}
          >
            {[
              'React', 'TypeScript', 'Node.js', 'MongoDB', 'Solana', 'AI/ML'
            ].map((tech, index) => (
              <motion.div
                key={tech}
                className="bg-gradient-to-br from-gray-700/50 to-gray-800/50 rounded-xl p-3 sm:p-4 border border-gray-600/50 text-center"
                variants={itemVariants}
                whileHover={{ scale: 1.05, y: -2 }}
                transition={{ delay: index * 0.1 }}
              >
                <span className="text-white font-medium text-xs sm:text-sm">{tech}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
};

export default Home; 