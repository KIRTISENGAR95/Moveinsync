const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { Attendee } = require('../models');

const generateToken = (attendee) => {
  return jwt.sign(
    { id: attendee.id, email: attendee.email, role: attendee.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        errors: errors.array()
      });
    }

    const { name, email, password } = req.body;

    const existingAttendee = await Attendee.findOne({ where: { email } });
    if (existingAttendee) {
      return res.status(400).json({
        status: 'error',
        message: 'Email already registered'
      });
    }

    const attendee = await Attendee.create({
      name,
      email,
      password,
      created_by_ip: req.ip
    });

    const token = generateToken(attendee);

    res.status(201).json({
      status: 'success',
      data: {
        attendee: {
          id: attendee.id,
          name: attendee.name,
          email: attendee.email,
          role: attendee.role
        },
        token
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error creating attendee account'
    });
  }
};

exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    const attendee = await Attendee.findOne({ where: { email } });
    if (!attendee) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    const isPasswordValid = await attendee.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    
    await attendee.update({ last_login_ip: req.ip });

    const token = generateToken(attendee);

    res.json({
      status: 'success',
      data: {
        attendee: {
          id: attendee.id,
          name: attendee.name,
          email: attendee.email,
          role: attendee.role
        },
        token
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error logging in'
    });
  }
}; 