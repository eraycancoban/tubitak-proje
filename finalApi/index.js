import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import userRouter from "./routes/users.js"
import authRouter from "./routes/auth.js"
import chatRouter from "./routes/chat.js"
import  {db} from "./db.js"


const app = express()
app.use(cors({credentials: true, origin: 'http://localhost:3000'}));
app.use(express.json())
app.use(cookieParser())
app.use("/users", userRouter)
app.use("/auth", authRouter)
app.use("/chat", chatRouter)



app.listen(8800, () => {
    console.log("Backend server is running!")
})



