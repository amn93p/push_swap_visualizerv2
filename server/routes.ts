import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import { exec } from "child_process";
import { promises as fs } from "fs";
import path from "path";
import { insertTestResultSchema, insertVisualizationSchema } from "@shared/schema";
import { z } from "zod";

const upload = multer({ dest: 'uploads/' });

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Test push_swap implementation
  app.post('/api/test', upload.fields([
    { name: 'pushSwapFile', maxCount: 1 },
    { name: 'checkerFile', maxCount: 1 }
  ]), async (req, res) => {
    try {
      const { listSize, maxOperations, testCount } = req.body;
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      
      if (!files.pushSwapFile || !files.checkerFile) {
        return res.status(400).json({ error: 'Both push_swap and checker files are required' });
      }

      const pushSwapFile = files.pushSwapFile[0];
      const checkerFile = files.checkerFile[0];

      // Make files executable
      await fs.chmod(pushSwapFile.path, 0o755);
      await fs.chmod(checkerFile.path, 0o755);

      let validationPassed = 0;
      let performancePassed = 0;
      const testResults = [];

      for (let i = 0; i < parseInt(testCount); i++) {
        try {
          // Generate random unique numbers
          const numbers = new Set<number>();
          while (numbers.size < parseInt(listSize)) {
            numbers.add(Math.floor(Math.random() * (parseInt(listSize) * 10)) + 1);
          }
          const args = Array.from(numbers).join(' ');

          // Validation test
          const validationResult = await new Promise<string>((resolve, reject) => {
            exec(`"${pushSwapFile.path}" ${args} | "${checkerFile.path}" ${args}`, 
              (error, stdout, stderr) => {
                if (error) {
                  reject(new Error(`Command failed: ${error.message}`));
                } else {
                  resolve(stdout.trim());
                }
              });
          });

          const isValid = validationResult === 'OK';
          if (isValid) validationPassed++;

          // Performance test
          const operationsResult = await new Promise<number>((resolve, reject) => {
            exec(`"${pushSwapFile.path}" ${args} | wc -l`, 
              (error, stdout, stderr) => {
                if (error) {
                  reject(new Error(`Command failed: ${error.message}`));
                } else {
                  resolve(parseInt(stdout.trim()));
                }
              });
          });

          const performanceValid = operationsResult <= parseInt(maxOperations);
          if (performanceValid) performancePassed++;

          testResults.push({
            test: i + 1,
            validation: isValid,
            operations: operationsResult,
            performanceValid,
            args: req.body.showArgs ? args : undefined
          });

        } catch (error) {
          console.error(`Test ${i + 1} failed:`, error);
          testResults.push({
            test: i + 1,
            validation: false,
            operations: 0,
            performanceValid: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      // Clean up files
      await fs.unlink(pushSwapFile.path);
      await fs.unlink(checkerFile.path);

      // Store results
      const testResult = await storage.createTestResult({
        listSize: parseInt(listSize),
        maxOperations: parseInt(maxOperations),
        testCount: parseInt(testCount),
        validationTests: parseInt(testCount),
        performanceTests: parseInt(testCount),
        validationPassed,
        performancePassed
      });

      res.json({
        testResult,
        details: testResults,
        summary: {
          validationPassed,
          performancePassed,
          totalTests: parseInt(testCount),
          validationRate: Math.round((validationPassed / parseInt(testCount)) * 100),
          performanceRate: Math.round((performancePassed / parseInt(testCount)) * 100)
        }
      });

    } catch (error) {
      console.error('Test error:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Test failed' });
    }
  });

  // Visualize push_swap execution
  app.post('/api/visualize', upload.single('pushSwapFile'), async (req, res) => {
    try {
      const { listSize } = req.body;
      const file = req.file;
      
      if (!file) {
        return res.status(400).json({ error: 'push_swap file is required' });
      }

      // Make file executable
      await fs.chmod(file.path, 0o755);

      // Generate random unique numbers
      const numbers = new Set<number>();
      while (numbers.size < parseInt(listSize)) {
        numbers.add(Math.floor(Math.random() * (parseInt(listSize) * 10)) + 1);
      }
      const numbersArray = Array.from(numbers);
      const args = numbersArray.join(' ');

      // Get operations
      const operations = await new Promise<string>((resolve, reject) => {
        exec(`"${file.path}" ${args}`, 
          (error, stdout, stderr) => {
            if (error) {
              reject(new Error(`Command failed: ${error.message}`));
            } else {
              resolve(stdout.trim());
            }
          });
      });

      // Clean up file
      await fs.unlink(file.path);

      // Store visualization
      const visualization = await storage.createVisualization({
        listSize: parseInt(listSize),
        operations,
        numbers: args
      });

      res.json({
        visualization,
        numbers: numbersArray,
        operations: operations.split('\n').filter(op => op.trim() !== '')
      });

    } catch (error) {
      console.error('Visualization error:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Visualization failed' });
    }
  });

  // Get test results
  app.get('/api/test-results', async (req, res) => {
    try {
      const results = await storage.getTestResults();
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch test results' });
    }
  });

  // Get visualizations
  app.get('/api/visualizations', async (req, res) => {
    try {
      const visualizations = await storage.getVisualizations();
      res.json(visualizations);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch visualizations' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
