import express from "express";
import { paymentController } from "../controllers";

import { isLoggedIn,authorizedRoles } from "../middlewares/auth.middleware";
const router = express.Router();

router.route("/razorpay-key").get(isLoggedIn,paymentController.getRazorpayApiKey);
router.route("/subscribe").post(isLoggedIn,paymentController.buySubscription);
router.route("/verify").post(isLoggedIn,paymentController.verifySubscription);
router.route("/unsubscribe").post(isLoggedIn,paymentController.cancelSubscription);
// router.route("/").get(isLoggedIn,authorizedRoles("ADMIN"),paymentController.getAllPayments);
export default router;
    