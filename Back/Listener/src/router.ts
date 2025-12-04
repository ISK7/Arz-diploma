import { Router } from "express";
import { connectTG } from "./tg_connection.ts";

const router = Router();

router.post("/", async (req : any, res : any) => {
    console.log(req.body);
    const sent = await connectTG();

    res.json(sent);
});

export default router