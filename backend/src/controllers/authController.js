import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json({ message: "Email already in use" });
  }

  const user = await User.create({ name, email, password });
  return res.status(201).json({
    message: "Registration successful",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin
    },
    token: generateToken(user._id)
  });
};

export const registerAdmin = async (req, res) => {
  const { name, email, password, adminKey } = req.body;

  if (!process.env.ADMIN_REGISTRATION_KEY) {
    return res.status(500).json({ message: "Admin registration is not configured" });
  }

  if (adminKey !== process.env.ADMIN_REGISTRATION_KEY) {
    return res.status(403).json({ message: "Invalid admin registration key" });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json({ message: "Email already in use" });
  }

  const user = await User.create({ name, email, password, isAdmin: true });
  return res.status(201).json({
    message: "Admin registration successful",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin
    },
    token: generateToken(user._id)
  });
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  if (user.isAdmin) {
    return res.status(403).json({ message: "Admin must login via /admin/login" });
  }

  return res.json({
    message: "Login successful",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin
    },
    token: generateToken(user._id)
  });
};

export const loginAdmin = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  if (!user.isAdmin) {
    return res.status(403).json({ message: "Only admins can login via /admin/login" });
  }

  return res.json({
    message: "Login successful",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin
    },
    token: generateToken(user._id)
  });
};

export const getMyProfile = async (req, res) => {
  return res.json({ user: req.user });
};
