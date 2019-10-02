const mongoose = require("mongoose"),
  Schema = mongoose.Schema;

const option = {
  toObject: {
    transform: function(doc, ret, game) {
      delete ret.__v;
    }
  },
  toJSON: {
    transform: function(doc, ret, game) {
      delete ret.__v;
    }
  }
};

const user = new Schema(
  {
    username: { type: String, unique: true }
  },
  option
);

module.exports.User = mongoose.model("User", user);

const exercise = new Schema(
  {
    userId: String,
    description: String,
    duration: Number,
    date: Date
  },
  option
);

module.exports.Exercise = mongoose.model("Exercise", exercise);
