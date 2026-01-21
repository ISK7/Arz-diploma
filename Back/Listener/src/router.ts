import { Router } from "express";
import { sendToMail } from "./tg_connection.ts";
import {prisma} from "./db_connection.ts"
import {FILEPATH} from "./variables.ts";
import multer from "multer";
import path from 'path';
import crypto from 'crypto';
import fs from 'fs/promises';
import closer from "./closer.ts";
import { parseDate, yesterdayDate } from "./dateParser.ts";
import { addRefreshToken, generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken } from "./jwtWorker.ts";

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
        verifyAccessToken(token);
        next();
    } catch (e) {
        return res.status(401).json({ error: "Invalid token" });
    }
}

const router = Router();

router.put("/refresh", async (req, res) => {
    const { refresh_token, deviceId }: { refresh_token: string, deviceId: string } = req.body;
    if (!refresh_token) {
        return res.status(400).json({ error: "Refresh token is required" });
    }
    try {
        await verifyRefreshToken(refresh_token);
        const newAccessToken = generateAccessToken(deviceId);
        res.json({ accessToken: newAccessToken });
    } catch (err) {
        console.error("Refresh token error:", err);
        return res.status(500).json({ error: "Server error" });
    }
});

router.post("/login", async (req, res) => {
    const { login, password, deviceId }: { login: string; password: string, deviceId: string } = req.body;

    console.log(`attempt to enter with login ${login} password ${password}`);
    let rights = "";
    let userId: number;
    try {
        const found = await prisma.users.findUnique({
            where: {
                login: login
            }
        });

        if (!found) {
            return res.status(401).json({ error: "Wrong login" });
        }
        if (found.password != password) {
            return res.status(401).json({ error: "Wrong password" });
        }
        rights = found.rights;
        userId = found.id;
    } catch (err) {
        console.log("Login failed. " + err);
        return res.status(500).json({ error: "server failure" });
    }

    const acsess_token = generateAccessToken(deviceId);
    const refresh_token = generateRefreshToken({ userId, deviceId });
    await addRefreshToken(refresh_token, userId, deviceId);

    res.json({ acsess_token, refresh_token, rights });
});

router.put("/rights", authMiddleware, async (req, res) => {
    const { login, password, rights }: { login: string; password: string, rights: string } = req.body;

    try {
        const servRights = await prisma.users.findUnique({
            where: {
                login: login,
                password: password
            },
            select: {
                rights: true
            }
        })
        if (rights == servRights?.rights) {
            return res.sendStatus(200);
        } else {
            return res.sendStatus(403);
        }
    } catch (err) {
        console.log("checkRights failed. " + err);
        res.status(500).json({error: "server failure"});
    }
})

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
        // if (err.code === "P2002") {
        //     return res.status(409).json({
        //         error: "Данные уже существуют в базе"
        //     });
        // }
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