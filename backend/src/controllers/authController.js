const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Login attempt for:', email);
    console.log('Password provided:', password);

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user with password
    const user = await User.findOne({ email }).select('+passwordHash');

    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    console.log('User found:', user.email);
    console.log('Stored password:', user.passwordHash);
    console.log('Provided password:', password);

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact HR.'
      });
    }

    // Simple password comparison (temporary)
    const isPasswordValid = user.passwordHash === password;
    console.log('Password valid:', isPasswordValid);

    if (!isPasswordValid) {
      console.log('Invalid password for:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Log successful login
    try {
      await AuditLog.create({
        userId: user._id,
        userEmail: user.email,
        userRole: user.role,
        action: 'LOGIN',
        resource: 'auth',
        status: 'success',
        ip: req.ip || req.headers['x-forwarded-for'] || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown'
      });
    } catch (logError) {
      console.error('Failed to log audit:', logError);
    }

    // Return user data without password
    const userData = user.toObject();
    delete userData.passwordHash;

    console.log('Login successful for:', email);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: userData,
        token,
        permissions: getPermissions(user.role)
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash');
    
    res.status(200).json({
      success: true,
      data: {
        user,
        permissions: getPermissions(user.role)
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  try {
    // Log logout
    await AuditLog.create({
      userId: req.user._id,
      userEmail: req.user.email,
      userRole: req.user.role,
      action: 'LOGOUT',
      resource: 'auth',
      status: 'success',
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Helper function to get permissions based on role
const getPermissions = (role) => {
  const permissions = {
    employee: [
      'view_own_attendance',
      'clock_in',
      'clock_out',
      'request_correction',
      'view_own_corrections'
    ],
    hr: [
      'view_all_attendance',
      'view_team_attendance',
      'review_corrections',
      'view_users',
      'view_reports'
    ],
    admin: [
      'manage_users',
      'manage_roles',
      'manage_rules',
      'view_audit_logs',
      'all_hr_permissions',
      'view_all_attendance',
      'view_team_attendance',
      'review_corrections',
      'view_users',
      'view_reports'
    ]
  };

  return permissions[role] || [];
};

module.exports = {
  login,
  getCurrentUser,
  logout
};