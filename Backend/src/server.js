import dotenv from 'dotenv'
import connectDB from './config/db.js';
import app from './app.js'
import http from 'http';
import { initSocket } from './sockets/socket.js';
dotenv.config();

const server = http.createServer(app);
initSocket(server);

connectDB()
.then(()=>{
    server.on("error",(error)=>{
        console.log("ERR : ",error)
        throw error
    })
    server.listen(process.env.PORT||8000,()=>{
        console.log(`Server is running at port ${process.env.PORT}`)
    })
})
.catch((error)=>{
    console.log("MongoDB connection failed !!",error)
})
