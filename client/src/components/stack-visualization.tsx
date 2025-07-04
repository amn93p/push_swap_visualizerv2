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
  const [movingElement, setMovingElement] = useState<{ value: number; from: 'a' | 'b'; to: 'a' | 'b' } | null>(null);

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
    let elementToAnimate: number | null = null;
    let animationType: 'swap' | 'move-left' | 'move-right' | 'rotate' = 'swap';
    
    switch (operation) {
      case 'sa':
        if (newState.a.length >= 2) {
          [newState.a[0], newState.a[1]] = [newState.a[1], newState.a[0]];
          setAnimatingElements(new Set([newState.a[0], newState.a[1]]));
          animationType = 'swap';
        }
        break;
      case 'sb':
        if (newState.b.length >= 2) {
          [newState.b[0], newState.b[1]] = [newState.b[1], newState.b[0]];
          setAnimatingElements(new Set([newState.b[0], newState.b[1]]));
          animationType = 'swap';
        }
        break;
      case 'ss':
        const elementsToSwap = new Set<number>();
        if (newState.a.length >= 2) {
          [newState.a[0], newState.a[1]] = [newState.a[1], newState.a[0]];
          elementsToSwap.add(newState.a[0]);
          elementsToSwap.add(newState.a[1]);
        }
        if (newState.b.length >= 2) {
          [newState.b[0], newState.b[1]] = [newState.b[1], newState.b[0]];
          elementsToSwap.add(newState.b[0]);
          elementsToSwap.add(newState.b[1]);
        }
        setAnimatingElements(elementsToSwap);
        animationType = 'swap';
        break;
      case 'pa':
        if (newState.b.length > 0) {
          const element = newState.b.shift()!;
          newState.a.unshift(element);
          elementToAnimate = element;
          animationType = 'move-left';
          setMovingElement({ value: element, from: 'b', to: 'a' });
        }
        break;
      case 'pb':
        if (newState.a.length > 0) {
          const element = newState.a.shift()!;
          newState.b.unshift(element);
          elementToAnimate = element;
          animationType = 'move-right';
          setMovingElement({ value: element, from: 'a', to: 'b' });
        }
        break;
      case 'ra':
        if (newState.a.length > 0) {
          const element = newState.a.shift()!;
          newState.a.push(element);
          elementToAnimate = element;
          animationType = 'rotate';
        }
        break;
      case 'rb':
        if (newState.b.length > 0) {
          const element = newState.b.shift()!;
          newState.b.push(element);
          elementToAnimate = element;
          animationType = 'rotate';
        }
        break;
      case 'rr':
        const elementsToRotate = new Set<number>();
        if (newState.a.length > 0) {
          const element = newState.a.shift()!;
          newState.a.push(element);
          elementsToRotate.add(element);
        }
        if (newState.b.length > 0) {
          const element = newState.b.shift()!;
          newState.b.push(element);
          elementsToRotate.add(element);
        }
        setAnimatingElements(elementsToRotate);
        animationType = 'rotate';
        break;
      case 'rra':
        if (newState.a.length > 0) {
          const element = newState.a.pop()!;
          newState.a.unshift(element);
          elementToAnimate = element;
          animationType = 'rotate';
        }
        break;
      case 'rrb':
        if (newState.b.length > 0) {
          const element = newState.b.pop()!;
          newState.b.unshift(element);
          elementToAnimate = element;
          animationType = 'rotate';
        }
        break;
      case 'rrr':
        const elementsToRRotate = new Set<number>();
        if (newState.a.length > 0) {
          const element = newState.a.pop()!;
          newState.a.unshift(element);
          elementsToRRotate.add(element);
        }
        if (newState.b.length > 0) {
          const element = newState.b.pop()!;
          newState.b.unshift(element);
          elementsToRRotate.add(element);
        }
        setAnimatingElements(elementsToRRotate);
        animationType = 'rotate';
        break;
    }

    // Set single element animation for move operations
    if (elementToAnimate && (animationType === 'move-left' || animationType === 'move-right' || animationType === 'rotate')) {
      setAnimatingElements(new Set([elementToAnimate]));
    }

    onStackStateChange(newState);
    
    // Clear animations after delay
    setTimeout(() => {
      setAnimatingElements(new Set());
      setMovingElement(null);
    }, 800);
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
          stack.map((number, index) => {
            const isAnimating = animatingElements.has(number);
            const isMoving = movingElement?.value === number;
            
            let animationClass = '';
            if (isAnimating) {
              if (isMoving) {
                // Determine direction based on move operation
                const currentOp = operations[currentOperation - 1];
                if (currentOp === 'pa') {
                  animationClass = 'moving-left';
                } else if (currentOp === 'pb') {
                  animationClass = 'moving-right';
                }
              } else {
                // For swap and rotate operations
                const currentOp = operations[currentOperation - 1];
                if (currentOp?.startsWith('s')) {
                  animationClass = 'swapping';
                } else if (currentOp?.startsWith('r')) {
                  animationClass = 'rotating';
                }
              }
            }
            
            return (
              <div
                key={`${number}-${index}`}
                className={`stack-element p-3 rounded-lg text-center font-mono text-lg ${animationClass}`}
                style={{
                  position: 'relative',
                  overflow: 'visible'
                }}
              >
                {number}
              </div>
            );
          })
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
