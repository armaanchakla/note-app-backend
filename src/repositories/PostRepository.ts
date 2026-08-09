import { Types } from "mongoose";
import { Post, IPostDocument } from "../models/Post";

export interface CreatePostData {
  userId: Types.ObjectId;
  title: string;
  content: string;
}

export const PostRepository = {
  async create(data: CreatePostData): Promise<IPostDocument> {
    return Post.create(data);
  },

  /**
   * List all posts, newest first. The compound index
   * `{ userId: 1, createdAt: -1 }` covers sorts on createdAt.
   */
  async list(skip: number, limit: number): Promise<IPostDocument[]> {
    return Post.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit);
  },

  async count(): Promise<number> {
    return Post.countDocuments({});
  },
};
