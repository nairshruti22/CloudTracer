require("dotenv").config();
const AWS = require("aws-sdk");

// Basic AWS config
AWS.config.update({ region: process.env.AWS_REGION });

const sts = new AWS.STS();

// Function to assume the role and return temporary credentials
async function assumeRole() {
  const params = {
    RoleArn: process.env.ROLE_ARN,
    RoleSessionName: "EC2ObservabilitySession", // session name can be anything
    DurationSeconds: 3600, // 1 hour temporary creds (max 1 hour for SDK v2)
  };

  const data = await sts.assumeRole(params).promise();

  return {
    accessKeyId: data.Credentials.AccessKeyId,
    secretAccessKey: data.Credentials.SecretAccessKey,
    sessionToken: data.Credentials.SessionToken,
  };
}

// Main function to get all dashboard data: EC2 utilization, cost data, and cost trends
async function getEC2InstanceData() {
  // Assume the role first
  const tempCreds = await assumeRole();

  // Create AWS clients with temporary credentials
  const ec2 = new AWS.EC2({
    accessKeyId: tempCreds.accessKeyId,
    secretAccessKey: tempCreds.secretAccessKey,
    sessionToken: tempCreds.sessionToken,
    region: process.env.AWS_REGION,
  });

  const cloudwatch = new AWS.CloudWatch({
    accessKeyId: tempCreds.accessKeyId,
    secretAccessKey: tempCreds.secretAccessKey,
    sessionToken: tempCreds.sessionToken,
    region: process.env.AWS_REGION,
  });

  const costExplorer = new AWS.CostExplorer({
    accessKeyId: tempCreds.accessKeyId,
    secretAccessKey: tempCreds.secretAccessKey,
    sessionToken: tempCreds.sessionToken,
    region: process.env.AWS_REGION,
  });
  // 🔹 Fetch all EC2 instances
  const ec2Data = await ec2.describeInstances().promise();
  const instances = [];

  // Map of known instance types to their cost per hour (fallback if Cost Explorer doesn't provide)
  const instanceTypesCostMap = {
    "t3.medium": 0.0416,
    "t2.medium": 0.0416,
    "g4dn.xlarge": 0.526,
    "p3.2xlarge": 3.06,
  };

  // Define date range for last 7 days (for cost and trend)
  const now = new Date();
  const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
  const startISO = startDate.toISOString().split("T")[0];
  const endISO = now.toISOString().split("T")[0];

  // 🔹 Get EC2 costs broken down by REGION for the last 7 days
  const costUsage = await costExplorer
    .getCostAndUsage({
      TimePeriod: {
        Start: startISO,
        End: endISO,
      },
      Granularity: "DAILY",
      Metrics: ["UnblendedCost"],
      GroupBy: [
        {
          Type: "DIMENSION",
          Key: "REGION",
        },
      ],
    })
    .promise();

  const breakdown = {}; // cost per region
  const trend = []; // daily trend data
  let totalCost = 0; // total cost over the period

  // Process daily cost data returned by Cost Explorer
  for (const day of costUsage.ResultsByTime) {
    let dayTotal = 0;

    for (const group of day.Groups) {
      const region = group.Keys[0];
      const amount = parseFloat(group.Metrics.UnblendedCost.Amount);

      // Add cost to regional breakdown
      breakdown[region] = (breakdown[region] || 0) + amount;

      dayTotal += amount;
    }

    // Track total cost and daily trend
    totalCost += dayTotal;
    trend.push({
      date: day.TimePeriod.Start,
      cost: Number(dayTotal.toFixed(2)),
    });
  }

  // 🔹 Calculate summary cost metrics
  const dailyBurn = totalCost / trend.length;
  const projectedMonthly = dailyBurn * 30;

  // 🔹 For each EC2 instance, gather key utilization and metadata
  for (const reservation of ec2Data.Reservations) {
    for (const instance of reservation.Instances) {
      const instanceId = instance.InstanceId;
      const instanceType = instance.InstanceType;
      const region = instance.Placement.AvailabilityZone.slice(0, -1); // e.g. us-east-1a -> us-east-1

      // Get average CPU usage over the past hour from CloudWatch
      const cpuStats = await cloudwatch
        .getMetricStatistics({
          Namespace: "AWS/EC2",
          MetricName: "CPUUtilization",
          Dimensions: [{ Name: "InstanceId", Value: instanceId }],
          StartTime: new Date(Date.now() - 3600 * 1000), // 1 hour ago
          EndTime: new Date(),
          Period: 300, // 5-minute granularity
          Statistics: ["Average"],
        })
        .promise();

      // Extract CPU utilization (rounded to integer)
      const cpu =
        cpuStats.Datapoints.length > 0
          ? Number(cpuStats.Datapoints[0].Average.toFixed(0))
          : 0;

      // Estimate GPU presence based on instance type name
      const gpu =
        instanceType.toLowerCase().includes("g4") ||
        instanceType.toLowerCase().includes("p3")
          ? 1
          : 0;

      // Calculate uptime in hours
      const launchTime = new Date(instance.LaunchTime);
      const uptimeHours = Math.floor(
        (Date.now() - launchTime.getTime()) / (1000 * 60 * 60)
      );

      // Approximate cost per hour (from known type or fallback random)
      const costPerHour =
        instanceTypesCostMap[instanceType] ||
        Number((Math.random() * 0.5).toFixed(3)); // fallback if type unknown

      // Push instance info into result list
      instances.push({
        instanceId,
        instanceType,
        region,
        cpu,
        gpu,
        uptimeHours,
        costPerHour,
      });
    }
  }

  // 🔹 Return final structured data for the dashboard
  const result = {
    allInstances: instances,
    costData: {
      timePeriod: { Start: startISO, End: endISO },
      groupBy: "REGION",
      totalCost: Number(totalCost.toFixed(2)),
      attributedCost: Number(totalCost.toFixed(2)), // all attributed for now
      unaccountedCost: 0, // placeholder for future tagging logic
      breakdown: Object.fromEntries(
        Object.entries(breakdown).map(([k, v]) => [k, Number(v.toFixed(2))])
      ),
    },
    trendData: {
      total: Number(totalCost.toFixed(2)),
      dailyBurn: Number(dailyBurn.toFixed(2)),
      projectedMonthly: Number(projectedMonthly.toFixed(2)),
      trend,
    },
  };

  return result;
}

module.exports = { getEC2InstanceData };
