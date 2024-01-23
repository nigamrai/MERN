import express from "express";
import { miscellaneousController } from "../controllers";
import { isLoggedIn } from "../middlewares/auth.middleware";
const router=express.Router();
router.post("/",miscellaneousController.contactUs);
router.get("/admin/stats/users",isLoggedIn,miscellaneousController.getStats);
export default router;