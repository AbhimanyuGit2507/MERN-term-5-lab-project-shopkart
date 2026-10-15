const Customer = require("../models/customer.model");
const Product = require("../models/product.model");

exports.addToCart = async (req, res) => {
    try {
        const { productId } = req.params;
        const customer = await Customer.findById(req.user._id);
        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ success: false, message: "Product not found" });

        const cartItemIndex = customer.cart.findIndex(item => item.product.toString() === productId);
        if (cartItemIndex > -1) {
            customer.cart[cartItemIndex].quantity += 1;
        } else {
            customer.cart.push({ product: productId, quantity: 1 });
        }
        await customer.save();
        res.status(200).json({ success: true, message: "Added to cart", cart: customer.cart });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.getCart = async (req, res) => {
    try {
        const customer = await Customer.findById(req.user._id).populate('cart.product');
        res.status(200).json({ success: true, cart: customer.cart });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.clearCart = async (req, res) => {
    try {
        const customer = await Customer.findById(req.user._id);
        customer.cart = [];
        await customer.save();
        res.status(200).json({ success: true, message: "Cart cleared" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};
