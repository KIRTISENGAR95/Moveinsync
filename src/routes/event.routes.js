const express = require('express');
const { body } = require('express-validator');
const eventController = require('../controllers/event.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

const router = express.Router();

const eventValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('date_time').isISO8601().withMessage('Valid date and time is required'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('total_seats')
    .isInt({ min: 1 })
    .withMessage('Total seats must be at least 1')
];


router.get('/', eventController.getEvents);
router.get('/:id', eventController.getEventById);


router.post(
  '/',
  verifyToken,
  isAdmin,
  eventValidation,
  eventController.createEvent
);

router.put(
  '/:id',
  verifyToken,
  isAdmin,
  eventValidation,
  eventController.updateEvent
);

router.delete(
  '/:id',
  verifyToken,
  isAdmin,
  eventController.deleteEvent
);

module.exports = router; 