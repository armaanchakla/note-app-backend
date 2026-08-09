import { Router } from "express";
import { UserController } from "../controllers/UserController";
import { authenticate } from "../middlewares/authenticate";
import { authorizeRoles } from "../middlewares/authorizeRoles";
import { validate } from "../middlewares/validate";
import { createUserSchema, updateUserSchema } from "../validators/user.schema";
import { paginationQuerySchema } from "../validators/pagination.schema";
import { Role } from "../types/roles";

const router = Router();

// All user-management routes require ADMIN.
router.use(authenticate(), authorizeRoles(Role.ADMIN));

router.get("/interests", UserController.interests);
router.get("/:userId/posts", UserController.userPosts);

router.post("/", validate(createUserSchema, "body"), UserController.create);
router.get("/", validate(paginationQuerySchema, "query"), UserController.list);
router.get("/:id", UserController.get);
router.patch("/:id", validate(updateUserSchema, "body"), UserController.update);
router.delete("/:id", UserController.delete);

export default router;
