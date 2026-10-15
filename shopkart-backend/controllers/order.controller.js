const Order = require("../models/order.model");
const Customer = require("../models/customer.model");
const Product = require("../models/product.model");
const razorpay = require("../config/razorpay");
const crypto = require("crypto");

exports.createPaymentOrder = async (req, res) => {
    try {
        const { shippingAddress } = req.body;
        const customer = await Customer.findById(req.user._id).populate('cart.product');

        if (!customer.cart || customer.cart.length === 0) {
            return res.status(400).json({ success: false, message: "Cart is empty" });
        }

        let totalAmount = 0;
        const orderItems = [];

        // Validate stock and price server-side
        for (const item of customer.cart) {
            const dbProduct = await Product.findById(item.product._id);
            if (!dbProduct) {
                return res.status(404).json({ success: false, message: `Product ${item.product.name} not found` });
            }
            if (dbProduct.stock < item.quantity) {
                return res.status(400).json({ success: false, message: `Insufficient stock for ${dbProduct.name}` });
            }
            
            totalAmount += dbProduct.price * item.quantity;
            orderItems.push({
                product: dbProduct._id,
                name: dbProduct.name,
                price: dbProduct.price,
                quantity: item.quantity,
                image: dbProduct.image
            });
        }

        // Create pending ShopKart order
        const order = new Order({
            user: customer._id,
            items: orderItems,
            shippingAddress,
            totalAmount,
            status: "PENDING_PAYMENT",
            paymentStatus: "PENDING"
        });

        // Create Razorpay order
        const amountInPaise = Math.round(totalAmount * 100);
        const rzpOrder = await razorpay.orders.create({
            amount: amountInPaise,
            currency: "INR",
            receipt: order._id.toString()
        });

        order.razorpayOrderId = rzpOrder.id;
        await order.save();

        res.status(200).json({
            success: true,
            shopKartOrderId: order._id,
            razorpayOrderId: rzpOrder.id,
            amount: amountInPaise,
            currency: "INR",
            key: process.env.RAZORPAY_KEY_ID || 'rzp_test_xxxxxxxxx'
        });

    } catch (error) {
        console.error("Order creation failed:", error);
        res.status(500).json({ success: false, message: "Order creation failed" });
    }
};

exports.verifyPayment = async (req, res) => {
    try {
        const { shopKartOrderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        
        const order = await Order.findById(shopKartOrderId);
        if (!order || order.user.toString() !== req.user._id.toString()) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        const body = order.razorpayOrderId + "|" + razorpay_payment_id;
        const secret = process.env.RAZORPAY_KEY_SECRET || 'xxxxxxxxxxxxxxxx';
        const expectedSignature = crypto.createHmac("sha256", secret).update(body).digest("hex");

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ success: false, message: "Invalid payment signature" });
        }

        order.paymentStatus = "PAID";
        order.status = "PLACED";
        order.razorpayPaymentId = razorpay_payment_id;
        await order.save();

        const customer = await Customer.findById(req.user._id);
        customer.cart = [];
        await customer.save();

        res.status(200).json({ success: true, message: "Payment verified, order placed", order });

    } catch (error) {
        console.error("Payment verification failed:", error);
        res.status(500).json({ success: false, message: "Payment verification failed" });
    }
};

exports.getOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, orders });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch orders" });
    }
};

exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order || order.user.toString() !== req.user._id.toString()) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }
        res.status(200).json({ success: true, order });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};
