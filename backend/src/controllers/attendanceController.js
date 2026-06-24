// const Attendance = require('../models/Attendance');
// const User = require('../models/User');
// const AuditLog = require('../models/AuditLog');
// const AttendanceRule = require('../models/AttendanceRule');
// const moment = require('moment');

// // @desc    Clock in
// // @route   POST /api/attendance/clock-in
// // @access  Private (Employee)
// const clockIn = async (req, res) => {
//   try {
//     const userId = req.user._id;
//     const today = new Date().toISOString().split('T')[0];

//     // Check if already clocked in today
//     const existingAttendance = await Attendance.findOne({
//       userId,
//       date: today
//     });

//     if (existingAttendance) {
//       if (existingAttendance.clockIn && !existingAttendance.clockOut) {
//         return res.status(400).json({
//           success: false,
//           message: 'You are already clocked in. Please clock out first.'
//         });
//       }
      
//       if (existingAttendance.clockOut) {
//         return res.status(400).json({
//           success: false,
//           message: 'You have already clocked out for today'
//         });
//       }
//     }

//     // Get IP address
//     const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;

//     // Create attendance record
//     const attendanceData = {
//       userId,
//       date: today,
//       clockIn: {
//         time: new Date(),
//         source: req.body.source || 'web',
//         ip: ip,
//         location: req.body.location || null
//       },
//       status: 'present'
//     };

//     let attendance;
    
//     if (existingAttendance) {
//       // Update existing record (shouldn't happen if logic is correct)
//       attendance = await Attendance.findByIdAndUpdate(
//         existingAttendance._id,
//         { $set: { clockIn: attendanceData.clockIn } },
//         { new: true }
//       );
//     } else {
//       attendance = await Attendance.create(attendanceData);
//     }

//     // Log clock in
//     await AuditLog.create({
//       userId: req.user._id,
//       userEmail: req.user.email,
//       userRole: req.user.role,
//       action: 'CLOCK_IN',
//       resource: 'attendance',
//       resourceId: attendance._id,
//       details: {
//         time: attendance.clockIn.time,
//         source: attendance.clockIn.source
//       },
//       ip: ip,
//       userAgent: req.headers['user-agent']
//     });

//     res.status(201).json({
//       success: true,
//       message: 'Clocked in successfully',
//       data: attendance
//     });
//   } catch (error) {
//     console.error('Clock in error:', error);
    
//     if (error.code === 11000) {
//       return res.status(400).json({
//         success: false,
//         message: 'You have already clocked in today'
//       });
//     }

//     res.status(500).json({
//       success: false,
//       message: 'Internal server error'
//     });
//   }
// };

// // @desc    Clock out
// // @route   POST /api/attendance/clock-out
// // @access  Private (Employee)
// const clockOut = async (req, res) => {
//   try {
//     const userId = req.user._id;
//     const today = new Date().toISOString().split('T')[0];

//     // Find today's attendance
//     const attendance = await Attendance.findOne({
//       userId,
//       date: today
//     });

//     if (!attendance) {
//       return res.status(400).json({
//         success: false,
//         message: 'You have not clocked in today'
//       });
//     }

//     if (attendance.clockOut && attendance.clockOut.time) {
//       return res.status(400).json({
//         success: false,
//         message: 'You have already clocked out today'
//       });
//     }

//     // Get IP address
//     const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;

//     // Update clock out
//     attendance.clockOut = {
//       time: new Date(),
//       source: req.body.source || 'web',
//       ip: ip,
//       location: req.body.location || null
//     };

//     // Calculate working hours and overtime
//     await attendance.save();

//     // Log clock out
//     await AuditLog.create({
//       userId: req.user._id,
//       userEmail: req.user.email,
//       userRole: req.user.role,
//       action: 'CLOCK_OUT',
//       resource: 'attendance',
//       resourceId: attendance._id,
//       details: {
//         time: attendance.clockOut.time,
//         source: attendance.clockOut.source,
//         workingHours: attendance.workingHours,
//         overtimeMinutes: attendance.overtimeMinutes
//       },
//       ip: ip,
//       userAgent: req.headers['user-agent']
//     });

//     res.status(200).json({
//       success: true,
//       message: 'Clocked out successfully',
//       data: attendance
//     });
//   } catch (error) {
//     console.error('Clock out error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error'
//     });
//   }
// };

// // @desc    Get today's attendance status
// // @route   GET /api/attendance/today-status
// // @access  Private
// const getTodayStatus = async (req, res) => {
//   try {
//     const userId = req.user._id;
//     const today = new Date().toISOString().split('T')[0];

//     const attendance = await Attendance.findOne({
//       userId,
//       date: today
//     });

//     // Get attendance rules
//     const rules = await AttendanceRule.find({ isActive: true });
//     const rulesMap = {};
//     rules.forEach(rule => {
//       rulesMap[rule.ruleKey] = rule.ruleValue;
//     });

//     const status = {
//       isClockedIn: false,
//       isClockedOut: false,
//       clockInTime: null,
//       clockOutTime: null,
//       workingHours: 0,
//       status: 'absent',
//       isLate: false,
//       lateMinutes: 0,
//       rules: {
//         workStartTime: rulesMap.work_start_time || '09:00',
//         workEndTime: rulesMap.work_end_time || '18:00',
//         graceMinutes: parseInt(rulesMap.grace_minutes) || 10,
//         workDays: rulesMap.work_days ? rulesMap.work_days.split(',') : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
//       }
//     };

//     if (attendance) {
//       status.isClockedIn = !!attendance.clockIn;
//       status.isClockedOut = !!attendance.clockOut;
//       status.clockInTime = attendance.clockIn ? attendance.clockIn.time : null;
//       status.clockOutTime = attendance.clockOut ? attendance.clockOut.time : null;
//       status.workingHours = attendance.workingHours || 0;
//       status.status = attendance.status;
//       status.isLate = attendance.isLate || false;
//       status.lateMinutes = attendance.lateMinutes || 0;
//     }

//     // Check if today is a weekend
//     const todayName = moment().format('dddd');
//     if (status.rules.workDays && !status.rules.workDays.includes(todayName)) {
//       status.status = 'weekend';
//       status.message = 'Today is a weekend';
//     }

//     res.status(200).json({
//       success: true,
//       data: status
//     });
//   } catch (error) {
//     console.error('Get today status error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error'
//     });
//   }
// };

// // @desc    Get attendance history
// // @route   GET /api/attendance/history
// // @access  Private
// const getHistory = async (req, res) => {
//   try {
//     const userId = req.params.userId || req.user._id;
//     const { from, to, page = 1, limit = 20 } = req.query;

//     // Check permissions
//     if (userId !== req.user._id.toString() && 
//         req.user.role !== 'admin' && 
//         req.user.role !== 'hr') {
//       return res.status(403).json({
//         success: false,
//         message: 'You can only view your own attendance history'
//       });
//     }

//     // Build query
//     const query = { userId };

//     if (from) {
//       query.date = { $gte: from };
//     }
//     if (to) {
//       query.date = { ...query.date, $lte: to };
//     }

//     // If no date range, get last 30 days
//     if (!from && !to) {
//       const thirtyDaysAgo = moment().subtract(30, 'days').format('YYYY-MM-DD');
//       query.date = { $gte: thirtyDaysAgo };
//     }

//     // Pagination
//     const skip = (parseInt(page) - 1) * parseInt(limit);

//     const [attendance, total] = await Promise.all([
//       Attendance.find(query)
//         .sort({ date: -1 })
//         .skip(skip)
//         .limit(parseInt(limit))
//         .populate('correctionRequest'),
//       Attendance.countDocuments(query)
//     ]);

//     const user = await User.findById(userId).select('fullName email employeeId');

//     res.status(200).json({
//       success: true,
//       data: {
//         user,
//         attendance,
//         pagination: {
//           page: parseInt(page),
//           limit: parseInt(limit),
//           total,
//           pages: Math.ceil(total / parseInt(limit))
//         }
//       }
//     });
//   } catch (error) {
//     console.error('Get history error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error'
//     });
//   }
// };

// module.exports = {
//   clockIn,
//   clockOut,
//   getTodayStatus,
//   getHistory
// };


const Attendance = require('../models/Attendance');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const AttendanceRule = require('../models/AttendanceRule');
const moment = require('moment');

// @desc    Clock in
// @route   POST /api/attendance/clock-in
// @access  Private
const clockIn = async (req, res) => {
  try {
    const userId = req.user._id;
    const today = new Date().toISOString().split('T')[0];

    console.log('Clock in attempt for user:', userId, 'Date:', today);

    // Check if already clocked in today
    const existingAttendance = await Attendance.findOne({
      userId,
      date: today
    });

    if (existingAttendance) {
      if (existingAttendance.clockIn && existingAttendance.clockIn.time && !existingAttendance.clockOut) {
        return res.status(400).json({
          success: false,
          message: 'You are already clocked in. Please clock out first.'
        });
      }
      
      if (existingAttendance.clockOut && existingAttendance.clockOut.time) {
        return res.status(400).json({
          success: false,
          message: 'You have already clocked out for today'
        });
      }
    }

    // Get IP address
    const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';

    // Create attendance data
    const attendanceData = {
      userId,
      date: today,
      clockIn: {
        time: new Date(),
        source: req.body.source || 'web',
        ip: ip
      },
      status: 'present'
    };

    let attendance;
    
    if (existingAttendance) {
      // Update existing record
      existingAttendance.clockIn = attendanceData.clockIn;
      existingAttendance.status = 'present';
      attendance = await existingAttendance.save();
    } else {
      attendance = await Attendance.create(attendanceData);
    }

    // Log clock in
    await AuditLog.create({
      userId: req.user._id,
      userEmail: req.user.email,
      userRole: req.user.role,
      action: 'CLOCK_IN',
      resource: 'attendance',
      resourceId: attendance._id,
      details: {
        time: attendance.clockIn.time,
        source: attendance.clockIn.source
      },
      ip: ip,
      userAgent: req.headers['user-agent'] || 'unknown'
    });

    res.status(201).json({
      success: true,
      message: 'Clocked in successfully',
      data: attendance
    });
  } catch (error) {
    console.error('Clock in error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You have already clocked in today'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Clock out
// @route   POST /api/attendance/clock-out
// @access  Private
const clockOut = async (req, res) => {
  try {
    const userId = req.user._id;
    const today = new Date().toISOString().split('T')[0];

    console.log('Clock out attempt for user:', userId, 'Date:', today);

    // Find today's attendance
    const attendance = await Attendance.findOne({
      userId,
      date: today
    });

    if (!attendance) {
      return res.status(400).json({
        success: false,
        message: 'You have not clocked in today'
      });
    }

    if (!attendance.clockIn || !attendance.clockIn.time) {
      return res.status(400).json({
        success: false,
        message: 'You have not clocked in today'
      });
    }

    if (attendance.clockOut && attendance.clockOut.time) {
      return res.status(400).json({
        success: false,
        message: 'You have already clocked out today'
      });
    }

    // Get IP address
    const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';

    // Update clock out
    attendance.clockOut = {
      time: new Date(),
      source: req.body.source || 'web',
      ip: ip
    };

    // Calculate working hours
    const diffMs = attendance.clockOut.time - attendance.clockIn.time;
    const diffHours = diffMs / (1000 * 60 * 60);
    attendance.workingHours = Math.round(diffHours * 100) / 100;
    
    // Calculate overtime
    if (attendance.workingHours > 8) {
      attendance.overtimeMinutes = Math.round((attendance.workingHours - 8) * 60);
    }

    await attendance.save();

    // Log clock out
    await AuditLog.create({
      userId: req.user._id,
      userEmail: req.user.email,
      userRole: req.user.role,
      action: 'CLOCK_OUT',
      resource: 'attendance',
      resourceId: attendance._id,
      details: {
        time: attendance.clockOut.time,
        source: attendance.clockOut.source,
        workingHours: attendance.workingHours,
        overtimeMinutes: attendance.overtimeMinutes
      },
      ip: ip,
      userAgent: req.headers['user-agent'] || 'unknown'
    });

    res.status(200).json({
      success: true,
      message: 'Clocked out successfully',
      data: attendance
    });
  } catch (error) {
    console.error('Clock out error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get today's attendance status
// @route   GET /api/attendance/today-status
// @access  Private
const getTodayStatus = async (req, res) => {
  try {
    const userId = req.user._id;
    const today = new Date().toISOString().split('T')[0];

    console.log('Get today status for user:', userId, 'Date:', today);

    const attendance = await Attendance.findOne({
      userId,
      date: today
    });

    // Get attendance rules
    let rulesMap = {};
    try {
      const rules = await AttendanceRule.find({ isActive: true });
      rules.forEach(rule => {
        rulesMap[rule.ruleKey] = rule.ruleValue;
      });
    } catch (ruleError) {
      console.error('Error fetching rules:', ruleError);
    }

    const status = {
      isClockedIn: false,
      isClockedOut: false,
      clockInTime: null,
      clockOutTime: null,
      workingHours: 0,
      status: 'absent',
      isLate: false,
      lateMinutes: 0,
      rules: {
        workStartTime: rulesMap.work_start_time || '09:00',
        workEndTime: rulesMap.work_end_time || '18:00',
        graceMinutes: parseInt(rulesMap.grace_minutes) || 10,
        workDays: rulesMap.work_days ? (Array.isArray(rulesMap.work_days) ? rulesMap.work_days : rulesMap.work_days.split(',')) : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
      }
    };

    if (attendance) {
      status.isClockedIn = !!(attendance.clockIn && attendance.clockIn.time);
      status.isClockedOut = !!(attendance.clockOut && attendance.clockOut.time);
      status.clockInTime = attendance.clockIn && attendance.clockIn.time ? attendance.clockIn.time : null;
      status.clockOutTime = attendance.clockOut && attendance.clockOut.time ? attendance.clockOut.time : null;
      status.workingHours = attendance.workingHours || 0;
      status.status = attendance.status || 'absent';
      status.isLate = attendance.isLate || false;
      status.lateMinutes = attendance.lateMinutes || 0;
    }

    // Check if today is a weekend
    const todayName = moment().format('dddd');
    if (status.rules.workDays && !status.rules.workDays.includes(todayName)) {
      status.status = 'weekend';
      status.message = 'Today is a weekend';
    }

    res.status(200).json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Get today status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get attendance history
// @route   GET /api/attendance/history
// @access  Private
const getHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { from, to, page = 1, limit = 20 } = req.query;

    console.log('Get history for user:', userId);

    // Build query
    const query = { userId };

    if (from) {
      query.date = { $gte: from };
    }
    if (to) {
      query.date = { ...query.date, $lte: to };
    }

    // If no date range, get last 30 days
    if (!from && !to) {
      const thirtyDaysAgo = moment().subtract(30, 'days').format('YYYY-MM-DD');
      query.date = { $gte: thirtyDaysAgo };
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [attendance, total] = await Promise.all([
      Attendance.find(query)
        .sort({ date: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Attendance.countDocuments(query)
    ]);

    const user = await User.findById(userId).select('fullName email employeeId');

    res.status(200).json({
      success: true,
      data: {
        user,
        attendance,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  clockIn,
  clockOut,
  getTodayStatus,
  getHistory
};