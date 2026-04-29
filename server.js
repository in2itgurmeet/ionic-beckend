require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

require("./db/connection");

app.use(cors());
app.use(express.json());

const router = require("./routes/index.routes");
app.use("/api", router);

app.get("/", (req, res) => {
  res.send("API running 🚀");
});

app.listen(PORT, () => {
  console.log(`Application is running at http://localhost:${PORT}`);
});
