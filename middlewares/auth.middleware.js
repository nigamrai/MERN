import CustomErrorHandler from "../services/customErrorHandler";
import {} from 'dotenv/config';
import jwtServices from "../services/jwtServices";
 const isLoggedIn=async(req,res,next)=>{
    const {token}=req.cookies;
    if(!token){
        return next(new CustomErrorHandler.unAuthenticated());
    }
    const userDetails= jwtServices.verify(token);
    
    req.user=userDetails;
    next();
}
 const authorizedRoles=(...roles)=>{
    async(req,res,next)=>{
        if(!roles.includes(req.user.role)){
            return next(CustomErrorHandler.unAuthorized());
        }
    next();
    }
}
export {isLoggedIn,authorizedRoles} 