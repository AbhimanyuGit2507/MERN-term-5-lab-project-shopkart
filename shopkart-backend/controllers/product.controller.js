const Product = require("../models/product.model");

const getProducts = async (req, res) => {
    try {
        let products = await Product.find();
        
        // Auto-seed if empty for lab testing purposes
        if (products.length === 0) {
            const seed = [
                { name: "Mechanical Keyboard", price: 2999, category: "Electronics", image: "https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=400", stock: 10 },
                { name: "Wireless Mouse", price: 1500, category: "Electronics", image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&q=80&w=400", stock: 25 },
                { name: "Desk Mat", price: 800, category: "Accessories", image: "https://images.unsplash.com/photo-1628102491629-778571d893a3?auto=format&fit=crop&q=80&w=400", stock: 50 },
                { name: "Laptop Stand", price: 1200, category: "Accessories", image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&q=80&w=400", stock: 15 }
            ];
            await Product.insertMany(seed);
            products = await Product.find();
        }

        res.status(200).json({ success: true, products });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};

module.exports = { getProducts };
