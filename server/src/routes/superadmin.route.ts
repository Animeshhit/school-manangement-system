import {Router} from 'express';


const SuperAdminRouter = Router();


SuperAdminRouter.get("/",(re,res) => {
    res.send("this router is from superAdminRouter");
})




export default SuperAdminRouter;

