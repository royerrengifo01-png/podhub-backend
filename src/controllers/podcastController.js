import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Obtener todos los podcasts (más recientes primero)
export const getPodcasts = async (req, res) => {
  try {
    const podcasts = await prisma.podcasts.findMany({
      include: { users: true }, // incluye datos del autor
      orderBy: { id: "desc" },
    });

    res.status(200).json(podcasts);
  } catch (error) {
    console.error("Error al obtener los podcasts:", error);
    res.status(500).json({ error: "Error al obtener los podcasts" });
  }
};

// Crear un nuevo podcast
export const createPodcast = async (req, res) => {
  try {
    const { title, author, topic, created_by, image_url } = req.body;

    // Validación básica
    if (!title || !author) {
      return res.status(400).json({
        error: "El título y el autor son campos obligatorios.",
      });
    }

    const newPodcast = await prisma.podcasts.create({
      data: {
        title,
        author,
        topic,
        created_by: created_by ? Number(created_by) : null,
        image_url: image_url || null, // 👈 Campo para la imagen
      },
    });

    res.status(201).json(newPodcast);
  } catch (error) {
    console.error("Error al crear el podcast:", error);
    res.status(500).json({ error: "Error al crear el podcast" });
  }
};

// Obtener un solo podcast por ID
export const getPodcastById = async (req, res) => {
  try {
    const { id } = req.params;
    const podcast = await prisma.podcasts.findUnique({
      where: { id: Number(id) },
      include: { users: true, episodes: true },
    });

    if (!podcast) {
      return res.status(404).json({ error: "Podcast no encontrado" });
    }

    res.status(200).json(podcast);
  } catch (error) {
    console.error("Error al obtener el podcast:", error);
    res.status(500).json({ error: "Error al obtener el podcast" });
  }
};

// Eliminar un podcast
export const deletePodcast = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.podcasts.delete({
      where: { id: Number(id) },
    });

    res.status(200).json({ message: "Podcast eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar el podcast:", error);
    res.status(500).json({ error: "Error al eliminar el podcast" });
  }
};
