import express from "express";
import {
  getPodcasts,
  createPodcast,
  getPodcastById,
  deletePodcast,
  upload
} from "../controllers/podcastController.js";

const router = express.Router();

router.get("/", getPodcasts);
router.post("/", upload.single("image"), createPodcast);
router.get("/:id", getPodcastById);
router.delete("/:id", deletePodcast);

export default router;

