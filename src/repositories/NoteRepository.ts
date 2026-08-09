import { Types } from "mongoose";
import { Note, INoteDocument } from "../models/Note";

export interface CreateNoteData {
  userId: Types.ObjectId;
  title: string;
  content: string;
}

export interface UpdateNoteData {
  title?: string;
  content?: string;
}

export interface NoteListFilter {
  userId?: Types.ObjectId | { $in: Types.ObjectId[] };
}

export const NoteRepository = {
  async create(data: CreateNoteData): Promise<INoteDocument> {
    return Note.create(data);
  },

  async findById(id: string | Types.ObjectId): Promise<INoteDocument | null> {
    return Note.findById(id);
  },

  /**
   * For admins listing all notes, filter can be empty;
   * for users, filter must be scoped to their own userId.
   */
  async list(
    filter: NoteListFilter,
    skip: number,
    limit: number
  ): Promise<INoteDocument[]> {
    return Note.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit);
  },

  async count(filter: NoteListFilter): Promise<number> {
    return Note.countDocuments(filter);
  },

  async update(
    id: string | Types.ObjectId,
    data: UpdateNoteData
  ): Promise<INoteDocument | null> {
    return Note.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  },

  async delete(id: string | Types.ObjectId): Promise<INoteDocument | null> {
    return Note.findByIdAndDelete(id);
  },
};
