const AttendanceRule = require('../models/AttendanceRule');
const AuditLog = require('../models/AuditLog');

// @desc    Get all rules
// @route   GET /api/rules
// @access  Private
const getRules = async (req, res) => {
  try {
    const { category, isActive } = req.query;

    const query = {};
    if (category) query.category = category;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const rules = await AttendanceRule.find(query)
      .sort({ category: 1, priority: 1, createdAt: -1 })
      .populate('createdBy', 'fullName email');

    res.status(200).json({
      success: true,
      data: rules
    });
  } catch (error) {
    console.error('Get rules error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Get single rule
// @route   GET /api/rules/:id
// @access  Private
const getRule = async (req, res) => {
  try {
    const rule = await AttendanceRule.findById(req.params.id)
      .populate('createdBy', 'fullName email')
      .populate('updatedBy', 'fullName email');

    if (!rule) {
      return res.status(404).json({
        success: false,
        message: 'Rule not found'
      });
    }

    res.status(200).json({
      success: true,
      data: rule
    });
  } catch (error) {
    console.error('Get rule error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Create rule
// @route   POST /api/rules
// @access  Private (Admin)
const createRule = async (req, res) => {
  try {
    const { ruleKey, ruleName, ruleValue, dataType, description, category, effectiveFrom } = req.body;

    // Check if rule key exists
    const existingRule = await AttendanceRule.findOne({ ruleKey });
    if (existingRule) {
      return res.status(400).json({
        success: false,
        message: 'Rule with this key already exists'
      });
    }

    const rule = await AttendanceRule.create({
      ruleKey,
      ruleName,
      ruleValue,
      dataType: dataType || 'string',
      description,
      category: category || 'general',
      effectiveFrom: effectiveFrom || new Date(),
      createdBy: req.user._id,
      priority: req.body.priority || 1
    });

    // Log rule creation
    await AuditLog.create({
      userId: req.user._id,
      userEmail: req.user.email,
      userRole: req.user.role,
      action: 'CREATE_RULE',
      resource: 'rule',
      resourceId: rule._id,
      details: {
        ruleKey,
        ruleName,
        ruleValue,
        category
      },
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.status(201).json({
      success: true,
      message: 'Rule created successfully',
      data: rule
    });
  } catch (error) {
    console.error('Create rule error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Update rule
// @route   PUT /api/rules/:id
// @access  Private (Admin)
const updateRule = async (req, res) => {
  try {
    const { ruleName, ruleValue, dataType, description, category, isActive, priority, effectiveFrom, effectiveTo } = req.body;

    const rule = await AttendanceRule.findById(req.params.id);
    if (!rule) {
      return res.status(404).json({
        success: false,
        message: 'Rule not found'
      });
    }

    // Update fields
    if (ruleName) rule.ruleName = ruleName;
    if (ruleValue !== undefined) rule.ruleValue = ruleValue;
    if (dataType) rule.dataType = dataType;
    if (description !== undefined) rule.description = description;
    if (category) rule.category = category;
    if (isActive !== undefined) rule.isActive = isActive;
    if (priority) rule.priority = priority;
    if (effectiveFrom) rule.effectiveFrom = effectiveFrom;
    if (effectiveTo !== undefined) rule.effectiveTo = effectiveTo;
    rule.updatedBy = req.user._id;

    await rule.save();

    // Log rule update
    await AuditLog.create({
      userId: req.user._id,
      userEmail: req.user.email,
      userRole: req.user.role,
      action: 'UPDATE_RULE',
      resource: 'rule',
      resourceId: rule._id,
      details: req.body,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.status(200).json({
      success: true,
      message: 'Rule updated successfully',
      data: rule
    });
  } catch (error) {
    console.error('Update rule error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Delete rule
// @route   DELETE /api/rules/:id
// @access  Private (Admin)
const deleteRule = async (req, res) => {
  try {
    const rule = await AttendanceRule.findById(req.params.id);
    if (!rule) {
      return res.status(404).json({
        success: false,
        message: 'Rule not found'
      });
    }

    await rule.remove();

    // Log rule deletion
    await AuditLog.create({
      userId: req.user._id,
      userEmail: req.user.email,
      userRole: req.user.role,
      action: 'DELETE_RULE',
      resource: 'rule',
      resourceId: rule._id,
      details: {
        ruleKey: rule.ruleKey,
        ruleName: rule.ruleName
      },
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.status(200).json({
      success: true,
      message: 'Rule deleted successfully',
      data: {
        ruleId: rule._id,
        ruleKey: rule.ruleKey
      }
    });
  } catch (error) {
    console.error('Delete rule error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getRules,
  getRule,
  createRule,
  updateRule,
  deleteRule
};