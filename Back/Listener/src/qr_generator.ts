import QRCode from "qrcode";
import { CODES } from "./variables.ts";

export function pickRandomMessage() {
    return CODES[Math.floor(Math.random() * CODES.length)];
}

export async function generateQrCode(text: string): Promise<string> {
    return await QRCode.toDataURL(text);
}
