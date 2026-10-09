const express = require('express');
const { body } = require('express-validator');
const userController = require('../controllers/userController');
const { requireAuth } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const v = require('./validators');

const router = express.Router();

router.get('/me', requireAuth, userController.getMe);

router.put(
  '/me',
  requireAuth,
  validate([
    body('name').optional().trim().notEmpty().withMessage('name cannot be empty'),
    body('college').optional().trim(),
    body('branch').optional().trim(),
    body('year')
      .optional()
      .isInt({ min: 1, max: 6 }).withMessage('year must be between 1 and 6')
      .toInt(),
    ...v.skillArray('skills'),
    body('github').optional().trim(),
    body('linkedin').optional().trim(),
    body('bio').optional().trim().isLength({ max: 1000 }),
  ]),
  userController.updateMe
);

module.exports = router;
