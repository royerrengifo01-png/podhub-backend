import { transporter } from "../utils/email.js";

export const sendVerificationEmail = async (email, token) => {
  const link = `${process.env.BASE_URL}/api/auth/verify/${token}`;

  await transporter.sendMail({
    from: `"PodHub" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verifica tu cuenta",
    html: `
      <h1>Verifica tu cuenta</h1>
      <p>Haz clic en el siguiente enlace para activar tu cuenta:</p>
      <a href="${link}" style="padding:10px 20px;background:#4f46e5;color:white;border-radius:8px;text-decoration:none;">Verificar</a>
      <p>Si no creaste esta cuenta, ignora este mensaje.</p>
    `
  });
};
