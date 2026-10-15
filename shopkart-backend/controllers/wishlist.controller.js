const Customer = require("../models/customer.model");
const Product = require("../models/product.model");

const addToWishlist = async (req, res) => {
    try {
        const customerId = req.user._id;
        const { productId } = req.params;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        const customer = await Customer.findById(customerId);
        if (customer.wishlist.includes(productId)) {
            return res.status(409).json({ success: false, message: "Product already exists in wishlist" });
        }

        customer.wishlist.push(productId);
        await customer.save();

        return res.status(200).json({ success: true, message: "Product added to wishlist" });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ success: false, message: "Invalid product ID format" });
        }
        console.error("Error in addToWishlist:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const getWishlist = async (req, res) => {
    try {
        const customerId = req.user._id;
        const customer = await Customer.findById(customerId).populate({
            path: "wishlist",
            select: "name price category image stock"
        });

        return res.status(200).json({
            success: true,
            count: customer.wishlist.length,
            wishlist: customer.wishlist
        });
    } catch (error) {
        console.error("Error in getWishlist:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const removeFromWishlist = async (req, res) => {
    try {
        const customerId = req.user._id;
        const { productId } = req.params;

        const customer = await Customer.findById(customerId);
        if (!customer.wishlist.includes(productId)) {
            return res.status(404).json({ success: false, message: "Product is not in wishlist" });
        }

        customer.wishlist = customer.wishlist.filter(id => id.toString() !== productId);
        await customer.save();

        return res.status(200).json({ success: true, message: "Product removed from wishlist" });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ success: false, message: "Invalid product ID format" });
        }
        console.error("Error in removeFromWishlist:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

module.exports = {
    addToWishlist,
    getWishlist,
    removeFromWishlist
};
