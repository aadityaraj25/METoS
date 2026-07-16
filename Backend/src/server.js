import dotenv from 'dotenv'
import connectDB from './config/db.js';
import app from './app.js'

dotenv.config();

connectDB()
.then(()=>{
    app.on("error",(error)=>{
        console.log("ERR : ",error)
        throw error
    })
    app.listen(process.env.PORT||8000,()=>{
        console.log(`Server is running at port ${process.env.PORT}`)
    })
})
.catch((error)=>{
    console.log("MongoDB connection failed !!",error)
})

