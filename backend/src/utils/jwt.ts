import jwt from "jsonwebtoken";
import { env } from "../config/env";

export function generateToken(
  id: string,
  email: string,
  role: string
) {
  return jwt.sign(
    {
      id,
      email,
      role,
    },
    env.jwtSecret,
    {
      expiresIn: "7d",
    }
  );
}