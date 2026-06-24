const mongoose = require('mongoose');
const moment = require('moment');

const attendanceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  date: {
    type: String,
    required: [true, 'Date is required'],
    match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'],
    index: true
  },
  clockIn: {
    time: {
      type: Date,
      default: null
    },
    source: {
      type: String,
      enum: ['web', 'mobile', 'api', 'correction'],
      default: 'web'
    },
    ip: {
      type: String,
      default: null
    },
    location: {
      type: {
        type: String,
        enum: [null, 'Point'],
        default: null
      },
      coordinates: {
        type: [Number],
        default: null
      }
    }
  },
  clockOut: {
    time: {
      type: Date,
      default: null
    },
    source: {
      type: String,
      enum: ['web', 'mobile', 'api', 'correction', null],  // FIXED: Allow null
      default: null
    },
    ip: {
      type: String,
      default: null
    },
    location: {
      type: {
        type: String,
        enum: [null, 'Point'],
        default: null
      },
      coordinates: {
        type: [Number],
        default: null
      }
    }
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'half_day', 'holiday', 'weekend'],
    default: 'absent'
  },
  workingHours: {
    type: Number,
    default: 0,
    min: [0, 'Working hours cannot be negative'],
    max: [24, 'Working hours cannot exceed 24']
  },
  overtimeMinutes: {
    type: Number,
    default: 0,
    min: [0, 'Overtime cannot be negative']
  },
  isLate: {
    type: Boolean,
    default: false
  },
  lateMinutes: {
    type: Number,
    default: 0,
    min: [0, 'Late minutes cannot be negative']
  },
  isEarlyLeave: {
    type: Boolean,
    default: false
  },
  earlyLeaveMinutes: {
    type: Number,
    default: 0,
    min: [0, 'Early leave minutes cannot be negative']
  },
  note: {
    type: String,
    trim: true,
    maxlength: [500, 'Note cannot exceed 500 characters']
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

// Virtual for correction request
attendanceSchema.virtual('correctionRequest', {
  ref: 'CorrectionRequest',
  localField: '_id',
  foreignField: 'attendanceRecordId',
  justOne: true
});

// Pre-save middleware to calculate working hours
attendanceSchema.pre('save', function(next) {
  // Only calculate if both clockIn and clockOut have time values
  if (this.clockIn && this.clockIn.time && this.clockOut && this.clockOut.time) {
    const diffMs = this.clockOut.time - this.clockIn.time;
    const diffHours = diffMs / (1000 * 60 * 60);
    this.workingHours = Math.round(diffHours * 100) / 100;
    
    // Calculate overtime (if working hours > 8)
    if (this.workingHours > 8) {
      this.overtimeMinutes = Math.round((this.workingHours - 8) * 60);
    }
  }
  
  // Update status if clock out exists and both times are present
  if (this.clockIn && this.clockIn.time && this.clockOut && this.clockOut.time) {
    this.status = 'present';
  }
  
  next();
});

// Pre-save middleware to check for late
attendanceSchema.pre('save', async function(next) {
  // Only check for late if clockIn.time exists
  if (this.clockIn && this.clockIn.time && this.isNew) {
    try {
      const Rule = mongoose.model('AttendanceRule');
      const startTimeRule = await Rule.findOne({ 
        ruleKey: 'work_start_time',
        isActive: true 
      });
      
      const graceMinutesRule = await Rule.findOne({
        ruleKey: 'grace_minutes',
        isActive: true
      });
      
      if (startTimeRule && startTimeRule.ruleValue) {
        const workStartTime = moment(startTimeRule.ruleValue, 'HH:mm');
        const clockInTime = moment(this.clockIn.time);
        const graceMinutes = graceMinutesRule ? parseInt(graceMinutesRule.ruleValue) : 0;
        
        const diffMinutes = clockInTime.diff(workStartTime, 'minutes');
        
        if (diffMinutes > graceMinutes) {
          this.isLate = true;
          this.lateMinutes = diffMinutes - graceMinutes;
        }
      }
    } catch (error) {
      console.error('Error checking late:', error);
    }
  }
  next();
});

// Compound index for unique user per day
attendanceSchema.index({ userId: 1, date: 1 }, { unique: true });
attendanceSchema.index({ date: 1, status: 1 });
attendanceSchema.index({ userId: 1, date: -1 });

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;