import { Types } from "mongoose";
import { PostRepository } from "../repositories/PostRepository";
import { buildPagination, normalizePagination } from "../utils/pagination";
import { PaginationResult } from "../utils/pagination";
import { IPostDocument } from "../models/Post";

export interface CreatePostInput {
  title: string;
  content: string;
}

export const PostService = {
  async createPost(actorUserId: string, input: CreatePostInput): Promise<IPostDocument> {
    return PostRepository.create({
      userId: new Types.ObjectId(actorUserId),
      title: input.title,
      content: input.content,
    });
  },

  async listAllPosts(
    page: number,
    limit: number
  ): Promise<PaginationResult<IPostDocument>> {
    const normalized = normalizePagination(page, limit);
    const [posts, total] = await Promise.all([
      PostRepository.list((normalized.page - 1) * normalized.limit, normalized.limit),
      PostRepository.count(),
    ]);

    return {
      data: posts,
      pagination: buildPagination(normalized.page, normalized.limit, total),
    };
  },
};
