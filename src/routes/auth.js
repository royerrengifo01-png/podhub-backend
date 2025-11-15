// routes/auth.js
import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import sendVerificationEmail from "../utils/sendVerificationEmail.js";

const router = express.Router();
const prisma = new PrismaClient();

// REGISTER con verificación
router.post("/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;

    const exists = await prisma.users.findUnique({ where: { email } });
    if (exists) return res.status(400).json({ error: "El usuario ya existe" });

    const hashed = await bcrypt.hash(password, 10);

    const verificationToken = jwt.sign(
      { email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    await prisma.users.create({
      data: {
        email,
        password: hashed,
        name,
        verified: false,
        verification_token: verificationToken
      }
    });

    await sendVerificationEmail(email, verificationToken);

    res.json({ message: "Registrado. Revisa tu correo para verificar la cuenta." });

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

// VERIFY
router.get("/verify/:token", async (req, res) => {
  const { token } = req.params;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.users.updateMany({
      where: { email: decoded.email },
      data: { verified: true, verification_token: null }
    });

    if (user.count === 0) return res.status(400).send("Token inválido");

    res.send("Cuenta verificada. Ya puedes iniciar sesión.");
  } catch (err) {
    res.status(400).send("Token expirado o inválido");
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: "Usuario no encontrado" });

    if (!user.verified)
      return res.status(403).json({ error: "Debes verificar tu correo primero." });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: "Contraseña incorrecta" });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({ message: "Inicio de sesión exitoso", token });

  } catch (error) {
    res.status(500).json({ error: "Error en el servidor" });
  }
});

export default router;
