// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');

// const userSchema = new mongoose.Schema({
//   email: {
//     type: String,
//     required: [true, 'Email is required'],
//     unique: true,
//     lowercase: true,
//     trim: true,
//     match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
//   },
//   passwordHash: {
//     type: String,
//     required: [true, 'Password is required'],
//     select: false
//   },
//   fullName: {
//     type: String,
//     required: [true, 'Full name is required'],
//     trim: true,
//     minlength: [2, 'Name must be at least 2 characters'],
//     maxlength: [50, 'Name cannot exceed 50 characters']
//   },
//   role: {
//     type: String,
//     enum: ['employee', 'hr', 'admin'],
//     default: 'employee',
//     required: true
//   },
//   employeeId: {
//     type: String,
//     unique: true,
//     sparse: true,
//     trim: true
//   },
//   department: {
//     type: String,
//     trim: true,
//     default: 'General'
//   },
//   designation: {
//     type: String,
//     trim: true,
//     default: 'Staff'
//   },
//   phoneNumber: {
//     type: String,
//     trim: true,
//     match: [/^[0-9+\-\s()]{10,15}$/, 'Please provide a valid phone number']
//   },
//   profilePicture: {
//     type: String,
//     default: null
//   },
//   isActive: {
//     type: Boolean,
//     default: true
//   },
//   lastLogin: {
//     type: Date,
//     default: null
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now
//   },
//   updatedAt: {
//     type: Date,
//     default: Date.now
//   }
// }, {
//   timestamps: true,
//   toJSON: { virtuals: true },
//   toObject: { virtuals: true }
// });

// // Virtual for attendance records
// userSchema.virtual('attendanceRecords', {
//   ref: 'Attendance',
//   localField: '_id',
//   foreignField: 'userId'
// });

// // Virtual for correction requests
// userSchema.virtual('correctionRequests', {
//   ref: 'CorrectionRequest',
//   localField: '_id',
//   foreignField: 'userId'
// });

// // Pre-save middleware to hash password
// userSchema.pre('save', async function(next) {
//   if (!this.isModified('passwordHash')) return next();
  
//   try {
//     const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 10);
//     this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
//     next();
//   } catch (error) {
//     next(error);
//   }
// });

// // Pre-save middleware to generate employee ID
// userSchema.pre('save', async function(next) {
//   if (!this.employeeId && this.role === 'employee') {
//     const count = await mongoose.model('User').countDocuments({ role: 'employee' });
//     this.employeeId = `EMP${String(count + 1).padStart(4, '0')}`;
//   }
//   next();
// });

// // Instance method to compare password
// userSchema.methods.comparePassword = async function(candidatePassword) {
//   return await bcrypt.compare(candidatePassword, this.passwordHash);
// };

// // Static method to find by email with password
// userSchema.statics.findByEmail = function(email) {
//   return this.findOne({ email }).select('+passwordHash');
// };

// // Indexes
// userSchema.index({ email: 1 }, { unique: true });
// userSchema.index({ employeeId: 1 }, { unique: true, sparse: true });
// userSchema.index({ role: 1 });
// userSchema.index({ isActive: 1 });

// const User = mongoose.model('User', userSchema);

// module.exports = User;


const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  passwordHash: {
    type: String,
    required: [true, 'Password is required'],
    select: false
  },
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  role: {
    type: String,
    enum: ['employee', 'hr', 'admin'],
    default: 'employee',
    required: true
  },
  employeeId: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  department: {
    type: String,
    trim: true,
    default: 'General'
  },
  designation: {
    type: String,
    trim: true,
    default: 'Staff'
  },
  phoneNumber: {
    type: String,
    trim: true,
    match: [/^[0-9+\-\s()]{10,15}$/, 'Please provide a valid phone number']
  },
  profilePicture: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for attendance records
userSchema.virtual('attendanceRecords', {
  ref: 'Attendance',
  localField: '_id',
  foreignField: 'userId'
});

// Virtual for correction requests
userSchema.virtual('correctionRequests', {
  ref: 'CorrectionRequest',
  localField: '_id',
  foreignField: 'userId'
});

// COMMENT OUT the pre-save middleware for now
// userSchema.pre('save', async function(next) {
//   if (!this.isModified('passwordHash')) return next();
//   
//   try {
//     const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 10);
//     this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
//     next();
//   } catch (error) {
//     next(error);
//   }
// });

// Pre-save middleware to generate employee ID
userSchema.pre('save', async function(next) {
  if (!this.employeeId && this.role === 'employee') {
    const count = await mongoose.model('User').countDocuments({ role: 'employee' });
    this.employeeId = `EMP${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

// Instance method to compare password - SIMPLIFIED for now
userSchema.methods.comparePassword = async function(candidatePassword) {
  // For now, just compare directly without hashing
  // This is temporary until we fix the hashing issue
  return this.passwordHash === candidatePassword;
  
  // Uncomment this when fixed:
  // return await bcrypt.compare(candidatePassword, this.passwordHash);
};

// Static method to find by email with password
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email }).select('+passwordHash');
};

// Indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ employeeId: 1 }, { unique: true, sparse: true });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

const User = mongoose.model('User', userSchema);

module.exports = User;