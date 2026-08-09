import { Types } from "mongoose";
import { NoteRepository } from "../repositories/NoteRepository";
import { NotFoundError, ForbiddenError } from "../utils/AppError";
import { Role } from "../types/roles";
import { buildPagination, normalizePagination } from "../utils/pagination";
import { PaginationResult } from "../utils/pagination";
import { INoteDocument } from "../models/Note";

export interface CreateNoteInput {
  title: string;
  content: string;
}

export interface UpdateNoteInput {
  title?: string;
  content?: string;
}

export const NoteService = {
  async createNote(actorUserId: string, input: CreateNoteInput): Promise<INoteDocument> {
    const note = await NoteRepository.create({
      userId: new Types.ObjectId(actorUserId),
      title: input.title,
      content: input.content,
    });
    return note;
  },

  async listNotes(
    actor: { userId: string; role: Role },
    page: number,
    limit: number
  ): Promise<PaginationResult<INoteDocument>> {
    const normalized = normalizePagination(page, limit);
    const filter =
      actor.role === Role.ADMIN ? {} : { userId: new Types.ObjectId(actor.userId) };

    const [notes, total] = await Promise.all([
      NoteRepository.list(
        filter,
        (normalized.page - 1) * normalized.limit,
        normalized.limit
      ),
      NoteRepository.count(filter),
    ]);

    return {
      data: notes,
      pagination: buildPagination(normalized.page, normalized.limit, total),
    };
  },

  async getNote(
    actor: { userId: string; role: Role },
    noteId: string
  ): Promise<INoteDocument> {
    const note = await NoteRepository.findById(noteId);
    if (!note) {
      throw new NotFoundError("NOTE_NOT_FOUND", "Note not found");
    }
    this.assertOwnership(actor, note.userId.toString());
    return note;
  },

  async updateNote(
    actor: { userId: string; role: Role },
    noteId: string,
    input: UpdateNoteInput
  ): Promise<INoteDocument> {
    const note = await NoteRepository.findById(noteId);
    if (!note) {
      throw new NotFoundError("NOTE_NOT_FOUND", "Note not found");
    }
    this.assertOwnership(actor, note.userId.toString());
    const updated = await NoteRepository.update(noteId, input);
    if (!updated) {
      throw new NotFoundError("NOTE_NOT_FOUND", "Note not found");
    }
    return updated;
  },

  async deleteNote(actor: { userId: string; role: Role }, noteId: string): Promise<void> {
    const note = await NoteRepository.findById(noteId);
    if (!note) {
      throw new NotFoundError("NOTE_NOT_FOUND", "Note not found");
    }
    this.assertOwnership(actor, note.userId.toString());
    await NoteRepository.delete(noteId);
  },

  /**
   * Ownership enforcement. Admins can access any note;
   * regular users only notes they own.
   */
  assertOwnership(actor: { userId: string; role: Role }, ownerUserId: string): void {
    if (actor.role === Role.ADMIN) return;
    if (actor.userId !== ownerUserId) {
      throw new ForbiddenError("NOT_OWNER", "You can only access your own notes");
    }
  },
};
