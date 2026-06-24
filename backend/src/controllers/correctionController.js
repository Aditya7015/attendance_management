const CorrectionRequest = require('../models/CorrectionRequest');
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const moment = require('moment');

// @desc    Create correction request
// @route   POST /api/corrections/request
// @access  Private (Employee)
const createCorrection = async (req, res) => {
  try {
    const userId = req.user._id;
    const { requestedDate, requestedClockIn, requestedClockOut, reason, attendanceRecordId } = req.body;

    // Check if already has pending request for this date
    const existingRequest = await CorrectionRequest.findOne({
      userId,
      requestedDate,
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending correction request for this date'
      });
    }

    // Check if date is not more than 30 days old
    const requestedDateObj = moment(requestedDate);
    const daysDiff = moment().diff(requestedDateObj, 'days');
    if (daysDiff > 30) {
      return res.status(400).json({
        success: false,
        message: 'Cannot request correction for dates older than 30 days'
      });
    }

    // Create correction request
    const correctionData = {
      userId,
      requestedDate,
      requestedClockIn,
      requestedClockOut,
      reason,
      attendanceRecordId: attendanceRecordId || null
    };

    const correction = await CorrectionRequest.create(correctionData);

    // Log correction request
    await AuditLog.create({
      userId: req.user._id,
      userEmail: req.user.email,
      userRole: req.user.role,
      action: 'CREATE_CORRECTION',
      resource: 'correction',
      resourceId: correction._id,
      details: {
        requestedDate,
        requestedClockIn,
        requestedClockOut,
        reason
      },
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.status(201).json({
      success: true,
      message: 'Correction request submitted successfully',
      data: correction
    });
  } catch (error) {
    console.error('Create correction error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Get correction requests
// @route   GET /api/corrections
// @access  Private
const getCorrections = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const userId = req.query.userId || req.user._id;

    // Check permissions
    const isAdminOrHR = req.user.role === 'admin' || req.user.role === 'hr';
    
    if (!isAdminOrHR && userId !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only view your own correction requests'
      });
    }

    // Build query
    const query = {};
    
    if (isAdminOrHR && req.query.userId) {
      query.userId = req.query.userId;
    } else if (!isAdminOrHR) {
      query.userId = req.user._id;
    }

    if (status) {
      query.status = status;
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [corrections, total] = await Promise.all([
      CorrectionRequest.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('user', 'fullName email employeeId')
        .populate('reviewer', 'fullName email'),
      CorrectionRequest.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data: {
        corrections,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get corrections error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Review correction request
// @route   PUT /api/corrections/:id/review
// @access  Private (HR/Admin)
const reviewCorrection = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reviewComment } = req.body;

    // Find correction request
    const correction = await CorrectionRequest.findById(id);

    if (!correction) {
      return res.status(404).json({
        success: false,
        message: 'Correction request not found'
      });
    }

    if (correction.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'This request has already been reviewed'
      });
    }

    // Update correction
    correction.status = status;
    correction.reviewedBy = req.user._id;
    correction.reviewComment = reviewComment || null;
    correction.reviewedAt = new Date();

    await correction.save();

    // If approved, update attendance record
    if (status === 'approved') {
      const attendance = await Attendance.findOne({
        userId: correction.userId,
        date: correction.requestedDate
      });

      if (attendance) {
        // Update existing attendance record
        const clockInTime = new Date(`${correction.requestedDate}T${correction.requestedClockIn}:00`);
        const clockOutTime = new Date(`${correction.requestedDate}T${correction.requestedClockOut}:00`);
        
        attendance.clockIn = {
          ...attendance.clockIn,
          time: clockInTime
        };
        attendance.clockOut = {
          ...attendance.clockOut,
          time: clockOutTime
        };
        await attendance.save();
      }
      // If no attendance record exists, create one
      else {
        const clockInTime = new Date(`${correction.requestedDate}T${correction.requestedClockIn}:00`);
        const clockOutTime = new Date(`${correction.requestedDate}T${correction.requestedClockOut}:00`);
        
        await Attendance.create({
          userId: correction.userId,
          date: correction.requestedDate,
          clockIn: {
            time: clockInTime,
            source: 'correction'
          },
          clockOut: {
            time: clockOutTime,
            source: 'correction'
          },
          status: 'present'
        });
      }
    }

    // Log review
    await AuditLog.create({
      userId: req.user._id,
      userEmail: req.user.email,
      userRole: req.user.role,
      action: status === 'approved' ? 'APPROVE_CORRECTION' : 'REJECT_CORRECTION',
      resource: 'correction',
      resourceId: correction._id,
      details: {
        status,
        reviewComment,
        requestedBy: correction.userId,
        requestedDate: correction.requestedDate
      },
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.status(200).json({
      success: true,
      message: `Correction request ${status} successfully`,
      data: correction
    });
  } catch (error) {
    console.error('Review correction error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  createCorrection,
  getCorrections,
  reviewCorrection
};