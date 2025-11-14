import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ❤️ Dar o quitar like
export const toggleLike = async (req, res) => {
  try {
    const userId = req.user.id;         // viene del token
    const podcastId = Number(req.params.podcastId);

    const existing = await prisma.likes.findUnique({
      where: {
        user_id_podcast_id: {
          user_id: userId,
          podcast_id: podcastId
        }
      }
    });

    // Si ya existe → quitar like
    if (existing) {
      await prisma.likes.delete({
        where: {
          user_id_podcast_id: {
            user_id: userId,
            podcast_id: podcastId
          }
        }
      });

      return res.json({ liked: false });
    }

    // Si no existe → crear like
    const like = await prisma.likes.create({
      data: {
        user_id: userId,
        podcast_id: podcastId
      }
    });

    return res.json({ liked: true, like });

  } catch (error) {
    console.log("❌ toggleLike error:", error);
    res.status(500).json({ error: "Error al procesar like" });
  }
};



// ❤️ Obtener podcasts liked del usuario
export const getUserLikedPodcasts = async (req, res) => {
  try {
    const userId = req.user.id;

    const likes = await prisma.likes.findMany({
      where: { user_id: userId },
      include: { podcasts: true }
    });

    const podcasts = likes.map(l => l.podcasts);

    res.json(podcasts);

  } catch (error) {
    console.log("❌ getUserLikedPodcasts error:", error);
    res.status(500).json({ error: "Error al obtener likes" });
  }
};
