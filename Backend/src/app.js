const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth/auth.routes");
const teamRoutes = require("./routes/team.routes");
const app = express();

const rp = require("request-promise");
const cherio = require("cherio");
const Table = require("cli-table3");
app.use(cors());
app.use(express.json());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/teams", teamRoutes);

app.get("/", (req, res) => {
  res.status(200).json({ success: true, message: "METoS backend is running" });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

module.exports = app;
