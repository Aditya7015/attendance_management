const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const bcrypt = require('bcryptjs');

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin/HR)
const getUsers = async (req, res) => {
  try {
    const { role, isActive, search, page = 1, limit = 20 } = req.query;

    // Build query
    const query = {};

    if (role) {
      query.role = role;
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-passwordHash')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private (Admin/HR)
const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-passwordHash');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check permissions
    if (req.user.role !== 'admin' && 
        req.user.role !== 'hr' && 
        req.user._id.toString() !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this user'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Create user
// @route   POST /api/users
// @access  Private (Admin only)
// const createUser = async (req, res) => {
//   try {
//     const { email, password, fullName, role, department, designation, phoneNumber } = req.body;

//     // Check if user exists
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({
//         success: false,
//         message: 'User already exists with this email'
//       });
//     }

//     // Hash password
//     const salt = await bcrypt.genSalt(10);
//     const passwordHash = await bcrypt.hash(password, salt);

//     // Create user
//     const user = await User.create({
//       email,
//       passwordHash,
//       fullName,
//       role: role || 'employee',
//       department,
//       designation,
//       phoneNumber
//     });

//     // Log user creation
//     await AuditLog.create({
//       userId: req.user._id,
//       userEmail: req.user.email,
//       userRole: req.user.role,
//       action: 'CREATE_USER',
//       resource: 'user',
//       resourceId: user._id,
//       details: {
//         email: user.email,
//         fullName: user.fullName,
//         role: user.role
//       },
//       ip: req.ip,
//       userAgent: req.headers['user-agent']
//     });

//     const userData = user.toObject();
//     delete userData.passwordHash;

//     res.status(201).json({
//       success: true,
//       message: 'User created successfully',
//       data: userData
//     });
//   } catch (error) {
//     console.error('Create user error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error'
//     });
//   }
// };

// @desc    Create user
// @route   POST /api/users
// @access  Private (Admin only)
// @desc    Create user
// @route   POST /api/users
// @access  Private (Admin only)
const createUser = async (req, res) => {
  try {
    const { email, password, fullName, role, department, designation, phoneNumber } = req.body;

    console.log('📝 Create user request received:', { 
      email, 
      fullName, 
      role, 
      department,
      hasPassword: !!password 
    });

    // Validate required fields
    const errors = [];
    if (!email) errors.push('Email is required');
    if (!password) errors.push('Password is required');
    if (!fullName) errors.push('Full name is required');
    
    // Validate email format
    if (email && !email.includes('@')) {
      errors.push('Please provide a valid email address');
    }
    
    // Validate password length
    if (password && password.length < 8) {
      errors.push('Password must be at least 8 characters');
    }
    
    if (errors.length > 0) {
      console.log('❌ Validation errors:', errors);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('❌ User already exists:', email);
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // For now, store password as plain text (temporary)
    const passwordHash = password;

    // Create user
    const userData = {
      email,
      passwordHash,
      fullName,
      role: role || 'employee',
      department: department || '',
      designation: designation || '',
      phoneNumber: phoneNumber || ''
    };

    console.log('📝 Creating user with data:', { ...userData, password: '***' });

    let user;
    try {
      user = await User.create(userData);
      console.log('✅ User created successfully:', user._id);
    } catch (dbError) {
      console.error('❌ Database error:', dbError);
      if (dbError.code === 11000) {
        const field = Object.keys(dbError.keyPattern)[0];
        return res.status(400).json({
          success: false,
          message: `Duplicate value for ${field}. Please use a different value.`
        });
      }
      throw dbError;
    }

    // Log user creation
    try {
      await AuditLog.create({
        userId: req.user._id,
        userEmail: req.user.email,
        userRole: req.user.role,
        action: 'CREATE_USER',
        resource: 'user',
        resourceId: user._id,
        details: {
          email: user.email,
          fullName: user.fullName,
          role: user.role
        },
        ip: req.ip || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown'
      });
    } catch (logError) {
      console.error('Failed to create audit log:', logError);
    }

    const userDataResponse = user.toObject();
    delete userDataResponse.passwordHash;

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: userDataResponse
    });
  } catch (error) {
    console.error('❌ Create user error:', error);
    
    // Handle validation errors from mongoose
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors
      });
    }

    // Handle duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `Duplicate value for ${field}. Please use a different value.`
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private (Admin only)
const updateUser = async (req, res) => {
  try {
    const { fullName, department, designation, phoneNumber, isActive } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update fields
    if (fullName) user.fullName = fullName;
    if (department) user.department = department;
    if (designation) user.designation = designation;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();

    // Log user update
    await AuditLog.create({
      userId: req.user._id,
      userEmail: req.user.email,
      userRole: req.user.role,
      action: 'UPDATE_USER',
      resource: 'user',
      resourceId: user._id,
      details: req.body,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });

    const userData = user.toObject();
    delete userData.passwordHash;

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: userData
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Update user role
// @route   PUT /api/users/:id/role
// @access  Private (Admin only)
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent removing last admin
    if (user.role === 'admin' && role !== 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Cannot remove the last admin user'
        });
      }
    }

    const oldRole = user.role;
    user.role = role;
    await user.save();

    // Log role update
    await AuditLog.create({
      userId: req.user._id,
      userEmail: req.user.email,
      userRole: req.user.role,
      action: 'UPDATE_ROLE',
      resource: 'user',
      resourceId: user._id,
      details: {
        oldRole,
        newRole: role
      },
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.status(200).json({
      success: true,
      message: 'User role updated successfully',
      data: {
        userId: user._id,
        email: user.email,
        fullName: user.fullName,
        oldRole,
        newRole: role
      }
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Admin only)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent deleting last admin
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete the last admin user'
        });
      }
    }

    // Soft delete (deactivate)
    user.isActive = false;
    await user.save();

    // Log deletion
    await AuditLog.create({
      userId: req.user._id,
      userEmail: req.user.email,
      userRole: req.user.role,
      action: 'DELETE_USER',
      resource: 'user',
      resourceId: user._id,
      details: {
        email: user.email,
        fullName: user.fullName,
        role: user.role
      },
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.status(200).json({
      success: true,
      message: 'User deactivated successfully',
      data: {
        userId: user._id,
        email: user.email,
        fullName: user.fullName
      }
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  updateUserRole,
  deleteUser
};