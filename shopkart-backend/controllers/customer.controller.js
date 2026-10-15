const bcrypt = require("bcrypt");
const Customer = require("../models/customer.model");
const generateToken = require("../utils/generateToken");

const registerCustomer = async (req,res)=>{
    try {
        const {fullName,email,password,phone} = req.body;

        if (!fullName || !email || !password || !phone) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success:false,
                message:"Password must be at least 6 characters long",
            });
        }
        
        const existingCustomer = await Customer.findOne({email:email});
        
        if (existingCustomer){
            return res.status(400).json({
                success:false,
                message:"Email already exists",
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        const customer = await Customer.create({
            fullName,
            email,
            password:hashedPassword,
            phone,
        }); 

        return res.status(201).json({
            success:true,
            message:"Customer registered successfully",
            customer,   
        });

    } catch (error) {
        console.error("Error during customer registration:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

const loginCustomer = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const customer = await Customer.findOne({ email });

    if (!customer) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      customer.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = generateToken(customer._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const getMyProfile = async (req, res) => {
  return res.status(200).json(req.user);
};

const logoutCustomer = async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  });

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

module.exports = {
  registerCustomer,
  loginCustomer,
  getMyProfile,
  logoutCustomer
};