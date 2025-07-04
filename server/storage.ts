import { users, testResults, visualizations, type User, type InsertUser, type TestResult, type InsertTestResult, type Visualization, type InsertVisualization } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createTestResult(testResult: InsertTestResult): Promise<TestResult>;
  createVisualization(visualization: InsertVisualization): Promise<Visualization>;
  getTestResults(): Promise<TestResult[]>;
  getVisualizations(): Promise<Visualization[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private testResults: Map<number, TestResult>;
  private visualizations: Map<number, Visualization>;
  private currentUserId: number;
  private currentTestResultId: number;
  private currentVisualizationId: number;

  constructor() {
    this.users = new Map();
    this.testResults = new Map();
    this.visualizations = new Map();
    this.currentUserId = 1;
    this.currentTestResultId = 1;
    this.currentVisualizationId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createTestResult(insertTestResult: InsertTestResult): Promise<TestResult> {
    const id = this.currentTestResultId++;
    const testResult: TestResult = { 
      ...insertTestResult, 
      id,
      createdAt: new Date()
    };
    this.testResults.set(id, testResult);
    return testResult;
  }

  async createVisualization(insertVisualization: InsertVisualization): Promise<Visualization> {
    const id = this.currentVisualizationId++;
    const visualization: Visualization = { 
      ...insertVisualization, 
      id,
      createdAt: new Date()
    };
    this.visualizations.set(id, visualization);
    return visualization;
  }

  async getTestResults(): Promise<TestResult[]> {
    return Array.from(this.testResults.values());
  }

  async getVisualizations(): Promise<Visualization[]> {
    return Array.from(this.visualizations.values());
  }
}

export const storage = new MemStorage();
