const express = require('express');
const { body } = require('express-validator');
const bookingController = require('../controllers/booking.controller');
const { verifyToken } = require('../middleware/auth.middleware');

const router = express.Router();

const bookingValidation = [
  body('eventId').isUUID().withMessage('Valid event ID is required')
];


router.use(verifyToken);

router.post(
  '/',
  bookingValidation,
  bookingController.createBooking
);

router.get(
  '/my-bookings',
  bookingController.getUserBookings
);

router.patch(
  '/:id/cancel',
  bookingController.cancelBooking
);

module.exports = router; 