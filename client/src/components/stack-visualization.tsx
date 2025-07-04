import { useEffect, useState } from "react";
import { Layers, Archive } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { StackState } from "@/lib/types";

interface StackVisualizationProps {
  stackState: StackState;
  onStackStateChange: (state: StackState) => void;
  operations: string[];
  currentOperation: number;
  onOperationChange: (operation: number) => void;
  isPlaying: boolean;
  animationSpeed: number;
  onComplete: () => void;
}

export default function StackVisualization({
  stackState,
  onStackStateChange,
  operations,
  currentOperation,
  onOperationChange,
  isPlaying,
  animationSpeed,
  onComplete,
}: StackVisualizationProps) {
  const [animatingElements, setAnimatingElements] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!isPlaying || currentOperation >= operations.length) {
      if (currentOperation >= operations.length) {
        onComplete();
      }
      return;
    }

    const timer = setTimeout(() => {
      executeOperation(operations[currentOperation]);
      onOperationChange(currentOperation + 1);
    }, animationSpeed);

    return () => clearTimeout(timer);
  }, [isPlaying, currentOperation, operations, animationSpeed]);

  const executeOperation = (operation: string) => {
    const newState = { ...stackState };
    
    switch (operation) {
      case 'sa':
        if (newState.a.length >= 2) {
          [newState.a[0], newState.a[1]] = [newState.a[1], newState.a[0]];
        }
        break;
      case 'sb':
        if (newState.b.length >= 2) {
          [newState.b[0], newState.b[1]] = [newState.b[1], newState.b[0]];
        }
        break;
      case 'ss':
        if (newState.a.length >= 2) {
          [newState.a[0], newState.a[1]] = [newState.a[1], newState.a[0]];
        }
        if (newState.b.length >= 2) {
          [newState.b[0], newState.b[1]] = [newState.b[1], newState.b[0]];
        }
        break;
      case 'pa':
        if (newState.b.length > 0) {
          const element = newState.b.shift()!;
          newState.a.unshift(element);
          setAnimatingElements(new Set([element]));
        }
        break;
      case 'pb':
        if (newState.a.length > 0) {
          const element = newState.a.shift()!;
          newState.b.unshift(element);
          setAnimatingElements(new Set([element]));
        }
        break;
      case 'ra':
        if (newState.a.length > 0) {
          const element = newState.a.shift()!;
          newState.a.push(element);
        }
        break;
      case 'rb':
        if (newState.b.length > 0) {
          const element = newState.b.shift()!;
          newState.b.push(element);
        }
        break;
      case 'rr':
        if (newState.a.length > 0) {
          const element = newState.a.shift()!;
          newState.a.push(element);
        }
        if (newState.b.length > 0) {
          const element = newState.b.shift()!;
          newState.b.push(element);
        }
        break;
      case 'rra':
        if (newState.a.length > 0) {
          const element = newState.a.pop()!;
          newState.a.unshift(element);
        }
        break;
      case 'rrb':
        if (newState.b.length > 0) {
          const element = newState.b.pop()!;
          newState.b.unshift(element);
        }
        break;
      case 'rrr':
        if (newState.a.length > 0) {
          const element = newState.a.pop()!;
          newState.a.unshift(element);
        }
        if (newState.b.length > 0) {
          const element = newState.b.pop()!;
          newState.b.unshift(element);
        }
        break;
    }

    onStackStateChange(newState);
    
    // Clear animation after a short delay
    setTimeout(() => {
      setAnimatingElements(new Set());
    }, 200);
  };

  const renderStack = (stack: number[], label: string, color: string) => (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-white text-center flex items-center justify-center">
        <Layers className={`mr-2 ${color}`} />
        {label}
      </h3>
      <div className="stack-container min-h-96 p-4 rounded-xl space-y-2">
        {stack.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <Archive className="w-16 h-16 mx-auto mb-2" />
            <p>Pile vide</p>
          </div>
        ) : (
          stack.map((number, index) => (
            <div
              key={`${number}-${index}`}
              className={`stack-element p-3 rounded-lg text-center font-mono text-lg transition-all duration-300 ${
                animatingElements.has(number) ? 'moving' : ''
              }`}
            >
              {number}
            </div>
          ))
        )}
      </div>
    </div>
  );

  const isSorted = () => {
    if (stackState.b.length > 0) return false;
    for (let i = 0; i < stackState.a.length - 1; i++) {
      if (stackState.a[i] > stackState.a[i + 1]) return false;
    }
    return true;
  };

  return (
    <div className="space-y-8">
      {/* Stacks Visualization */}
      <div className="grid md:grid-cols-2 gap-8">
        {renderStack(stackState.a, "Pile A", "text-blue-400")}
        {renderStack(stackState.b, "Pile B", "text-purple-400")}
      </div>

      {/* Status Display */}
      <div className="text-center">
        <div className="inline-flex items-center space-x-3 bg-gray-900 px-6 py-3 rounded-lg border border-gray-600">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              currentOperation >= operations.length 
                ? (isSorted() ? 'bg-green-500' : 'bg-red-500')
                : 'bg-yellow-500 animate-pulse'
            }`}></div>
            <span className="text-gray-300">
              {currentOperation >= operations.length 
                ? (isSorted() ? 'Tri terminé avec succès ✓' : 'Tri terminé avec échec ✗')
                : 'Tri en cours...'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
