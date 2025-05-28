const { validationResult } = require('express-validator');
const { Program, Reservation } = require('../models');
const { Op } = require('sequelize');

exports.createProgram = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        errors: errors.array()
      });
    }

    const programData = {
      ...req.body,
      created_by_ip: req.ip
    };

    const program = await Program.create(programData);

    res.status(201).json({
      status: 'success',
      data: { program }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error creating program'
    });
  }
};

exports.getPrograms = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      venueLocation,
      startDate,
      endDate,
      programStatus
    } = req.query;

    const where = {};
    if (venueLocation) {
      where.venueLocation = { [Op.iLike]: `%${venueLocation}%` };
    }
    if (startDate && endDate) {
      where.scheduledDateTime = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }
    if (programStatus) {
      where.programStatus = programStatus;
    }

    const programs = await Program.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: (page - 1) * limit,
      order: [['scheduledDateTime', 'ASC']],
      include: [{
        model: Reservation,
        as: 'reservations',
        attributes: ['id', 'reservationStatus', 'reservationDate']
      }]
    });

    res.json({
      status: 'success',
      data: {
        programs: programs.rows,
        total: programs.count,
        currentPage: parseInt(page),
        totalPages: Math.ceil(programs.count / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching programs'
    });
  }
};

exports.getProgramById = async (req, res) => {
  try {
    const program = await Program.findByPk(req.params.id, {
      include: [{
        model: Reservation,
        as: 'reservations',
        attributes: ['id', 'reservationStatus', 'reservationDate']
      }]
    });

    if (!program) {
      return res.status(404).json({
        status: 'error',
        message: 'Program not found'
      });
    }

    res.json({
      status: 'success',
      data: { program }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching program'
    });
  }
};

exports.updateProgram = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        errors: errors.array()
      });
    }

    const program = await Program.findByPk(req.params.id);
    if (!program) {
      return res.status(404).json({
        status: 'error',
        message: 'Program not found'
      });
    }

    const updateData = {
      ...req.body,
      updated_at: new Date()
    };

    await program.update(updateData);

    res.json({
      status: 'success',
      data: { program }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error updating program'
    });
  }
};

exports.deleteProgram = async (req, res) => {
  try {
    const program = await Program.findByPk(req.params.id);
    if (!program) {
      return res.status(404).json({
        status: 'error',
        message: 'Program not found'
      });
    }

    
    const activeReservations = await Reservation.count({
      where: {
        programId: program.id,
        reservationStatus: 'confirmed'
      }
    });

    if (activeReservations > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot delete program with active reservations'
      });
    }

    await program.destroy();

    res.json({
      status: 'success',
      message: 'Program deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error deleting program'
    });
  }
}; 