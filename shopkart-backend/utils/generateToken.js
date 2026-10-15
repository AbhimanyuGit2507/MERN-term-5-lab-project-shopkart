const jwt = require("jsonwebtoken");

const generateToken = (customerId) => {
  return jwt.sign(
    {
      userId: customerId,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    }
  );
};

module.exports = generateToken;