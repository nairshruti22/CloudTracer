export const allInstances = [
  {
    instanceId: "i-abc123",
    instanceType: "g4dn.xlarge",
    region: "us-east-1",
    cpu: 12,
    gpu: 0,
    uptimeHours: 48,
    costPerHour: 0.526,
  },
  {
    instanceId: "i-abc123",
    instanceType: "g4dn.xlarge",
    region: "us-east-1",
    cpu: 19,
    gpu: 0,
    uptimeHours: 18,
    costPerHour: 0.526,
  },
  {
    instanceId: "i-def456",
    instanceType: "t3.medium",
    region: "us-west-2",
    cpu: 72,
    gpu: 0,
    uptimeHours: 5,
    costPerHour: 0.0416,
  },
  {
    instanceId: "i-xyz789",
    instanceType: "p3.2xlarge",
    region: "us-east-1",
    cpu: 9,
    gpu: 1,
    uptimeHours: 24,
    costPerHour: 3.06,
  },
  {
    instanceId: "i-def456",
    instanceType: "t2.medium",
    region: "us-west-2",
    cpu: 12,
    gpu: 0,
    uptimeHours: 51,
    costPerHour: 0.0416,
  },
];

export const costData = {
  timePeriod: { Start: "2025-07-01", End: "2025-07-07" },
  groupBy: "REGION",
  totalCost: "123.45",
  attributedCost: "120.00",
  unaccountedCost: "3.45",
  breakdown: {
    "us-east-1": 80.5,
    "us-west-2": 39.5,
  },
};

export const trendData = {
  total: 955,
  dailyBurn: 137,
  projectedMonthly: 4110,
  trend: [
    { date: "2025-08-07", cost: 90 },
    { date: "2025-08-08", cost: 100 },
    { date: "2025-08-09", cost: 110 },
    { date: "2025-08-10", cost: 210 },
    { date: "2025-08-11", cost: 105 },
    { date: "2025-08-12", cost: 120 },
    { date: "2025-08-13", cost: 220 },
  ],
};
