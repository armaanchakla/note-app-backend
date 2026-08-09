import { Router } from "express";
import { PostController } from "../controllers/PostController";
import { authenticate } from "../middlewares/authenticate";
import { validate } from "../middlewares/validate";
import { createPostSchema } from "../validators/post.schema";
import { paginationQuerySchema } from "../validators/pagination.schema";

const router = Router();

// All post routes require authentication. Posts are public to authenticated users.
router.use(authenticate());

router.post("/", validate(createPostSchema, "body"), PostController.create);
router.get("/", validate(paginationQuerySchema, "query"), PostController.list);

export default router;
