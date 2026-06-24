const express = require('express');
const router = express.Router();
const {
  getRules,
  getRule,
  createRule,
  updateRule,
  deleteRule
} = require('../controllers/ruleController');
const auth = require('../middleware/auth');
const { roleAccess } = require('../middleware/rbac');
const { ruleCreateValidation } = require('../middleware/validation');

router.get('/', auth, getRules);
router.get('/:id', auth, getRule);
router.post('/', auth, roleAccess(['admin']), ruleCreateValidation, createRule);
router.put('/:id', auth, roleAccess(['admin']), updateRule);
router.delete('/:id', auth, roleAccess(['admin']), deleteRule);

module.exports = router;