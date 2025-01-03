const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

const SALT_FACTOR = 10;

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true
    },
    company: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true
    },
    admin: {
      type: Boolean,
      required: true,
      default: false
    },
    active: {
      type: Boolean,
      required: true,
      default: false
    },
    pagesBalance: {
      type: Number,
      required: false,
      default: 0
    },
  },
  {
    timestamps: true
  }
);

UserSchema.pre('save', function (next) {
  const user = this;

  if (!user.isModified('password')) return next();

  bcrypt.genSalt(SALT_FACTOR, function (err, salt) {
    if (err) return next(err);

    bcrypt.hash(user.password, salt, function (err, hash) {
      if (err) return next(err);

      user.password = hash;
      next();
    });
  });
});

UserSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword || '', this.password);
};

UserSchema.methods.getJWTToken = function () {
  const payload = this.toObject();
  delete payload.password;
  const token = jwt.sign(payload, process.env.SECRET_TOKEN, { expiresIn: process.env.JWT_EXPIRATION_TIME });
  return token;
};

UserSchema.plugin(mongoosePaginate);
module.exports = mongoose.model("User", UserSchema);