import {Router} from "express";
import sitModel from "../models/sits.model.js";

const router = Router();

router.get("/", (req, res) => {
  res.status(200).json({
    message: "Base Route"
  });
})

export default router;