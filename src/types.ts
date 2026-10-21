export interface SimulationParams {
  initialBacklog: number;
  arrivalRate: number;
  serviceRateDays: number;
  numEquipments: number;
}

export interface ScenarioConfig {
  id: string;
  name: string;
  arrivalRate: number;
  numEquipments: number;
  color: string;
  accentBg: string;
}

export interface SimulationResults {
  isStable: boolean;
  utilization: number;
  requiredEquipments: number;
  deterministicDaysToClear: number | null;
  confidenceLevel: number;
  monteCarloStats: {
    meanDays: number | null;
    p5Days: number | null;
    p95Days: number | null;
    lowerDays: number | null;
    upperDays: number | null;
    successRate: number;
  };
  chartData: Array<{
    day: number;
    meanBacklog: number;
    lowerBacklog: number;
    upperBacklog: number;
    p5Backlog: number;
    p95Backlog: number;
  }>;
}

export interface MergedDataPoint {
  day: number;
  s1_mean: number;
  s1_lower: number;
  s1_upper: number;
  s2_mean: number;
  s2_lower: number;
  s2_upper: number;
  s3_mean: number;
  s3_lower: number;
  s3_upper: number;
}

