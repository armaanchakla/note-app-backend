import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { successResponse } from "../utils/ApiResponse";
import { PostService } from "../services/PostService";
import { normalizePagination } from "../utils/pagination";

export const PostController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const post = await PostService.createPost(userId, req.body);
    return successResponse(res, post, 201);
  }),

  list: asyncHandler(async (req: Request, res: Response) => {
    const { page, limit } = normalizePagination(req.query.page, req.query.limit);
    const result = await PostService.listAllPosts(page, limit);
    return successResponse(res, result.data, 200, result.pagination);
  }),
};
