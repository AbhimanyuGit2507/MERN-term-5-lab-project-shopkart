const express = require("express");
const router = express.Router();
const orderController = require("../controllers/order.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.use(authMiddleware);

router.post("/create-payment-order", orderController.createPaymentOrder);
router.post("/verify-payment", orderController.verifyPayment);
router.get("/", orderController.getOrders);
router.get("/:id", orderController.getOrderById);
router.patch("/:id/status", orderController.updateOrderStatus);

module.exports = router;
