export interface FunnelStepResult {
  stepIndex: number;
  stepName: string;
  userCount: number;
  conversionPercentage: number;
  dropoffCount: number;
  dropoffPercentage: number;
}

export interface CohortMatrixCell {
  cohortDate: string;
  totalUsers: number;
  retentionByOffset: Record<number, { users: number; percentage: number }>;
}

export interface SystemLatencyPercentiles {
  serviceName: string;
  endpoint: string;
  totalRequests: number;
  errorRatePercentage: number;
  p50Ms: number;
  p95Ms: number;
  p99Ms: number;
  minMs: number;
  maxMs: number;
}
