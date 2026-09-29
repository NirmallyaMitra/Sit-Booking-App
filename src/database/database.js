import mongoose from "mongoose";

const connectDB = async ()=>{
  await mongoose.connect("mongodb+srv://nirmallyamitraforwork_db_user:fQPERBxP4fKYmBAU@seat-booking-cluster.7gn2e4x.mongodb.net/?appName=seat-booking-cluster");
  console.log("DB Connected.");
}

export default connectDB;