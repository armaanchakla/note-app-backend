import { Router } from "express";
import { NoteController } from "../controllers/NoteController";
import { authenticate } from "../middlewares/authenticate";
import { validate } from "../middlewares/validate";
import { createNoteSchema, updateNoteSchema } from "../validators/note.schema";
import { paginationQuerySchema } from "../validators/pagination.schema";

const router = Router();

// All note routes require authentication.
router.use(authenticate());

router.post("/", validate(createNoteSchema, "body"), NoteController.create);
router.get("/", validate(paginationQuerySchema, "query"), NoteController.list);
router.get("/:id", NoteController.get);
router.patch("/:id", validate(updateNoteSchema, "body"), NoteController.update);
router.delete("/:id", NoteController.delete);

export default router;
