import express from "express";
import cors from "cors";
import router from "./router.ts";

const PORT = 3000;
const whitelist = ['http://localhost:5173', /** other domains if any */ ]
const path = "/pharmacygardenreg"


const app = express();
app.use(express.json());
const corsOptions = {
  credentials: true,
  origin: (origin : any, callback : any) => {
    if(whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}
app.use(cors(corsOptions))

app.use(path, router);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
