const { validationResult } = require('express-validator');
const { Booking, Event } = require('../models');

exports.createBooking = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        errors: errors.array()
      });
    }

    const { eventId } = req.body;
    const userId = req.user.id;

    const event = await Event.findByPk(eventId);
    if (!event) {
      return res.status(404).json({
        status: 'error',
        message: 'Event not found'
      });
    }

    if (event.available_seats <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'No seats available'
      });
    }

    const existingBooking = await Booking.findOne({
      where: {
        userId,
        eventId,
        status: 'confirmed'
      }
    });

    if (existingBooking) {
      return res.status(400).json({
        status: 'error',
        message: 'You have already booked this event'
      });
    }

    const booking = await Booking.create({
      userId,
      eventId
    });

    res.status(201).json({
      status: 'success',
      data: { booking }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error creating booking'
    });
  }
};

exports.getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      where: {
        userId: req.user.id
      },
      include: [{
        model: Event,
        as: 'event',
        attributes: ['title', 'date_time', 'location']
      }],
      order: [['booking_date', 'DESC']]
    });

    res.json({
      status: 'success',
      data: { bookings }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching bookings'
    });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!booking) {
      return res.status(404).json({
        status: 'error',
        message: 'Booking not found'
      });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({
        status: 'error',
        message: 'Booking is already cancelled'
      });
    }

    await booking.update({ status: 'cancelled' });

    res.json({
      status: 'success',
      message: 'Booking cancelled successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error cancelling booking'
    });
  }
}; 