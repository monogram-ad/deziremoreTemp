import bcrypt from "bcrypt";
import prisma from "../lib/prisma";
import { generateToken } from "../utils/jwt";

export class AuthService {
  static async register(data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }) {
    const existingUser =
      await prisma.user.findFirst({
        where: {
          OR: [
            { email: data.email },
            ...(data.phone ? [{ phone: data.phone }] : []),
          ],
        },
      });

    if (existingUser) {
      if (existingUser.email === data.email) {
        throw new Error("An account with this email already exists");
      }
      throw new Error("An account with this phone number already exists");
    }

    const passwordHash =
      await bcrypt.hash(
        data.password,
        10
      );

    const user =
      await prisma.user.create({
        data: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          passwordHash,
        },
      });

    const token = generateToken(
      user.id,
      user.email,
      user.role
    );

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      token,
    };
  }

  static async login(
    email: string,
    password: string
  ) {
    const user =
      await prisma.user.findUnique({
        where: { email },
      });

    if (!user) {
      throw new Error(
        "Invalid credentials"
      );
    }

    const validPassword =
      await bcrypt.compare(
        password,
        user.passwordHash
      );

    if (!validPassword) {
      throw new Error(
        "Invalid credentials"
      );
    }

    const token = generateToken(
      user.id,
      user.email,
      user.role
    );

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      token,
    };
  }

  static async getUser(
    userId: string
  ) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });
  }

  static async updateProfile(
    userId: string,
    data: { name?: string; phone?: string }
  ) {
    if (data.phone) {
      const existing = await prisma.user.findFirst({
        where: { phone: data.phone, NOT: { id: userId } },
      });
      if (existing) {
        throw new Error("An account with this phone number already exists");
      }
    }

    return prisma.user.update({
      where: { id: userId },
      data,
      select: { id: true, name: true, email: true, phone: true, role: true },
    });
  }

  static async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("User not found");

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) throw new Error("Current password is incorrect");

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
  }
}