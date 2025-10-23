import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

router.get("/", async (req, res) => {
  try {
    const podcasts = await prisma.podcasts.findMany();
    res.json(podcasts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener los podcasts" });
  }
});

export default router;
