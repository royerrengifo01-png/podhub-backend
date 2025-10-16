import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

// Obtener todos los podcasts con su autor
export const getPodcasts = async (req, res) => {
  try {
    const podcasts = await prisma.podcasts.findMany({
      include: { users: true }, // Trae también el autor
      orderBy: { id: 'desc' }
    })
    res.json(podcasts)
  } catch (error) {
    console.error('Error al obtener los podcasts:', error)
    res.status(500).json({ error: 'Error al obtener los podcasts' })
  }
}

// Crear un nuevo podcast
export const createPodcast = async (req, res) => {
  try {
    const { title, author, topic, created_by } = req.body

    const newPodcast = await prisma.podcasts.create({
      data: {
        title,
        author,
        topic,
        created_by: Number(created_by),
      },
    })

    res.status(201).json(newPodcast)
  } catch (error) {
    console.error('Error al crear el podcast:', error)
    res.status(500).json({ error: 'Error al crear el podcast' })
  }
}
