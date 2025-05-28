const express = require('express');
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const reservationController = require('../controllers/reservation.controller');
const { verifyToken } = require('../middleware/auth.middleware');

const router = express.Router();


const reservationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, 
  max: 20, 
  message: {
    status: 'error',
    message: 'Too many requests, please try again later'
  }
});

const reservationValidation = [
  body('programId')
    .isUUID()
    .withMessage('Valid program ID is required')
];


router.use(verifyToken);

router.post(
  '/',
  reservationLimiter,
  reservationValidation,
  reservationController.createReservation
);

router.get(
  '/my-reservations',
  reservationLimiter,
  reservationController.getAttendeeReservations
);

router.patch(
  '/:id/cancel',
  reservationLimiter,
  reservationController.cancelReservation
);

module.exports = router; 