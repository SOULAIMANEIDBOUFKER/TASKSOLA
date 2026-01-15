import userModel from "../models/User.js";
import bcrypt from "bcryptjs";
import asyncHandler from "../middlewares/asyncHandler.js";
import generateToken from "../utils/generateToken.js";
import jwt from "jsonwebtoken";

/**
 * @desc    Register new user
 * @route   POST /api/v1/user/signup
 * @access  Public
 */
const signupUser = asyncHandler(async (req, res) => {
  const { firstname, lastname, email, password } = req.body;

  if (!firstname || !lastname || !email || !password) {
    res.status(400);
    throw new Error("Please fill all the fields");
  }

  const existUser = await userModel.findOne({ email });
  if (existUser) {
    res.status(400);
    throw new Error("User already exists");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = new userModel({
    firstname,
    lastname,
    email,
    password: hashedPassword,
  });

  await newUser.save();

  // 🔐 Set JWT cookie
  generateToken(res, newUser._id);

  res.status(201).json({
    success: true,
    _id: newUser._id,
    firstname: newUser.firstname,
    lastname: newUser.lastname,
    email: newUser.email,
  });
});

/**
 * @desc    Login user
 * @route   POST /api/v1/user/login
 * @access  Public
 */
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const existingUser = await userModel.findOne({ email });

  if (!existingUser) {
    res.status(404);
    throw new Error("User not found");
  }

  const isPasswordValid = await bcrypt.compare(
    password,
    existingUser.password
  );

  if (!isPasswordValid) {
    res.status(401);
    throw new Error("Invalid password");
  }

  // 🔐 Set JWT cookie
  generateToken(res, existingUser._id);

  res.status(200).json({
    _id: existingUser._id,
    firstname: existingUser.firstname,
    lastname: existingUser.lastname,
    email: existingUser.email,
  });
});

/**
 * @desc    Logout user
 * @route   POST /api/v1/user/logout
 * @access  Private
 */
const logoutUser = asyncHandler(async (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  });

  res.status(200).json({ message: "Logged out successfully" });
});

/**
 * @desc    Google OAuth login/register
 * @route   POST /api/v1/user/google
 * @access  Public
 */
const google = asyncHandler(async (req, res) => {
  const { name, email, googlePhotoUrl } = req.body;

  let user = await userModel.findOne({ email });

  // =========================
  // User already exists
  // =========================
  if (user) {
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    const { password, ...rest } = user._doc;

    res
      .status(200)
      .cookie("jwt", token, {
        httpOnly: true,
        secure: true,          // HTTPS (Koyeb)
        sameSite: "None",      // Cross-domain (Vercel ↔ Koyeb)
        path: "/",
        maxAge: 24 * 60 * 60 * 1000,
      })
      .json(rest);

    return;
  }

  // =========================
  // Create new user
  // =========================
  const generatedPassword =
    Math.random().toString(36).slice(-8) +
    Math.random().toString(36).slice(-8);

  const hashedPassword = bcrypt.hashSync(generatedPassword, 10);

  const newUser = new userModel({
    firstname: name,
    lastname: name,
    email,
    profilePicture: googlePhotoUrl,
    password: hashedPassword,
  });

  await newUser.save();

  const token = jwt.sign(
    { userId: newUser._id },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  const { password, ...rest } = newUser._doc;

  res
    .status(200)
    .cookie("jwt", token, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      path: "/",
      maxAge: 24 * 60 * 60 * 1000,
    })
    .json(rest);
});

export { signupUser, loginUser, logoutUser, google };
