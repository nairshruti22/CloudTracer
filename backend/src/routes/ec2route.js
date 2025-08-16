const express = require("express");
const router = express.Router();
const { getEC2InstanceData } = require("../awsconnection/ec2connection");
const mockData = require("./mockdata.json");

const isAwsConfigured =
  process.env.AWS_ACCESS_KEY_ID &&
  process.env.AWS_SECRET_ACCESS_KEY &&
  process.env.ROLE_ARN;

router.get("/", async (req, res) => {
  try {
    if (isAwsConfigured) {
      const data = await getEC2InstanceData(); // Your real AWS logic
      res.json(data);
    } else {
      res.json({ ...mockData, dataSource: "mock" }); // Send mock data if no AWS config
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch EC2 data" });
  }
});

module.exports = router;
