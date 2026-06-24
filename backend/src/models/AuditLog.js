const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  userEmail: {
    type: String,
    required: [true, 'User email is required'],
    index: true
  },
  userRole: {
    type: String,
    enum: ['employee', 'hr', 'admin'],
    required: true
  },
  action: {
    type: String,
    required: [true, 'Action is required'],
    enum: [
      'LOGIN',
      'LOGOUT',
      'CLOCK_IN',
      'CLOCK_OUT',
      'CREATE_CORRECTION',
      'UPDATE_CORRECTION',
      'APPROVE_CORRECTION',
      'REJECT_CORRECTION',
      'CREATE_USER',
      'UPDATE_USER',
      'DELETE_USER',
      'UPDATE_ROLE',
      'CREATE_RULE',
      'UPDATE_RULE',
      'DELETE_RULE',
      'VIEW_AUDIT_LOGS'
    ]
  },
  resource: {
    type: String,
    enum: [
      'auth',
      'attendance',
      'correction',
      'user',
      'rule',
      'audit'
    ],
    required: true
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ip: {
    type: String,
    default: null
  },
  userAgent: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['success', 'failure'],
    default: 'success'
  },
  errorMessage: {
    type: String,
    default: null
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for user
auditLogSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

// Indexes for performance
auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ timestamp: -1 });
auditLogSchema.index({ userEmail: 1 });
auditLogSchema.index({ resource: 1 });

// TTL index to automatically delete logs older than 1 year
auditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 31536000 });

// Pre-save middleware to ensure userEmail and userRole are set
auditLogSchema.pre('save', async function(next) {
  if (this.isNew && this.userId) {
    try {
      const User = mongoose.model('User');
      const user = await User.findById(this.userId);
      if (user) {
        this.userEmail = user.email;
        this.userRole = user.role;
      }
    } catch (error) {
      console.error('Error fetching user for audit log:', error);
    }
  }
  next();
});

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = AuditLog;