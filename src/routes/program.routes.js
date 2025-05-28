const express = require('express');
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const programController = require('../controllers/program.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

const router = express.Router();


const programLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // 100 requests per window
  message: {
    status: 'error',
    message: 'Too many requests, please try again later'
  }
});

const programValidation = [
  body('programTitle')
    .trim()
    .notEmpty()
    .withMessage('Program title is required')
    .isLength({ min: 3 })
    .withMessage('Title must be at least 3 characters long'),
  body('programDescription')
    .trim()
    .notEmpty()
    .withMessage('Program description is required')
    .isLength({ min: 10 })
    .withMessage('Description must be at least 10 characters long'),
  body('scheduledDateTime')
    .isISO8601()
    .withMessage('Valid date and time is required')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Program must be scheduled for a future date and time');
      }
      return true;
    }),
  body('venueLocation')
    .trim()
    .notEmpty()
    .withMessage('Venue location is required'),
  body('totalCapacity')
    .isInt({ min: 1 })
    .withMessage('Total capacity must be at least 1')
];


router.get('/', programLimiter, programController.getPrograms);
router.get('/:id', programLimiter, programController.getProgramById);


router.post(
  '/',
  verifyToken,
  isAdmin,
  programValidation,
  programController.createProgram
);

router.put(
  '/:id',
  verifyToken,
  isAdmin,
  programValidation,
  programController.updateProgram
);

router.delete(
  '/:id',
  verifyToken,
  isAdmin,
  programController.deleteProgram
);

module.exports = router; 