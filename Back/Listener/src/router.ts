import { Router } from "express";
import { sendMail } from "./tg_connection.ts";
import {prisma} from "./db_connection.ts"
import jwt from "jsonwebtoken";
import {ADMIN_PASSWORD, JWT_KEY, FILEPATH} from "./variables.ts";
import multer from "multer";
import path from 'path';
import crypto from 'crypto';
import fs from 'fs/promises';

const storage = multer.diskStorage({
  destination: (req: any, file: any, cb: any) => {
    cb(null, FILEPATH);
  },
  filename: (req: any, file: any, cb: any) => {
    const ext = path.extname(file.originalname);
    const name = crypto.randomUUID();
    cb(null, `${name}${ext}`);
  }
});

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

function authMiddleware(req: any, res: any, next: () => void) {
    const auth = req.headers.authorization;

    if (!auth || !auth.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const token = auth.split(" ")[1];

    try {
        jwt.verify(token, JWT_KEY!);
        next();
    } catch (e) {
        return res.status(401).json({ error: "Invalid token" });
    }
}

const router = Router();

router.post("/login", (req, res) => {
    const { password } = req.body;

    console.log(`attempt to enter with password ${password}`);

    if (password != ADMIN_PASSWORD) {
        return res.status(401).json({ error: "Wrong password" });
    }

    const token = jwt.sign({}, JWT_KEY!, { expiresIn: "1h" });

    res.json({ token });
});

router.post("/reg", upload.single("file"), async (req : any, res : any) => {
    const {name, second_name, patronim, email, number} = req.body;
    const filePath = req.file ? req.file.filename : null;

    try {
        await prisma.visitors.create({
            data: {
                name: name,
                second_name: second_name,
                patronim: patronim,
                email: email,
                number: number,
                image: filePath
            }
        });

        res.json(1);
    } catch (err: any) {
        // Ошибка уникальности
        if (err.code === "P2002") {
            return res.status(409).json({
                error: "Данные уже существуют в базе"
            });
        }
        if (req.file) {
            await fs.unlink(req.file.path);
        }

        console.error("DB error:", err);
        res.status(500).json({ error: "Database error" });
    }
});

router.get("/admin", authMiddleware, async (req, res) => {
    try {
        const visitors = await prisma.visitors.findMany();
        const result = visitors;
        res.json(result);
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).json({ error: "Database error" });
    }
});

router.get('/admin/:name', authMiddleware, (req, res) => {
    const filePath = path.join(
        process.cwd(),
        FILEPATH,
        req.params.name
    );
    res.sendFile(filePath);
});

router.put("/admin", authMiddleware, async (req : any, res : any) => {
    try {
        console.log(`accept request: ${req.body.ind}`);
        const found = await prisma.visitors.findUnique({
            where: {
                id: req.body.ind
            }
        });
        if(found) {
            const mail = found.email;
            const result = sendMail(mail)
                .then(() => console.log(`QR-code sent to ${mail}`))
                .catch(console.error);
            res.json(result)
            await prisma.visitors.delete({
                where: {
                    id: req.body.ind
                }
            })
        } else {
            console.log(`error at accepting user ${req.body.ind}`)
            res.json(-1)
        }
        } catch (err) {
        console.error("Database error:", err);
        res.status(500).json({ error: "Database error" });
    }
});

router.delete("/admin", authMiddleware, async (req : any, res : any) => {
    try {
        console.log(`refuse request: ${req.body.ind}`);
        const found = await prisma.visitors.findUnique({
            where: {
                id: req.body.ind
            }
        });
        if (found && found.image) {
            await fs.unlink(found.image);
        }
        await prisma.visitors.delete({
            where: {
                id: req.body.ind
            }
        })
        res.json(1)
    } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Database error" });
    }
});

export default router