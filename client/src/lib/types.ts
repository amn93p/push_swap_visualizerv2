export interface TestResult {
  test: number;
  validation: boolean;
  operations: number;
  performanceValid: boolean;
  args?: string;
  error?: string;
}

export interface TestSummary {
  validationPassed: number;
  performancePassed: number;
  totalTests: number;
  validationRate: number;
  performanceRate: number;
}

export interface VisualizationData {
  numbers: number[];
  operations: string[];
}

export interface StackState {
  a: number[];
  b: number[];
}
