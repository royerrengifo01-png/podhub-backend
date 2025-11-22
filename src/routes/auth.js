import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { sendVerificationEmail } from "../utils/sendVerificationEmail.js";

const router = express.Router();
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || "super_secret_key";

// REGISTER
router.post("/register", async (req, res) => {
  console.log("===  NUEVA SOLICITUD REGISTER ===");
  console.log("BODY RECIBIDO:", req.body);

  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      console.log(" FALTA EMAIL O PASSWORD");
      return res.status(400).json({ error: "Email y contraseña son obligatorios" });
    }

    console.log(" BUSCANDO USUARIO EXISTENTE...");
    const exists = await prisma.users.findUnique({ where: { email } });

    console.log("USUARIO EXISTE?:", exists ? "SÍ" : "NO");

    if (exists) {
      console.log(" USUARIO YA EXISTE");
      return res.status(400).json({ error: "El usuario ya existe" });
    }

    console.log(" GENERANDO HASH...");
    const hashed = await bcrypt.hash(password, 10);
    console.log("HASH GENERADO:", hashed.slice(0, 15) + "...");

    console.log(" GENERANDO VERIFICATION TOKEN...");
    const verificationToken = jwt.sign(
      { email },
      JWT_SECRET,
      { expiresIn: "1d" }
    );
    console.log("TOKEN:", verificationToken);

    console.log(" CREANDO USUARIO EN BD...");
    const createdUser = await prisma.users.create({
      data: {
        email,
        password: hashed,
        name: name || "",
        verified: false,
        verify_token: verificationToken
      }
    });

    console.log("USUARIO CREADO:", createdUser);

    console.log("ENVIANDO EMAIL DE VERIFICACIÓN...");
    await sendVerificationEmail(email, verificationToken);

    console.log("REGISTRO COMPLETADO");
    res.json({ message: "Registrado. Revisa tu correo para verificar la cuenta." });

  } catch (error) {
    console.error(" REGISTER ERROR:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

// VERIFY
router.get("/verify/:token", async (req, res) => {
  const { token } = req.params;

  console.log("===  VERIFICANDO TOKEN ===");
  console.log("TOKEN RECIBIDO:", token);

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("TOKEN DECODIFICADO:", decoded);

    const user = await prisma.users.updateMany({
      where: { email: decoded.email },
      data: { verified: true, verify_token: null }
    });

    console.log("RESULTADO UPDATE:", user);

    if (user.count === 0) {
      console.log(" TOKEN NO COINCIDE CON NINGÚN USUARIO");
      return res.status(400).send("Token inválido");
    }

    res.send("Cuenta verificada. Ya puedes iniciar sesión.");

  } catch (err) {
    console.log(" ERROR AL VERIFICAR TOKEN:", err);
    res.status(400).send("Token expirado o inválido");
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  console.log("===  NUEVA SOLICITUD LOGIN ===");
  console.log("BODY LOGIN:", req.body);

  try {
    const { email, password } = req.body;

    const user = await prisma.users.findUnique({ where: { email } });
    console.log("USUARIO ENCONTRADO:", user);

    if (!user) {
      console.log(" USUARIO NO ENCONTRADO");
      return res.status(400).json({ error: "Usuario no encontrado" });
    }

    if (!user.verified) {
      console.log(" USUARIO NO VERIFICADO");
      return res.status(403).json({ error: "Debes verificar tu correo primero." });
    }

    const valid = await bcrypt.compare(password, user.password);
    console.log("PASSWORD CORRECTO?:", valid);

    if (!valid) {
      console.log(" PASSWORD INCORRECTA");
      return res.status(400).json({ error: "Contraseña incorrecta" });
    }

    console.log(" GENERANDO JWT...");
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "1d"
    });

    console.log("TOKEN GENERADO:", token);

    res.json({ message: "Inicio de sesión exitoso", token });

  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

export default router;
