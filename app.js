import express from "express";
import cors from 'cors';
import {} from 'dotenv/config'
import errorHandler from "./middlewares/error.middleware";
import cookieParser from "cookie-parser";
import { courseRouter, miscellaneousRouter, paymentRouter, userRouter } from "./routes";
const app=express();
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
app.use(
    cors({
      origin: [process.env.FRONTEND_URL],
      credentials: true
    }) 
  );
app.use('/api/v1/user',userRouter);
app.use('/api/v1/course',courseRouter);
app.use('/api/v1/contact',miscellaneousRouter);
app.use('/api/v1/payment',paymentRouter);

app.use(errorHandler);
export default app;