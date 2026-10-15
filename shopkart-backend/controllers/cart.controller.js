const Customer = require("../models/customer.model");
const Product = require("../models/product.model");

exports.addToCart = async (req, res) => {
    try {
        const { productId } = req.params;
        const customer = await Customer.findById(req.user._id);
        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ success: false, message: "Product not found" });

        const cartItemIndex = customer.cart.findIndex(
            item => item.product && item.product.toString() === productId
        );

        if (cartItemIndex > -1) {
            customer.cart[cartItemIndex].quantity += 1;
        } else {
            customer.cart.push({ product: productId, quantity: 1 });
        }
        await customer.save();
        
        const updatedCustomer = await Customer.findById(req.user._id).populate('cart.product');
        const validCart = (updatedCustomer.cart || []).filter(item => item.product != null);

        res.status(200).json({ success: true, message: "Added to cart", cart: validCart });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.getCart = async (req, res) => {
    try {
        const customer = await Customer.findById(req.user._id).populate('cart.product');
        // Filter out any stale/deleted products
        const validCart = (customer.cart || []).filter(item => item.product != null);
        
        // If there were stale products, persist the cleaned cart
        if (validCart.length !== customer.cart.length) {
            customer.cart = validCart.map(item => ({ product: item.product._id, quantity: item.quantity }));
            await customer.save();
        }

        res.status(200).json({ success: true, cart: validCart });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.removeFromCart = async (req, res) => {
    try {
        const { productId } = req.params;
        const customer = await Customer.findById(req.user._id);

        customer.cart = customer.cart.filter(
            item => item.product && item.product.toString() !== productId
        );
        await customer.save();

        const updatedCustomer = await Customer.findById(req.user._id).populate('cart.product');
        const validCart = (updatedCustomer.cart || []).filter(item => item.product != null);

        res.status(200).json({ success: true, message: "Item removed from cart", cart: validCart });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.updateCartQuantity = async (req, res) => {
    try {
        const { productId } = req.params;
        const { quantity } = req.body;

        const customer = await Customer.findById(req.user._id);
        const cartItemIndex = customer.cart.findIndex(
            item => item.product && item.product.toString() === productId
        );

        if (cartItemIndex === -1) {
            return res.status(404).json({ success: false, message: "Item not in cart" });
        }

        const newQty = parseInt(quantity, 10);
        if (isNaN(newQty) || newQty <= 0) {
            // Remove item if quantity is 0 or negative
            customer.cart.splice(cartItemIndex, 1);
        } else {
            // Validate against stock
            const product = await Product.findById(productId);
            if (product && newQty > product.stock) {
                return res.status(400).json({
                    success: false,
                    message: `Only ${product.stock} units available for ${product.name}`
                });
            }
            customer.cart[cartItemIndex].quantity = newQty;
        }

        await customer.save();

        const updatedCustomer = await Customer.findById(req.user._id).populate('cart.product');
        const validCart = (updatedCustomer.cart || []).filter(item => item.product != null);

        res.status(200).json({ success: true, message: "Cart updated", cart: validCart });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.clearCart = async (req, res) => {
    try {
        const customer = await Customer.findById(req.user._id);
        customer.cart = [];
        await customer.save();
        res.status(200).json({ success: true, message: "Cart cleared", cart: [] });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};
