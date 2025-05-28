const sequelize = require('../config/db');

const Attendee = require('./attendee.model')(sequelize);
const Program = require('./program.model')(sequelize);
const Reservation = require('./reservation.model')(sequelize);


Attendee.hasMany(Reservation, { foreignKey: 'attendeeId', as: 'reservations' });
Reservation.belongsTo(Attendee, { foreignKey: 'attendeeId', as: 'attendee' });

Program.hasMany(Reservation, { foreignKey: 'programId', as: 'reservations' });
Reservation.belongsTo(Program, { foreignKey: 'programId', as: 'program' });

module.exports = {
  sequelize,
  Attendee,
  Program,
  Reservation
}; 