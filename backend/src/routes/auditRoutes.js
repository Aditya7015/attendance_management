const express = require('express');
const router = express.Router();
const {
  getAuditLogs,
  getActions,
  getStats
} = require('../controllers/auditController');
const auth = require('../middleware/auth');
const { roleAccess } = require('../middleware/rbac');
const { paginationValidation } = require('../middleware/validation');

router.get('/', auth, roleAccess(['admin']), paginationValidation, getAuditLogs);
router.get('/actions', auth, roleAccess(['admin']), getActions);
router.get('/stats', auth, roleAccess(['admin']), getStats);

module.exports = router;