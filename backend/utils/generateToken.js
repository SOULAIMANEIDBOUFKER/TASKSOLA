import jwt from "jsonwebtoken";

const generateToken = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  const isProduction = process.env.NODE_ENV === "production";

  res.cookie("jwt", token, {
    httpOnly: true,
    secure: isProduction,           // true on https
    sameSite: isProduction ? "None" : "Lax",
    path: "/",
    maxAge: 24 * 60 * 60 * 1000,
  });

  return token;
};

export default generateToken;
