import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const testResults = pgTable("test_results", {
  id: serial("id").primaryKey(),
  listSize: integer("list_size").notNull(),
  maxOperations: integer("max_operations").notNull(),
  testCount: integer("test_count").notNull(),
  validationTests: integer("validation_tests").notNull(),
  performanceTests: integer("performance_tests").notNull(),
  validationPassed: integer("validation_passed").notNull(),
  performancePassed: integer("performance_passed").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const visualizations = pgTable("visualizations", {
  id: serial("id").primaryKey(),
  listSize: integer("list_size").notNull(),
  operations: text("operations").notNull(),
  numbers: text("numbers").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertTestResultSchema = createInsertSchema(testResults).omit({
  id: true,
  createdAt: true,
});

export const insertVisualizationSchema = createInsertSchema(visualizations).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type TestResult = typeof testResults.$inferSelect;
export type InsertTestResult = z.infer<typeof insertTestResultSchema>;
export type Visualization = typeof visualizations.$inferSelect;
export type InsertVisualization = z.infer<typeof insertVisualizationSchema>;
