const mongoose = require("mongoose");


const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      minlength: 4,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/\S+@\S+\.\S+/, "Please provide a valid email address"], // Simple email validation regex
    },
    password: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);



const UserModel = mongoose.model("User", userSchema);
module.exports = UserModel;
