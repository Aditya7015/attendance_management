const mongoose = require('mongoose');

const correctionRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  attendanceRecordId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Attendance',
    index: true
  },
  requestedDate: {
    type: String,
    required: [true, 'Requested date is required'],
    match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format']
  },
  requestedClockIn: {
    type: String,
    required: [true, 'Requested clock in time is required'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:MM format']
  },
  requestedClockOut: {
    type: String,
    required: [true, 'Requested clock out time is required'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:MM format']
  },
  reason: {
    type: String,
    required: [true, 'Reason is required'],
    minlength: [10, 'Reason must be at least 10 characters'],
    maxlength: [500, 'Reason cannot exceed 500 characters'],
    trim: true
  },
  attachment: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  reviewComment: {
    type: String,
    trim: true,
    maxlength: [500, 'Review comment cannot exceed 500 characters'],
    default: null
  },
  reviewedAt: {
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

// Virtual for user
correctionRequestSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

// Virtual for reviewer
correctionRequestSchema.virtual('reviewer', {
  ref: 'User',
  localField: 'reviewedBy',
  foreignField: '_id',
  justOne: true
});

// Pre-save validation
correctionRequestSchema.pre('save', function(next) {
  // Validate that requestedClockOut is after requestedClockIn
  const [inHour, inMin] = this.requestedClockIn.split(':').map(Number);
  const [outHour, outMin] = this.requestedClockOut.split(':').map(Number);
  
  const inMinutes = inHour * 60 + inMin;
  const outMinutes = outHour * 60 + outMin;
  
  if (outMinutes <= inMinutes) {
    next(new Error('Clock out time must be after clock in time'));
  }
  
  // Cannot request future dates
  const today = new Date().toISOString().split('T')[0];
  if (this.requestedDate > today) {
    next(new Error('Cannot request correction for future dates'));
  }
  
  next();
});

// Indexes
correctionRequestSchema.index({ userId: 1, status: 1 });
correctionRequestSchema.index({ status: 1, createdAt: -1 });
correctionRequestSchema.index({ attendanceRecordId: 1 });

const CorrectionRequest = mongoose.model('CorrectionRequest', correctionRequestSchema);

module.exports = CorrectionRequest;