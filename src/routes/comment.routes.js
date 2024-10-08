import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
// import authMiddleware from '../middlewares/auth.middleware.js';
import { addComment, deleteComment, updateComment } from "../controllers/comment.controller.js";

const router = Router()
router.use(verifyJWT)

router.route("/add/:videoId").post(addComment)
router.route("/delete/:commentId").delete(deleteComment)
router.route("/update/:commentId").patch(updateComment)

export default router