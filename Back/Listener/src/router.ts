import { Router } from "express";
import { sendToMail } from "./tg_connection.ts";
import {prisma} from "./db_connection.ts"
import jwt from "jsonwebtoken";
import {ADMIN_PASSWORD, JWT_KEY, FILEPATH, ADMIN_DATA} from "./variables.ts";
import multer from "multer";
import path, { parse } from 'path';
import crypto from 'crypto';
import fs from 'fs/promises';
import closer from "./closer.ts";
import { parseDate, yesterdayDate } from "./dateParser.ts";

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
    const { login, password }: { login: string; password: string } = req.body;

    console.log(`attempt to enter with login ${login} password ${password}`);

    if (!(login in ADMIN_DATA)) {
        return res.status(401).json({ error: "Wrong login" });
    }

    if (ADMIN_DATA[login as keyof typeof ADMIN_DATA] !== password) {
        return res.status(401).json({ error: "Wrong password" });
    }

    const token = jwt.sign({}, JWT_KEY!, { expiresIn: "1h" });

    res.json({ token });
});

router.post("/reg", upload.single("file"), async (req : any, res : any) => {
    const {name, second_name, patronim, wish, email, number} = req.body;
    const filePath = req.file ? req.file.filename : null;

    try {
        await prisma.visitors.create({
            data: {
                name: name,
                second_name: second_name,
                patronim: patronim,
                email: email,
                wish: wish,
                number: number,
                image: filePath,
                status: 0
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

router.get("/redactor", authMiddleware, async (req, res) => {
    try {
        const keys = await prisma.keys.findMany();
        const result = keys;
        res.json(result);
    } catch (err) {
        console.error("Get Keys (Redactor). Database error:", err);
        res.status(500).json({ error: "Database error" });
    }
});

router.post("/redactor", authMiddleware, async (req : any, res : any) => {
    try {
        const key  = req.body.newKey;
        console.log(`Adding key: ${key}`);
        await prisma.keys.create({
            data: {
                key: key,
                isFree: true
            }
        });
        res.json("Success");
    } catch (err) {
        console.error("Can't add key:", err);
        res.status(500).json({ error: "Can't add key" });
    }
});

router.delete("/redactor", authMiddleware, async (req : any, res : any) => {
    try {
        const key = req.body.keyToDelete;
        console.log(`Deleting key: ${key}`);

        await prisma.keys.delete({
            where: {
                key: key
            }
        });
        res.json("Success");
    } catch (err) {
        console.error("Can't delete key:", err);
        res.status(500).json({ error: "Can't delete key" });
    }
});

router.get("/admin", authMiddleware, async (req, res) => {
    try {
        await closer();
        const visitors = await prisma.visitors.findMany();
        const result = visitors;
        res.json(result);
    } catch (err) {
        console.error("Get Visitors. Database error:", err);
        res.status(500).json({ error: "Database error" });
    }
});

router.get("/admin/keys", authMiddleware, async (req, res) => {
    try {
        await closer();
        const keys = await prisma.keys.findMany( {
            where: {
                isFree: true
            },
            select: {
                key: true
            }
        });
        const result = keys;
        res.json(result);
    } catch (err) {
        console.error("Get Keys. Database error:", err);
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
        const { ind, key, date } = req.body;
        const correctDate = parseDate(date);
        const found = await prisma.visitors.update({
            where: {
                id: ind
            },
            data: {
                date: correctDate,
                key: key
            }
        });
        if(found) {
            const mail = found.email;
            const ind = found.id;
            const date = found.date?.toString();
            const key = found.key;
            if(!date) {
                res.status(500).json({ error: "Date is undefined" });
                return -1;
            }
            if(!key) {
                res.status(500).json({ error: "Key is undefined" });
                return -1;
            }
            const result = await sendToMail(mail, ind, date, key)
                .then(() => {console.log(`QR-code sent to ${mail}`); return 1;})
                .catch(() => {console.error; return -1});
            if (result == 1) {
                res.json(result)
            } else {
                res.status(500).json({ error: "Can't send mail" });
            }
            await prisma.visitors.update({
                where: {
                    id: req.body.ind
                },
                data: {
                    status: 1
                }
            })
            await prisma.keys.update({
                where: {
                    key: key
                },
                data: {
                    isFree: false
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
        // const found = await prisma.visitors.findUnique({
        //     where: {
        //         id: req.body.ind
        //     }
        // });
        // if (found && found.image) {
        //     await fs.unlink(FILEPATH + found.image);
        // }
        await prisma.visitors.update({
            where: {
                id: req.body.ind
            },
            data: {
                status: -1
            }
        })
        res.json(1)
    } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Database error" });
    }
});

router.put("/admin/close", authMiddleware, async (req : any, res : any) => {
    try {
        console.log(`close request: ${req.body.ind}`);
        const ind  = req.body.ind;
        const correctDate = yesterdayDate();
        const found = await prisma.visitors.update({
            where: {
                id: ind
            },
            data: {
                date: correctDate,
            }
        });
        if(found) {
            const key = found.key;
            await prisma.visitors.update({
                where: {
                    id: ind
                },
                data: {
                    status: 2
                }
            })
            if (key) {
                await prisma.keys.update({
                    where: {
                        key: key
                    },
                    data: {
                        isFree: true
                    }
                })
            }
            res.json(1);
        } else {
            console.log(`error at accepting user ${req.body.ind}`)
            res.json(-1)
        }
        } catch (err) {
        console.error("Database error:", err);
        res.status(500).json({ error: "Database error" });
    }
});

export default router