const { Model, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  class Attendee extends Model {
    static associate(models) {
      Attendee.hasMany(models.Reservation, {
        foreignKey: 'attendeeId',
        as: 'reservations'
      });
    }

    async comparePassword(candidatePassword) {
      return bcrypt.compare(candidatePassword, this.password);
    }
  }

  Attendee.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM('attendee', 'admin'),
      defaultValue: 'attendee'
    },
    created_by_ip: {
      type: DataTypes.STRING,
      allowNull: true
    },
    last_login_ip: {
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
    modelName: 'Attendee',
    hooks: {
      beforeCreate: async (attendee) => {
        if (attendee.password) {
          const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_SALT_ROUNDS));
          attendee.password = await bcrypt.hash(attendee.password, salt);
        }
      },
      beforeUpdate: async (attendee) => {
        if (attendee.changed('password')) {
          const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_SALT_ROUNDS));
          attendee.password = await bcrypt.hash(attendee.password, salt);
        }
      }
    }
  });

  return Attendee;
}; 