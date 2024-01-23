import {} from 'dotenv/config';
import jwt from 'jsonwebtoken';
class jwtServices{
    static sign(payload,secret=process.env.JWT_SECRET,expiry="3600s"){
        return jwt.sign(payload,secret,{expiresIn:expiry});
    }
    static verify(token,secret=process.env.JWT_SECRET){
        return jwt.verify(token,secret);
    }
}
export default jwtServices;