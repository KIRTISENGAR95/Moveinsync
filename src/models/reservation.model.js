const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Reservation extends Model {
    static associate(models) {
      Reservation.belongsTo(models.Attendee, {
        foreignKey: 'attendeeId',
        as: 'attendee'
      });
      Reservation.belongsTo(models.Program, {
        foreignKey: 'programId',
        as: 'program'
      });
    }
  }

  Reservation.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    attendeeId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Attendees',
        key: 'id'
      }
    },
    programId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Programs',
        key: 'id'
      }
    },
    reservationStatus: {
      type: DataTypes.ENUM('confirmed', 'cancelled'),
      defaultValue: 'confirmed'
    },
    reservationDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    created_by_ip: {
      type: DataTypes.STRING,
      allowNull: true
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'Reservation',
    hooks: {
      afterCreate: async (reservation, options) => {
        const program = await reservation.getProgram();
        await program.update({
          remainingCapacity: program.remainingCapacity - 1
        });
      },
      afterUpdate: async (reservation, options) => {
        if (reservation.changed('reservationStatus') && reservation.reservationStatus === 'cancelled') {
          const program = await reservation.getProgram();
          await program.update({
            remainingCapacity: program.remainingCapacity + 1
          });
        }
      }
    }
  });

  return Reservation;
}; 