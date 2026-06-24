const AuditLog = require('../models/AuditLog');
const User = require('../models/User');

// @desc    Get audit logs
// @route   GET /api/audit-logs
// @access  Private (Admin)
const getAuditLogs = async (req, res) => {
  try {
    const { 
      userId, 
      action, 
      resource, 
      status,
      from,
      to,
      search,
      page = 1, 
      limit = 50 
    } = req.query;

    // Build query
    const query = {};

    if (userId) {
      query.userId = userId;
    }

    if (action) {
      query.action = action;
    }

    if (resource) {
      query.resource = resource;
    }

    if (status) {
      query.status = status;
    }

    if (from || to) {
      query.timestamp = {};
      if (from) query.timestamp.$gte = new Date(from);
      if (to) query.timestamp.$lte = new Date(to);
    }

    if (search) {
      query.$or = [
        { userEmail: { $regex: search, $options: 'i' } },
        { action: { $regex: search, $options: 'i' } },
        { 'details.message': { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('user', 'fullName email role'),
      AuditLog.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data: {
        logs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Get audit log actions
// @route   GET /api/audit-logs/actions
// @access  Private (Admin)
const getActions = async (req, res) => {
  try {
    const actions = await AuditLog.distinct('action');
    res.status(200).json({
      success: true,
      data: actions.sort()
    });
  } catch (error) {
    console.error('Get actions error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Get audit log statistics
// @route   GET /api/audit-logs/stats
// @access  Private (Admin)
const getStats = async (req, res) => {
  try {
    const { days = 7 } = req.query;

    const since = new Date();
    since.setDate(since.getDate() - parseInt(days));

    const stats = await AuditLog.aggregate([
      {
        $match: {
          timestamp: { $gte: since }
        }
      },
      {
        $group: {
          _id: {
            action: '$action',
            date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } }
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.date',
          actions: {
            $push: {
              action: '$_id.action',
              count: '$count'
            }
          },
          total: { $sum: '$count' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get audit stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getAuditLogs,
  getActions,
  getStats
};