import { Schema, model, Types, Document } from "mongoose";

export interface INote {
  userId: Types.ObjectId;
  title: string;
  content: string;
}

export interface INoteDocument extends INote, Document {
  _id: Types.ObjectId;
}

const noteSchema = new Schema<INoteDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "userId is required"],
      index: false,
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

noteSchema.index({ userId: 1, createdAt: -1 });

export const Note = model<INoteDocument>("Note", noteSchema);
