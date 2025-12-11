import { Router } from "express";
import { connectTG, sendMail } from "./tg_connection.ts";
import {prisma} from "./db_connection.ts"
import jwt from "jsonwebtoken";
import {ADMIN_PASSWORD, JWT_KEY} from "./variables.ts";

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

router.post("/reg", async (req : any, res : any) => {
    console.log(req.body);
    try {
        await prisma.visitors.create({
            data: {
                name: req.body.name,
                second_name: req.body.second_name,
                patronim: req.body.patronim,
                phone: req.body.phone
            }
        });
    const sent = await connectTG();
    res.json(sent);
    } catch (err: any) {
        // Ошибка уникальности
        if (err.code === "P2002") {
            return res.status(409).json({
                error: "Данные уже существуют в базе"
            });
        }

        console.error("DB error:", err);
        res.status(500).json({ error: "Database error" });
    }
});

router.get("/admin", authMiddleware, async (req, res) => {
    try {
        console.log("visitors request");
        const users = await prisma.visitors.findMany();
        res.json(users);
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).json({ error: "Database error" });
    }
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
            const mail = found.phone;
            const result = sendMail(mail)
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