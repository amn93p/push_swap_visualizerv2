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
    }, Math.max(animationSpeed, 500));

    return () => clearTimeout(timer);
  }, [isPlaying, currentOperation, operations, animationSpeed]);

  const animateChange = () => {
    // Get all stack elements before the change
    const allElements = document.querySelectorAll('.stack-element');
    const beforePositions = new Map<string, DOMRect>();
    
    allElements.forEach((element) => {
      const rect = element.getBoundingClientRect();
      const key = element.textContent || '';
      beforePositions.set(key, rect);
    });

    // Apply the state change immediately
    onStackStateChange({ ...stackState });

    // Get new positions after DOM update
    requestAnimationFrame(() => {
      const allElementsAfter = document.querySelectorAll('.stack-element');
      
      allElementsAfter.forEach((element) => {
        const key = element.textContent || '';
        const beforeRect = beforePositions.get(key);
        const afterRect = element.getBoundingClientRect();
        
        if (beforeRect) {
          const deltaX = beforeRect.left - afterRect.left;
          const deltaY = beforeRect.top - afterRect.top;
          
          // Only animate if there's significant movement
          if (Math.abs(deltaX) > 0.1 || Math.abs(deltaY) > 0.1) {
            element.classList.add('animating');
            
            // Apply the FLIP animation
            (element as HTMLElement).style.transform = `translate(${deltaX}px, ${deltaY}px)`;
            (element as HTMLElement).style.transition = 'transform 0s';
            
            requestAnimationFrame(() => {
              (element as HTMLElement).style.transform = '';
              (element as HTMLElement).style.transition = `transform ${animationSpeed / 1000}s cubic-bezier(0.4, 0, 0.2, 1)`;
            });
            
            // Clean up after animation
            setTimeout(() => {
              element.classList.remove('animating');
              (element as HTMLElement).style.transform = '';
              (element as HTMLElement).style.transition = '';
            }, animationSpeed);
          }
        }
      });
    });
  };

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
        }
        break;
      case 'pb':
        if (newState.a.length > 0) {
          const element = newState.a.shift()!;
          newState.b.unshift(element);
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

    // Store the new state to be applied during animation
    stackState = newState;
    animateChange();
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
              className="stack-element p-3 rounded-lg text-center font-mono text-lg"
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
      {/* Status Display - Moved to top */}
      <div className="text-center">
        <div className="inline-flex items-center space-x-4 bg-gray-900 px-8 py-4 rounded-xl border border-gray-600 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className={`w-4 h-4 rounded-full transition-all duration-300 ${
              currentOperation >= operations.length 
                ? (isSorted() ? 'bg-green-500 shadow-lg shadow-green-500/50' : 'bg-red-500 shadow-lg shadow-red-500/50')
                : 'bg-yellow-500 animate-pulse shadow-lg shadow-yellow-500/50'
            }`}></div>
            <span className={`font-semibold text-lg ${
              currentOperation >= operations.length 
                ? (isSorted() ? 'text-green-400' : 'text-red-400')
                : 'text-yellow-400'
            }`}>
              {currentOperation >= operations.length 
                ? (isSorted() ? 'Tri terminé avec succès ✓' : 'Tri terminé avec échec ✗')
                : 'Tri en cours...'}
            </span>
          </div>
          {currentOperation < operations.length && (
            <div className="flex items-center space-x-2 text-gray-400">
              <span className="text-sm">Progression:</span>
              <span className="text-white font-mono">
                {currentOperation} / {operations.length}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Stacks Visualization */}
      <div className="grid md:grid-cols-2 gap-8">
        {renderStack(stackState.a, "Pile A", "text-blue-400")}
        {renderStack(stackState.b, "Pile B", "text-purple-400")}
      </div>
    </div>
  );
}
