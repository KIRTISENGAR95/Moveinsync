const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Program extends Model {
    static associate(models) {
      Program.hasMany(models.Reservation, {
        foreignKey: 'programId',
        as: 'reservations'
      });
    }
  }

  Program.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    programTitle: {
      type: DataTypes.STRING,
      allowNull: false
    },
    programDescription: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    scheduledDateTime: {
      type: DataTypes.DATE,
      allowNull: false
    },
    venueLocation: {
      type: DataTypes.STRING,
      allowNull: false
    },
    totalCapacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1
      }
    },
    remainingCapacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0
      }
    },
    programStatus: {
      type: DataTypes.ENUM('active', 'cancelled', 'completed'),
      defaultValue: 'active'
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
    modelName: 'Program',
    hooks: {
      beforeCreate: (program) => {
        if (!program.remainingCapacity) {
          program.remainingCapacity = program.totalCapacity;
        }
      }
    }
  });

  return Program;
}; 