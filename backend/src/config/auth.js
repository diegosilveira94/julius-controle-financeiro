import dotenv from "dotenv";
dotenv.config();

const secret = process.env.JWT_SECRET;

if (!secret || secret.length < 32) {
  throw new Error("JWT_SECRET must be set with at least 32 characters.");
}

export default {
  jwt: {
    secret,
    algorithm: "HS256",
    expiresIn: process.env.JWT_EXPIRES_IN || "15m",
  },
  session: {
    cookieName: "refreshToken",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
};
