const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  updateUserRole,
  deleteUser
} = require('../controllers/userController');
const auth = require('../middleware/auth');
const { roleAccess, canViewUsers, canManageUser } = require('../middleware/rbac');
const {
  userCreateValidation,
  userUpdateValidation,
  roleUpdateValidation,
  paginationValidation
} = require('../middleware/validation');

// All routes require authentication
router.use(auth);

// HR and Admin can view users
router.get('/', canViewUsers, paginationValidation, getUsers);
router.get('/:id', canViewUsers, getUser);

// Only Admin can manage users
router.post('/', roleAccess(['admin']), userCreateValidation, createUser);
router.put('/:id', roleAccess(['admin']), userUpdateValidation, updateUser);
router.put('/:id/role', roleAccess(['admin']), roleUpdateValidation, updateUserRole);
router.delete('/:id', roleAccess(['admin']), deleteUser);

module.exports = router;