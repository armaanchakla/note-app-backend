import { UserRepository } from "../repositories/UserRepository";
import { signToken } from "../utils/jwt";
import { Role } from "../types/roles";
import { UnauthorizedError, ConflictError } from "../utils/AppError";
import { IUserDocument } from "../models/User";

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  interests?: string[];
}

export interface AuthResult {
  token: string;
  user: IUserDocument;
}

export const AuthService = {
  async register(payload: RegisterPayload): Promise<AuthResult> {
    const emailTaken = await UserRepository.isEmailTaken(payload.email);
    if (emailTaken) {
      throw new ConflictError("EMAIL_TAKEN", "Email is already registered");
    }

    const user = await UserRepository.create({
      name: payload.name,
      email: payload.email,
      password: payload.password,
      role: Role.USER,
      interests: payload.interests,
    });

    const token = signToken(user._id.toString(), user.role);
    return { token, user };
  },

  async login(email: string, password: string): Promise<AuthResult> {
    const user = await UserRepository.findByEmail(email);

    console.log("LOGIN DEBUG", {
      email,
      userFound: !!user,
      userId: user?._id?.toString(),
      userEmail: user?.email,
      hasPassword: !!user?.password,
      passwordLength: user?.password?.length,
    });

    if (!user) {
      throw new UnauthorizedError("INVALID_CREDENTIALS", "Invalid credentials");
    }

    const passwordMatches = await user.comparePassword(password);

    console.log("PASSWORD DEBUG", {
      passwordMatches,
    });

    if (!passwordMatches) {
      throw new UnauthorizedError("INVALID_CREDENTIALS", "Invalid credentials");
    }

    const token = signToken(user._id.toString(), user.role);
    return { token, user };
  },

  async me(userId: string): Promise<IUserDocument | null> {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedError("USER_NOT_FOUND", "User no longer exists");
    }
    return user;
  },
};
