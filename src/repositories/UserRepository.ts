import { Types } from "mongoose";
import { User, IUserDocument } from "../models/User";

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role?: string;
  interests?: string[];
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  password?: string;
  role?: string;
  interests?: string[];
}

export interface InterestGroup {
  interest: string;
  userCount: number;
  users: IUserDocument[];
}

export interface UserWithPosts {
  _id: Types.ObjectId;
  name: string;
  email: string;
  role: string;
  interests: string[];
  createdAt: Date;
  updatedAt: Date;
  posts: unknown[];
}

export const UserRepository = {
  async findByEmail(email: string): Promise<IUserDocument | null> {
    return User.findOne({ email }).select("+password");
  },

  async findById(id: string | Types.ObjectId): Promise<IUserDocument | null> {
    return User.findById(id);
  },

  async isEmailTaken(
    email: string,
    excludeId?: string | Types.ObjectId
  ): Promise<boolean> {
    return User.isEmailTaken(email, excludeId as Types.ObjectId | undefined);
  },

  async create(data: CreateUserData): Promise<IUserDocument> {
    return User.create(data);
  },

  async update(
    id: string | Types.ObjectId,
    data: UpdateUserData
  ): Promise<IUserDocument | null> {
    return User.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  },

  async delete(id: string | Types.ObjectId): Promise<IUserDocument | null> {
    return User.findByIdAndDelete(id);
  },

  async list(
    filter: Record<string, unknown>,
    skip: number,
    limit: number,
    sort: Record<string, 1 | -1>
  ): Promise<IUserDocument[]> {
    return User.find(filter).sort(sort).skip(skip).limit(limit);
  },

  async count(filter: Record<string, unknown>): Promise<number> {
    return User.countDocuments(filter);
  },

  /**
   * Aggregation: group users by interest.
   * Exactly ONE aggregate() call. No find/findOne/countDocuments/distinct/populate.
   * Passwords excluded via projection (never exposed).
   */
  async groupUsersByInterests(): Promise<InterestGroup[]> {
    const result = await User.aggregate([
      { $unwind: "$interests" },
      {
        $group: {
          _id: "$interests",
          users: {
            $push: {
              _id: "$_id",
              name: "$name",
              email: "$email",
              role: "$role",
              interests: "$interests",
              createdAt: "$createdAt",
              updatedAt: "$updatedAt",
            },
          },
          userCount: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          interest: "$_id",
          userCount: 1,
          users: 1,
        },
      },
      { $sort: { interest: 1 } },
    ]);
    return result;
  },

  /**
   * Aggregation: retrieve a user with their posts via $lookup.
   * Exactly ONE aggregate() call containing a $lookup stage.
   * Passwords excluded.
   */
  async findUserWithPosts(userId: Types.ObjectId): Promise<UserWithPosts[]> {
    const result = await User.aggregate([
      { $match: { _id: userId } },
      {
        $lookup: {
          from: "posts",
          localField: "_id",
          foreignField: "userId",
          as: "posts",
        },
      },
      {
        $project: {
          name: 1,
          email: 1,
          role: 1,
          interests: 1,
          createdAt: 1,
          updatedAt: 1,
          posts: {
            $map: {
              input: "$posts",
              as: "post",
              in: {
                _id: "$$post._id",
                userId: "$$post.userId",
                title: "$$post.title",
                content: "$$post.content",
                createdAt: "$$post.createdAt",
                updatedAt: "$$post.updatedAt",
              },
            },
          },
        },
      },
    ]);
    return result;
  },
};
