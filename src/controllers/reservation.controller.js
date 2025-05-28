const { validationResult } = require('express-validator');
const { Reservation, Program } = require('../models');

exports.createReservation = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        errors: errors.array()
      });
    }

    const { programId } = req.body;
    const attendeeId = req.user.id;

    const program = await Program.findByPk(programId);
    if (!program) {
      return res.status(404).json({
        status: 'error',
        message: 'Program not found'
      });
    }

    if (program.remainingCapacity <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'No seats available'
      });
    }

    const existingReservation = await Reservation.findOne({
      where: {
        attendeeId,
        programId,
        reservationStatus: 'confirmed'
      }
    });

    if (existingReservation) {
      return res.status(400).json({
        status: 'error',
        message: 'You have already reserved this program'
      });
    }

    const reservation = await Reservation.create({
      attendeeId,
      programId,
      created_by_ip: req.ip
    });

    res.status(201).json({
      status: 'success',
      data: { reservation }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error creating reservation'
    });
  }
};

exports.getAttendeeReservations = async (req, res) => {
  try {
    const reservations = await Reservation.findAll({
      where: {
        attendeeId: req.user.id
      },
      include: [{
        model: Program,
        as: 'program',
        attributes: ['programTitle', 'scheduledDateTime', 'venueLocation']
      }],
      order: [['reservationDate', 'DESC']]
    });

    res.json({
      status: 'success',
      data: { reservations }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching reservations'
    });
  }
};

exports.cancelReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findOne({
      where: {
        id: req.params.id,
        attendeeId: req.user.id
      }
    });

    if (!reservation) {
      return res.status(404).json({
        status: 'error',
        message: 'Reservation not found'
      });
    }

    if (reservation.reservationStatus === 'cancelled') {
      return res.status(400).json({
        status: 'error',
        message: 'Reservation is already cancelled'
      });
    }

    const updateData = {
      reservationStatus: 'cancelled',
      updated_at: new Date()
    };

    await reservation.update(updateData);

    res.json({
      status: 'success',
      message: 'Reservation cancelled successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error cancelling reservation'
    });
  }
}; 