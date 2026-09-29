import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  sitno:{
    type: String,
    required: [true, "Sitno is required."]
  },
  userId:{
    type: String,
    required: [true, "User Id required."]
  }
});

const bookingModel = mongoose.model("bookings", bookingSchema);

export default bookingModel;