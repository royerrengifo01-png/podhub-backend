import express from 'express'
import { getPodcasts, createPodcast } from '../controllers/podcastController.js'

const router = express.Router()

router.get('/', getPodcasts)
router.post('/', createPodcast)

export default router
