const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: {
    status: 'error',
    message: 'Too many requests, please try again later'
  }
});

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(globalLimiter);

app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Welcome to Program Reservation System API',
    documentation: {
      authentication: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login'
      },
      programs: {
        list: 'GET /api/programs',
        getById: 'GET /api/programs/:id',
        create: 'POST /api/programs',
        update: 'PUT /api/programs/:id',
        delete: 'DELETE /api/programs/:id'
      },
      reservations: {
        create: 'POST /api/reservations',
        list: 'GET /api/reservations/my-reservations',
        cancel: 'PATCH /api/reservations/:id/cancel'
      }
    }
  });
});


app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/programs', require('./routes/program.routes'));
app.use('/api/reservations', require('./routes/reservation.routes'));


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal server error'
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app; 