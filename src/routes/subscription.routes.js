import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { toggleSubscription,
    getSubscribedChannels,
    getUserChannelSubscribers
  } from "../controllers/subscription.controller.js";

const router = Router()
router.use(verifyJWT)


router.route("/:channelId").post(toggleSubscription);

router.route("/subscribers").get(getUserChannelSubscribers);

router.route("/subscribedTo").get(getSubscribedChannels);

export default router