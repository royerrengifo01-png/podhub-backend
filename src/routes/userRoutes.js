import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import { prisma } from '../prisma.js'

dotenv.config()
const router = express.Router()

// Registro de usuario
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body
  try {
    const existingUser = await prisma.users.findUnique({ where: { email } })
    if (existingUser) return res.status(400).json({ error: 'El usuario ya existe' })

    const hashedPassword = await bcrypt.hash(password, 10)
    const newUser = await prisma.users.create({
      data: { name, email, password: hashedPassword }
    })

    res.json({ message: 'Usuario registrado correctamente', user: newUser })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Login de usuario
router.post('/login', async (req, res) => {
  const { email, password } = req.body
  try {
    const user = await prisma.users.findUnique({ where: { email } })
    if (!user) return res.status(400).json({ error: 'Usuario no encontrado' })

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) return res.status(400).json({ error: 'Contraseña incorrecta' })

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    )

    res.json({ message: 'Login exitoso', token })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Ver perfil (requiere token)
router.get('/profile', async (req, res) => {
  const authHeader = req.headers.authorization
  if (!authHeader) return res.status(401).json({ error: 'Token requerido' })

  const token = authHeader.split(' ')[1]
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await prisma.users.findUnique({
      where: { id: decoded.id },
      select: { id: true, name: true, email: true, role: true, created_at: true }
    })
    res.json(user)
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' })
  }
})

export default router
