const mongoose = require('mongoose');

const attendanceRuleSchema = new mongoose.Schema({
  ruleKey: {
    type: String,
    required: [true, 'Rule key is required'],
    unique: true,
    trim: true,
    maxlength: [50, 'Rule key cannot exceed 50 characters']
  },
  ruleName: {
    type: String,
    required: [true, 'Rule name is required'],
    trim: true,
    maxlength: [100, 'Rule name cannot exceed 100 characters']
  },
  ruleValue: {
    type: mongoose.Schema.Types.Mixed,
    required: [true, 'Rule value is required']
  },
  dataType: {
    type: String,
    enum: ['string', 'number', 'boolean', 'time', 'array'],
    default: 'string'
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  category: {
    type: String,
    enum: ['time', 'leave', 'overtime', 'general'],
    default: 'general'
  },
  effectiveFrom: {
    type: Date,
    default: Date.now
  },
  effectiveTo: {
    type: Date,
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  priority: {
    type: Number,
    default: 1,
    min: 1,
    max: 10
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
  timestamps: true
});

// Indexes
attendanceRuleSchema.index({ ruleKey: 1 }, { unique: true });
attendanceRuleSchema.index({ category: 1 });
attendanceRuleSchema.index({ isActive: 1 });

const AttendanceRule = mongoose.model('AttendanceRule', attendanceRuleSchema);

module.exports = AttendanceRule;