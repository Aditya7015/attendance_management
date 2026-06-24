import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  FaUser, 
  FaLock, 
  FaClock, 
  FaArrowRight, 
  FaBuilding,
  FaUserTie,
  FaUsers,
  FaEye,
  FaEyeSlash
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { login } = useAuth();
  const navigate = useNavigate();

  // Particle animation effect
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const generateParticles = () => {
      const newParticles = [];
      for (let i = 0; i < 50; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 4 + 2,
          speed: Math.random() * 2 + 1,
          opacity: Math.random() * 0.5 + 0.1,
          delay: Math.random() * 5,
        });
      }
      setParticles(newParticles);
    };
    generateParticles();
  }, []);

  // Mouse move effect for 3D tilt
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePosition({ x, y });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        toast.success('Welcome back! 🎉', {
          style: {
            background: '#10B981',
            color: '#fff',
          },
          icon: '👋',
        });
        navigate('/dashboard');
      } else {
        toast.error(result.message || 'Login failed', {
          style: {
            background: '#EF4444',
            color: '#fff',
          },
        });
      }
    } catch (error) {
      toast.error('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  // Quick login handlers
  const quickLogin = (role) => {
    const credentials = {
      admin: { email: 'admin@company.com', password: 'Admin@123' },
      hr: { email: 'hr@company.com', password: 'Hr@123' },
      employee: { email: 'employee1@company.com', password: 'Emp@123' },
    };
    setEmail(credentials[role].email);
    setPassword(credentials[role].password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      {/* Animated Background Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full bg-white"
            style={{
              width: particle.size,
              height: particle.size,
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              opacity: particle.opacity,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, 20, 0],
            }}
            transition={{
              duration: particle.speed,
              delay: particle.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Animated Gradient Orbs */}
      <motion.div
        className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
        animate={{
          x: [0, 100, 0],
          y: [0, -50, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-20 right-20 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
        animate={{
          x: [0, -100, 0],
          y: [0, 50, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
        animate={{
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        onMouseMove={handleMouseMove}
        style={{
          transform: `perspective(1000px) rotateX(${mousePosition.y * -10}deg) rotateY(${mousePosition.x * 10}deg)`,
          transition: 'transform 0.1s ease-out',
        }}
        className="relative z-10 w-full max-w-md px-4"
      >
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20">
          {/* Logo and Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg mb-4 relative"
            >
              <FaClock className="text-white text-4xl" />
              <motion.div
                className="absolute -inset-1 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl opacity-50 blur-xl"
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </motion.div>
            
            <motion.h1 
              className="text-4xl font-bold text-white mb-2"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Welcome Back
            </motion.h1>
            <motion.p 
              className="text-white/70 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Sign in to manage your attendance
            </motion.p>
          </div>

          {/* Quick Login Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-3 gap-2 mb-6"
          >
            <button
              onClick={() => quickLogin('admin')}
              className="flex flex-col items-center justify-center p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all duration-300 border border-white/10 hover:border-white/20 group"
            >
              <FaUserTie className="text-blue-400 text-lg group-hover:scale-110 transition-transform" />
              <span className="text-white/70 text-xs mt-1">Admin</span>
            </button>
            <button
              onClick={() => quickLogin('hr')}
              className="flex flex-col items-center justify-center p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all duration-300 border border-white/10 hover:border-white/20 group"
            >
              <FaUsers className="text-purple-400 text-lg group-hover:scale-110 transition-transform" />
              <span className="text-white/70 text-xs mt-1">HR</span>
            </button>
            <button
              onClick={() => quickLogin('employee')}
              className="flex flex-col items-center justify-center p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all duration-300 border border-white/10 hover:border-white/20 group"
            >
              <FaUser className="text-green-400 text-lg group-hover:scale-110 transition-transform" />
              <span className="text-white/70 text-xs mt-1">Employee</span>
            </button>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <label className="block text-white/80 text-sm font-medium mb-2">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaUser className="text-white/40 group-focus-within:text-blue-400 transition-colors" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-300"
                  placeholder="Enter your email"
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 via-blue-500/0 to-purple-500/0 group-focus-within:from-blue-500/10 group-focus-within:via-blue-500/5 group-focus-within:to-purple-500/10 transition-all duration-500 pointer-events-none" />
              </div>
            </motion.div>

            {/* Password Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
            >
              <label className="block text-white/80 text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaLock className="text-white/40 group-focus-within:text-purple-400 transition-colors" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-300"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/40 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/0 via-purple-500/0 to-pink-500/0 group-focus-within:from-purple-500/10 group-focus-within:via-purple-500/5 group-focus-within:to-pink-500/10 transition-all duration-500 pointer-events-none" />
              </div>
            </motion.div>

            {/* Demo Credentials Hint */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="bg-white/5 rounded-xl p-3 border border-white/10"
            >
              <p className="text-white/50 text-xs text-center">
                💡 Click on role buttons above to auto-fill credentials
              </p>
            </motion.div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="relative w-full group overflow-hidden rounded-xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-[1px] transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <div className="relative flex items-center justify-center gap-3 px-6 py-3.5 bg-gray-900/90 group-hover:bg-gray-900/70 rounded-xl transition-all duration-300">
                <span className="text-white font-semibold text-base">
                  {loading ? (
                    <div className="flex items-center gap-3">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Signing in...
                    </div>
                  ) : (
                    <>
                      Sign In
                      <motion.div
                        animate={{ x: isHovered ? 5 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <FaArrowRight />
                      </motion.div>
                    </>
                  )}
                </span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20"
                  initial={{ x: '-100%' }}
                  animate={{ x: isHovered ? '100%' : '-100%' }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </motion.button>
          </form>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-6 text-center"
          >
            <p className="text-white/40 text-xs">
              <FaBuilding className="inline mr-1" />
              Attendance Management System v2.0
            </p>
            <div className="flex items-center justify-center gap-4 mt-3 text-white/30 text-xs">
              <span>Secure Login</span>
              <span className="w-px h-3 bg-white/20" />
              <span>SSL Encrypted</span>
              <span className="w-px h-3 bg-white/20" />
              <span>🔒 Protected</span>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;