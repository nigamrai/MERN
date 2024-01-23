class CustomErrorHandler extends Error{
    constructor(status,msg){
        super();
        this.status=status;
        this.message=msg;
    }
    static alreadyExists(message){
        return new CustomErrorHandler(409,message);
    }
    static mediaNotUploaded(){
        return new CustomErrorHandler(400,"Image/Video upload unsuccesful");
    }
    static wrongCredentials(message="Username or email is wrong"){
        return new CustomErrorHandler(401,message);
    }
    static unAuthenticated(message="Please login"){
        return new CustomErrorHandler(401,message);
    }
    static doesNotExist(message){
        return new CustomErrorHandler(400,message);
    }
    static unAuthorized(){
        return new CustomErrorHandler(400,'You are not authorized to view this page');
    }
    
}
export default CustomErrorHandler;