import mongoose from "mongoose";

const sitSchema = new mongoose.Schema({
  sitno: {
    type: String,
    required: [true, "Sit number is required."]
  },
  sitStatus:{
    type: Boolean,
    required: [true, "Status is required."],
    default: "AVAILABLE"
  }
});

const sitModel = mongoose.model("sitarrangement", sitSchema);

export default sitModel;