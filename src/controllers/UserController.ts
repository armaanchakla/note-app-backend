import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { successResponse } from "../utils/ApiResponse";
import { UserService } from "../services/UserService";
import { normalizePagination } from "../utils/pagination";
import { BadRequestError } from "../utils/AppError";

function parseObjectId(value: string, name: string): string {
  if (!/^[a-fA-F0-9]{24}$/.test(value)) {
    throw new BadRequestError("INVALID_ID", `Invalid ${name}`);
  }
  return value;
}

export const UserController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const user = await UserService.createUser(req.body);
    return successResponse(res, user, 201);
  }),

  list: asyncHandler(async (req: Request, res: Response) => {
    const { page, limit } = normalizePagination(req.query.page, req.query.limit);
    const result = await UserService.listUsers(page, limit);
    return successResponse(res, result.data, 200, result.pagination);
  }),

  get: asyncHandler(async (req: Request, res: Response) => {
    const id = parseObjectId(req.params.id, "user id");
    const user = await UserService.getUser(id);
    return successResponse(res, user);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const id = parseObjectId(req.params.id, "user id");
    const user = await UserService.updateUser(id, req.body);
    return successResponse(res, user);
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    const id = parseObjectId(req.params.id, "user id");
    await UserService.deleteUser(id);
    return successResponse(res, { message: "User deleted" });
  }),

  interests: asyncHandler(async (_req: Request, res: Response) => {
    const groups = await UserService.groupUsersByInterests();
    return successResponse(res, groups);
  }),

  userPosts: asyncHandler(async (req: Request, res: Response) => {
    const userId = parseObjectId(req.params.userId, "user id");
    const result = await UserService.getUserWithPosts(userId);
    return successResponse(res, result);
  }),
};
