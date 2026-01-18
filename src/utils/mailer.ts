// import nodemailer from "nodemailer";

// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.GMAIL_USER,
//     pass: process.env.GMAIL_PASS,
//   },
// });

// export const sendEmail = async (to: string, subject: string, html: string) => {
//   try {
//     await transporter.sendMail({
//       from: `"Cobuild Team" <${process.env.GMAIL_USER}>`,
//       to,
//       subject,
//       html,
//     });
//     console.log("✅ Email sent to:", to);
//   } catch (error) {
//     console.error("❌ Email failed:", error);
//   }
// };