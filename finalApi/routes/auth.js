import express from "express";
import  {db} from "../db.js";
import { register,login,logout ,changePassword,forgetPassword,resetPassword} from "../controllers/auth.js";
 
const router = express.Router();
router.post("/forgetpassword", forgetPassword);
router.post("/reset/:token", resetPassword);
router.put("/changepass/:id",changePassword)
router.post("/register",register)
router.post("/login",login)
router.post("/logout",logout)
export default router;