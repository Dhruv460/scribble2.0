import mongoose from "mongoose";
import User from "../models/user";
import bcrypt from "bcrypt";
import { generateToken } from "../middleware/authMiddleware.js";
import cloudinary from "../config/cloudinary.js";
import Token from "../models/token.js";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";

export const registerUser = async (req, res) => {
  const { username, email, password } = req.body;
  console.log("Registering user with socketId:", socketId);
  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      username,
      email,
      password: hashedPassword,
    });
    await user.save();

    const token = await new Token({
      userId: user._id,
      token: crypto.randomBytes(32).toString("hex"),
    }).save();
    console.log(`token while registering is : ${token}`);
    const url = `${process.env.BASE_URL}/users/${user.id}/verify/${token.token}`;
    await sendEmail(user.email, "Verify Email", url);

    res.status(201).json({
      message: user._id,
      avatar: user.avatar,
      mssg: "An Email sent to your account please verify",
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    if (!user.verified) {
      let token = await Token.findOne({ userId: user._id });
      if (!token) {
        token = await new Token({
          userId: user._id,
          token: crypto.randomBytes(32).toString("hex"),
        }).save();
        const url = `${process.env.BASE_URL}users/${user.id}/verify/${token.token}`;
        await sendEmail(user.email, "Verify Email", url);
      }

      return res
        .status(400)
        .send({ message: "An Email sent to your account please verify" });
    }

    const token = generateToken(user._id);

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const emailVerification = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id });
    console.log(`email verify user is :${user}`);
    if (!user)
      return res
        .status(400)
        .send({ message: "Invalid link due to absence of user " });

    const token = await Token.findOne({
      userId: user._id,
      token: req.params.token,
    });
    console.log(`email verify token is :${token}`);
    if (!token)
      return res
        .status(400)
        .send({ message: "Invalid link due to absence of token " });

    user.verified = true;
    await user.save();

    // await Token.deleteOne({ _id: token._id });

    res.status(200).send({ message: "Email verified successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal Server Error! well that sucks" });
  }
};
