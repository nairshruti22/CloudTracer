const express = require("express");
const router = express.Router();
const { getEC2InstanceData } = require("../awsconnection/ec2connection");

router.get("/", async (req, res) => {
  try {
    const data = await getEC2InstanceData();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch EC2 data" });
  }
});

module.exports = router;
