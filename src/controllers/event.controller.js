const { validationResult } = require('express-validator');
const { Event, Booking } = require('../models');
const { Op } = require('sequelize');

exports.createEvent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        errors: errors.array()
      });
    }

    const event = await Event.create(req.body);

    res.status(201).json({
      status: 'success',
      data: { event }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error creating event'
    });
  }
};

exports.getEvents = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      location,
      startDate,
      endDate,
      status
    } = req.query;

    const where = {};
    if (location) {
      where.location = { [Op.iLike]: `%${location}%` };
    }
    if (startDate && endDate) {
      where.date_time = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }
    if (status) {
      where.status = status;
    }

    const events = await Event.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: (page - 1) * limit,
      order: [['date_time', 'ASC']]
    });

    res.json({
      status: 'success',
      data: {
        events: events.rows,
        total: events.count,
        currentPage: parseInt(page),
        totalPages: Math.ceil(events.count / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching events'
    });
  }
};

exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id, {
      include: [{
        model: Booking,
        as: 'bookings',
        attributes: ['id', 'status', 'booking_date']
      }]
    });

    if (!event) {
      return res.status(404).json({
        status: 'error',
        message: 'Event not found'
      });
    }

    res.json({
      status: 'success',
      data: { event }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching event'
    });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        errors: errors.array()
      });
    }

    const event = await Event.findByPk(req.params.id);
    if (!event) {
      return res.status(404).json({
        status: 'error',
        message: 'Event not found'
      });
    }

    await event.update(req.body);

    res.json({
      status: 'success',
      data: { event }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error updating event'
    });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) {
      return res.status(404).json({
        status: 'error',
        message: 'Event not found'
      });
    }

    await event.destroy();

    res.json({
      status: 'success',
      message: 'Event deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error deleting event'
    });
  }
}; 