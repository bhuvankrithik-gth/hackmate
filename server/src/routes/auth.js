const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const v = require('./validators');

const router = express.Router();

router.post(
  '/register/student',
  validate([
    body('name').trim().notEmpty().withMessage('name is required'),
    v.email,
    v.password,
    body('college').trim().notEmpty().withMessage('college is required'),
    body('branch').trim().notEmpty().withMessage('branch is required'),
    body('year')
      .notEmpty().withMessage('year is required')
      .isInt({ min: 1, max: 6 }).withMessage('year must be between 1 and 6')
      .toInt(),
    ...v.skillArray('skills'),
    body('github').optional().trim(),
    body('linkedin').optional().trim(),
    body('bio').optional().trim().isLength({ max: 1000 }),
  ]),
  authController.registerStudent
);

router.post(
  '/register/host',
  validate([
    body('name').trim().notEmpty().withMessage('name is required'),
    body('organization').trim().notEmpty().withMessage('organization is required'),
    v.email,
    v.password,
  ]),
  authController.registerHost
);

router.post(
  '/login',
  validate([v.email, body('password').notEmpty().withMessage('password is required')]),
  authController.login
);

router.get('/me', requireAuth, authController.me);

module.exports = router;
