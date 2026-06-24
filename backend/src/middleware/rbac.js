const roleAccess = (allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized'
        });
      }

      const userRole = req.user.role;
      
      // Admin has access to everything
      if (userRole === 'admin') {
        return next();
      }

      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to access this resource',
          requiredRoles: allowedRoles,
          userRole: userRole
        });
      }

      next();
    } catch (error) {
      console.error('RBAC middleware error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };
};

// Specific permission checks
const canViewUsers = (req, res, next) => {
  const { user } = req;

  // Admin can view all users
  if (user.role === 'admin') {
    return next();
  }

  // HR can view all users
  if (user.role === 'hr') {
    return next();
  }

  // Employee can only view their own data
  if (user.role === 'employee') {
    const userId = req.params.id || req.query.userId;
    if (!userId || userId === user._id.toString()) {
      return next();
    }
  }

  return res.status(403).json({
    success: false,
    message: 'You do not have permission to view users'
  });
};

const canViewUser = (req, res, next) => {
  const { user } = req;
  const userId = req.params.id || req.body.userId;

  // Admin can view all users
  if (user.role === 'admin') {
    return next();
  }

  // HR can view all users
  if (user.role === 'hr') {
    return next();
  }

  // Employee can only view their own data
  if (user.role === 'employee' && userId === user._id.toString()) {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'You can only access your own data'
  });
};

const canManageUser = (req, res, next) => {
  const { user } = req;

  // Only admin can manage users
  if (user.role === 'admin') {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Only admins can manage users'
  });
};

const canReviewCorrection = (req, res, next) => {
  const { user } = req;

  // Admin and HR can review corrections
  if (user.role === 'admin' || user.role === 'hr') {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Only HR and Admins can review corrections'
  });
};

module.exports = {
  roleAccess,
  canViewUsers,
  canViewUser,
  canManageUser,
  canReviewCorrection
};