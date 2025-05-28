const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Event extends Model {
    static associate(models) {
      Event.hasMany(models.Booking, {
        foreignKey: 'eventId',
        as: 'bookings'
      });
    }
  }

  Event.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    date_time: {
      type: DataTypes.DATE,
      allowNull: false
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false
    },
    total_seats: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1
      }
    },
    available_seats: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0
      }
    },
    status: {
      type: DataTypes.ENUM('active', 'cancelled', 'completed'),
      defaultValue: 'active'
    }
  }, {
    sequelize,
    modelName: 'Event',
    hooks: {
      beforeCreate: (event) => {
        if (!event.available_seats) {
          event.available_seats = event.total_seats;
        }
      }
    }
  });

  return Event;
}; 