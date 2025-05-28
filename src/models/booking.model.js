const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Booking extends Model {
    static associate(models) {
      Booking.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });
      Booking.belongsTo(models.Event, {
        foreignKey: 'eventId',
        as: 'event'
      });
    }
  }

  Booking.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    eventId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Events',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.ENUM('confirmed', 'cancelled'),
      defaultValue: 'confirmed'
    },
    booking_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'Booking',
    hooks: {
      afterCreate: async (booking, options) => {
        const event = await booking.getEvent();
        await event.update({
          available_seats: event.available_seats - 1
        });
      },
      afterUpdate: async (booking, options) => {
        if (booking.changed('status') && booking.status === 'cancelled') {
          const event = await booking.getEvent();
          await event.update({
            available_seats: event.available_seats + 1
          });
        }
      }
    }
  });

  return Booking;
}; 