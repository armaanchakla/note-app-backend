import { Types } from "mongoose";
import {
  UserRepository,
  InterestGroup,
  UserWithPosts,
} from "../repositories/UserRepository";
import { NotFoundError, ConflictError, BadRequestError } from "../utils/AppError";
import { buildPagination, normalizePagination } from "../utils/pagination";
import { PaginationResult } from "../utils/pagination";
import { IUserDocument } from "../models/User";

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  role?: string;
  interests?: string[];
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  password?: string;
  role?: string;
  interests?: string[];
}

export const UserService = {
  async createUser(payload: CreateUserPayload): Promise<IUserDocument> {
    const emailTaken = await UserRepository.isEmailTaken(payload.email);
    if (emailTaken) {
      throw new ConflictError("EMAIL_TAKEN", "Email is already registered");
    }
    return UserRepository.create(payload);
  },

  async listUsers(page: number, limit: number): Promise<PaginationResult<IUserDocument>> {
    const normalized = normalizePagination(page, limit);
    const sort = { createdAt: -1 as const };
    const [users, total] = await Promise.all([
      UserRepository.list(
        {},
        (normalized.page - 1) * normalized.limit,
        normalized.limit,
        sort
      ),
      UserRepository.count({}),
    ]);
    return {
      data: users,
      pagination: buildPagination(normalized.page, normalized.limit, total),
    };
  },

  async getUser(id: string): Promise<IUserDocument> {
    const user = await UserRepository.findById(id);
    if (!user) {
      throw new NotFoundError("USER_NOT_FOUND", "User not found");
    }
    return user;
  },

  async updateUser(id: string, payload: UpdateUserPayload): Promise<IUserDocument> {
    const user = await UserRepository.findById(id);
    if (!user) {
      throw new NotFoundError("USER_NOT_FOUND", "User not found");
    }

    if (payload.email) {
      const emailTaken = await UserRepository.isEmailTaken(payload.email, id);
      if (emailTaken) {
        throw new ConflictError("EMAIL_TAKEN", "Email is already registered");
      }
    }

    const updated = await UserRepository.update(id, payload);
    if (!updated) {
      throw new NotFoundError("USER_NOT_FOUND", "User not found");
    }
    return updated;
  },

  async deleteUser(id: string): Promise<void> {
    const user = await UserRepository.findById(id);
    if (!user) {
      throw new NotFoundError("USER_NOT_FOUND", "User not found");
    }
    await UserRepository.delete(id);
  },

  /**
   * Admin-only: group users by interest via aggregation.
   */
  async groupUsersByInterests(): Promise<InterestGroup[]> {
    return UserRepository.groupUsersByInterests();
  },

  /**
   * Retrieve a user plus their posts via a single $lookup aggregation.
   */
  async getUserWithPosts(userId: string): Promise<UserWithPosts> {
    let objectId: Types.ObjectId;
    try {
      objectId = new Types.ObjectId(userId);
    } catch {
      throw new BadRequestError("INVALID_ID", "Invalid user id");
    }

    const [result] = await UserRepository.findUserWithPosts(objectId);
    if (!result) {
      throw new NotFoundError("USER_NOT_FOUND", "User not found");
    }
    return result;
  },
};
