import express from "express";
import  {db} from "../db.js";
import { getChatReply,addChatLog} from "../controllers/chat.js";
 
const router = express.Router();
router.post("/getChatReply", getChatReply);
router.post("/addChatLog", addChatLog);
export default router;