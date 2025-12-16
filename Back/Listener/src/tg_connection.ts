import nodemailer from "nodemailer";
import { pickRandomMessage, generateQrCode } from "./qr_generator.ts";
import { MAILADRES, MAILPASSWORD } from "./variables.ts";

async function sendEmail(to: string, qrDataUrl: string) {
    const transporter = nodemailer.createTransport({
        host: "smtp.yandex.ru",
        port: 587,
        secure: false,
        auth: {
        user: MAILADRES,
        pass: MAILPASSWORD
        }
    });

    const mailOptions = {
        from: "UNN Service",
        to,
        subject: "Ваш QR-код для посещения аптекарского огорода",
        html: `
        <img src="${qrDataUrl}" alt="QR" />
        `,
    };

    await transporter.sendMail(mailOptions);
}

export async function sendMail(mail: string) {
    const message = pickRandomMessage();
    const qr = await generateQrCode(message);
    await sendEmail(mail, qr);
    return 1;
}
