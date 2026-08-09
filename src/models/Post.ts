import { Schema, model, Types, Document } from "mongoose";

export interface IPost {
  userId: Types.ObjectId;
  title: string;
  content: string;
}

export interface IPostDocument extends IPost, Document {
  _id: Types.ObjectId;
}

const postSchema = new Schema<IPostDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "userId is required"],
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    content: {
      type: String,
      required: [true, "Content is required"],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

postSchema.index({ userId: 1, createdAt: -1 });

export const Post = model<IPostDocument>("Post", postSchema);
