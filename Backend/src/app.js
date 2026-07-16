import express, { urlencoded } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import authRoutes from './routes/auth/auth.routes.js'
import teamRoutes from './routes/team.routes.js'


const app = express();


app.use(cors({
  origin:process.env.CORS_ORIGIN,
  credentials:true,
}));
app.use(express.json());
app.use(urlencoded({extended:true, limit:"16kb"}))
app.use(cookieParser())

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/teams", teamRoutes);

// global error handler
app.use((err,req,res,next)=>{
    res.status(err.statusCode||500).json({
        success: false,
        message: err.message||"Internal Server Error",
    })
})

app.get("/", (req, res) => {
  res.status(200).json({ success: true, message: "METoS backend is running" });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

module.exports = app;
