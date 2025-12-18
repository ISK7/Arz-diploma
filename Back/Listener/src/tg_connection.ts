import nodemailer from "nodemailer";
import { generateQrCode } from "./qr_generator.ts";
import { MAILADRES, MAILPASSWORD } from "./variables.ts";

async function sendEmail(to: string, ind: number, date: string, qrDataUrl: string) {
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
        subject: `Заявка № ${ind}. Приходите в следующую дату: ${date}. В случае, если вы хотите обратиться в техподдержку, напишите на почту иии@ру и укажите НОМЕР заявки`,
        html: `
        <img src="${qrDataUrl}" alt="QR" />
        `,
    };

    await transporter.sendMail(mailOptions);
}

export async function sendToMail(mail: string, ind: number, date: string, key: string){
    const qr = await generateQrCode(key);
    try {
        await sendEmail(mail, ind, date, qr);
        return 1;
    } catch {
        return -1
    }
}
