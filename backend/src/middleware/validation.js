const { validationResult, body, param, query } = require('express-validator');

// Validation rules
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    });
  }
  next();
};

// Login validation
const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail()
    .trim(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  validate
];

// Clock in/out validation
const clockInValidation = [
  body('source')
    .optional()
    .isIn(['web', 'mobile', 'api'])
    .withMessage('Invalid source'),
  body('ip')
    .optional()
    .isIP()
    .withMessage('Invalid IP address'),
  body('location')
    .optional()
    .isObject()
    .withMessage('Location must be an object'),
  validate
];

// Correction request validation
const correctionRequestValidation = [
  body('requestedDate')
    .isISO8601()
    .withMessage('Invalid date format')
    .custom((value) => {
      const today = new Date().toISOString().split('T')[0];
      if (value > today) {
        throw new Error('Cannot request correction for future dates');
      }
      return true;
    }),
  body('requestedClockIn')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Invalid clock in time format (HH:MM)'),
  body('requestedClockOut')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Invalid clock out time format (HH:MM)')
    .custom((value, { req }) => {
      const [inHour, inMin] = req.body.requestedClockIn.split(':').map(Number);
      const [outHour, outMin] = value.split(':').map(Number);
      const inMinutes = inHour * 60 + inMin;
      const outMinutes = outHour * 60 + outMin;
      if (outMinutes <= inMinutes) {
        throw new Error('Clock out time must be after clock in time');
      }
      return true;
    }),
  body('reason')
    .notEmpty()
    .withMessage('Reason is required')
    .isLength({ min: 10, max: 500 })
    .withMessage('Reason must be between 10 and 500 characters')
    .trim(),
  validate
];

// User management validation
const userCreateValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail()
    .trim(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase, one lowercase, and one number'),
  body('fullName')
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .trim(),
  body('role')
    .optional()
    .isIn(['employee', 'hr', 'admin'])
    .withMessage('Invalid role'),
  body('department')
    .optional()
    .trim(),
  validate
];

const userUpdateValidation = [
  body('fullName')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .trim(),
  body('department')
    .optional()
    .trim(),
  body('designation')
    .optional()
    .trim(),
  body('phoneNumber')
    .optional()
    .matches(/^[0-9+\-\s()]{10,15}$/)
    .withMessage('Please provide a valid phone number'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  validate
];

const roleUpdateValidation = [
  body('role')
    .isIn(['employee', 'hr', 'admin'])
    .withMessage('Invalid role'),
  validate
];

// Rule validation
const ruleCreateValidation = [
  body('ruleKey')
    .notEmpty()
    .withMessage('Rule key is required')
    .isLength({ max: 50 })
    .withMessage('Rule key cannot exceed 50 characters')
    .trim(),
  body('ruleName')
    .notEmpty()
    .withMessage('Rule name is required')
    .isLength({ max: 100 })
    .withMessage('Rule name cannot exceed 100 characters')
    .trim(),
  body('ruleValue')
    .notEmpty()
    .withMessage('Rule value is required'),
  body('dataType')
    .optional()
    .isIn(['string', 'number', 'boolean', 'time', 'array'])
    .withMessage('Invalid data type'),
  body('category')
    .optional()
    .isIn(['time', 'leave', 'overtime', 'general'])
    .withMessage('Invalid category'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters')
    .trim(),
  validate
];

// Pagination validation
const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer')
    .toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
    .toInt(),
  validate
];

module.exports = {
  validate,
  loginValidation,
  clockInValidation,
  correctionRequestValidation,
  userCreateValidation,
  userUpdateValidation,
  roleUpdateValidation,
  ruleCreateValidation,
  paginationValidation
};