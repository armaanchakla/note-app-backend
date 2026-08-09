import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { successResponse } from "../utils/ApiResponse";
import { NoteService } from "../services/NoteService";
import { normalizePagination } from "../utils/pagination";
import { BadRequestError } from "../utils/AppError";

function parseObjectId(value: string, name: string): string {
  if (!/^[a-fA-F0-9]{24}$/.test(value)) {
    throw new BadRequestError("INVALID_ID", `Invalid ${name}`);
  }
  return value;
}

export const NoteController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const note = await NoteService.createNote(userId, req.body);
    return successResponse(res, note, 201);
  }),

  list: asyncHandler(async (req: Request, res: Response) => {
    const { page, limit } = normalizePagination(req.query.page, req.query.limit);
    const result = await NoteService.listNotes(
      { userId: req.user!.userId, role: req.user!.role },
      page,
      limit
    );
    return successResponse(res, result.data, 200, result.pagination);
  }),

  get: asyncHandler(async (req: Request, res: Response) => {
    const noteId = parseObjectId(req.params.id, "note id");
    const note = await NoteService.getNote(
      { userId: req.user!.userId, role: req.user!.role },
      noteId
    );
    return successResponse(res, note);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const noteId = parseObjectId(req.params.id, "note id");
    const note = await NoteService.updateNote(
      { userId: req.user!.userId, role: req.user!.role },
      noteId,
      req.body
    );
    return successResponse(res, note);
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    const noteId = parseObjectId(req.params.id, "note id");
    await NoteService.deleteNote(
      { userId: req.user!.userId, role: req.user!.role },
      noteId
    );
    return successResponse(res, { message: "Note deleted" });
  }),
};
