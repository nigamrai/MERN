import path from "path";
import multer from "multer";
const upload=multer({
    dest:"uploads/",
    limits:{filesize:50*1024*1024},
    storage:multer.diskStorage({
        destination:"uploads/",
        filename:(_req,file,cb)=>{
            cb(null,file.originalname);
        },
    })
   
})
export default upload;