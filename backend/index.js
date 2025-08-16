require("dotenv").config();
const express = require("express");
const cors = require("cors");
const ec2route = require("./src/routes/ec2route");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use("/api/getEC2Data", ec2route);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
