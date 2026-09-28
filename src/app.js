import express from "express";
import sitBooking from "./routes/sitBooking.routes.js";

const app = express();


app.use(express.json());
app.use("/api", sitBooking);

export default app;