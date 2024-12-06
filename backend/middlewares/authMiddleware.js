import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
    console.log("Token received in headers:", token);

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Decoded token:", decoded);
      if (!decoded) {
        return res
          .status(401)
          .json({ message: "Unauthorized - Invalid token" });
      }

      req.userId = decoded.userId;
      next();
    } catch (error) {
      console.error("Token verification error:", error.message);
      res.status(500).json({ message: "Server Error" });
    }
  } else {
    res.status(401).json({ message: "Unauthorized - No token" });
  }
};
