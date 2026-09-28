import mongoose from "mongoose";

const connectDB = async ()=>{
  await mongoose.connect("mongodb://localhost:27017/sitBooking");
  console.log("DB Connected.");
}

export default connectDB;