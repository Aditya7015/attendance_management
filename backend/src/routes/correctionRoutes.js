const express = require('express');
const router = express.Router();
const {
  createCorrection,
  getCorrections,
  reviewCorrection
} = require('../controllers/correctionController');
const auth = require('../middleware/auth');
const { roleAccess, canReviewCorrection } = require('../middleware/rbac');
const { correctionRequestValidation } = require('../middleware/validation');

router.post('/request', auth, roleAccess(['employee']), correctionRequestValidation, createCorrection);
router.get('/', auth, getCorrections);
router.put('/:id/review', auth, canReviewCorrection, reviewCorrection);

module.exports = router;