import express from "express";
import sitBooking from "./controllers/sitBooking.controller.js";

const app = express();

app.use(express.json());
app.use("/api", sitBooking);

export default app;