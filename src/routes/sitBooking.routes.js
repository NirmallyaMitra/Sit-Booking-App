import {Router} from "express";
import sitModel from "../models/sits.model.js";

const router = Router();

router.get("/addSit", (req, res) => {
  
  const {sitno} = req.body;

  const sit = sitModel.create({
    sitno
  });
  
  res.status(201).json({
    message: "Sit Created"
  });
})

export default router;