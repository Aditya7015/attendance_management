// const express = require('express');
// const router = express.Router();
// const {
//   clockIn,
//   clockOut,
//   getTodayStatus,
//   getHistory
// } = require('../controllers/attendanceController');
// const auth = require('../middleware/auth');
// const { roleAccess, canViewUser } = require('../middleware/rbac');
// const { clockInValidation } = require('../middleware/validation');

// router.post('/clock-in', auth, roleAccess(['employee']), clockInValidation, clockIn);
// router.post('/clock-out', auth, roleAccess(['employee']), clockOut);
// router.get('/today-status', auth, getTodayStatus);
// router.get('/history', auth, getHistory);
// router.get('/history/:userId', auth, canViewUser, getHistory);

// module.exports = router;


const express = require('express');
const router = express.Router();
const {
  clockIn,
  clockOut,
  getTodayStatus,
  getHistory
} = require('../controllers/attendanceController');
const auth = require('../middleware/auth');
const { roleAccess } = require('../middleware/rbac');

// All routes require authentication
router.use(auth);

// Employee routes
router.post('/clock-in', roleAccess(['employee', 'hr', 'admin']), clockIn);
router.post('/clock-out', roleAccess(['employee', 'hr', 'admin']), clockOut);
router.get('/today-status', getTodayStatus);
router.get('/history', getHistory);

module.exports = router;