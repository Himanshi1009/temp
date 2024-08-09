import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike, 
    getAllLikedVideos
 } from "../controllers/like.controller.js";

const router = Router()
router.use(verifyJWT)

router.route("/togglelike/v/:videoId").post(toggleVideoLike)
router.route("/togglelike/c/:commentId").post(toggleCommentLike)
router.route("/togglelike/t/:tweetId").post(toggleTweetLike)
router.route("/videos").get(getAllLikedVideos)

export default router