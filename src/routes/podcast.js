import express from "express";
import upload from "../middleware/upload.js";
import {
  createPodcast,
  getPodcasts,
  getPodcastById,
  deletePodcast
} from "../controllers/podcastController.js";
import isAdmin from "../middleware/isAdmin.js";

const router = express.Router();

router.get("/", getPodcasts);

router.post(
  "/",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "audio", maxCount: 1 }
  ]),
  createPodcast
);

router.get("/:id", getPodcastById);
router.delete("/:id", deletePodcast);

export default router;
