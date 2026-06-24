const express = require('express');
const router = express.Router();
const {
  clockIn,
  clockOut,
  getTodayStatus,
  getHistory,
  getUserHistory
} = require('../controllers/attendanceController');
const auth = require('../middleware/auth');
const { roleAccess, canViewUser } = require('../middleware/rbac');

// All routes require authentication
router.use(auth);

// Employee routes
router.post('/clock-in', roleAccess(['employee', 'hr', 'admin']), clockIn);
router.post('/clock-out', roleAccess(['employee', 'hr', 'admin']), clockOut);
router.get('/today-status', getTodayStatus);
router.get('/history', getHistory);

// Get specific user's history (HR/Admin can view any user, Employee can only view own)
router.get('/history/:userId', canViewUser, getUserHistory);

module.exports = router;