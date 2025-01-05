import express from "express";
import  {getUsers,deleteUser,updateUser,getUser,addLog,getLogs,getTopScores} from "../controllers/user.js"
 
const router = express.Router();
router.get("/getdetails/:id",getUser)
router.get("/get",getUsers)
router.post("/getLast",getTopScores)
router.delete("/delete/:id",deleteUser )
router.put("/update", updateUser)
router.post("/addLog",addLog)
router.post("/getLogs",getLogs) 

export default router;