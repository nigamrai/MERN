import app from './app';
import {} from 'dotenv/config';
import connectToDB from './config/DBConnect';
import  cloudinary from 'cloudinary';
const PORT=process.env.PORT;
cloudinary.v2.config({ 
    cloud_name: 'dgbxiu8yj', 
    api_key: '212787435519848', 
    api_secret: 'PO3uBRUpGAulGKrw1hPbWxs3kHU' 
  });
app.listen(PORT,()=>{
    console.log(`App is running at http://localhost:${PORT}`);
    connectToDB();
});