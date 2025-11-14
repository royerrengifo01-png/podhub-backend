import express from "express";
import auth from "../middleware/auth.js"; 
import { toggleLike, getUserLikedPodcasts } from "../controllers/likeController.js";

const router = express.Router();

router.post("/:podcastId", auth, toggleLike);
router.get("/", auth, getUserLikedPodcasts);

export default router;
