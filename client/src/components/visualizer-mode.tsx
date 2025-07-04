import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Eye, Upload, Settings, Play, Pause, RotateCcw, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import FileUpload from "./file-upload";
import StackVisualization from "./stack-visualization";
import type { VisualizationData, StackState } from "@/lib/types";

export default function VisualizerMode() {
  const [pushSwapFile, setPushSwapFile] = useState<File | null>(null);
  const [listSize, setListSize] = useState([5]);
  const [animationSpeed, setAnimationSpeed] = useState([500]);
  const [visualizationData, setVisualizationData] = useState<VisualizationData | null>(null);
  const [currentOperation, setCurrentOperation] = useState(0);
  const [stackState, setStackState] = useState<StackState>({ a: [], b: [] });
  const [isPlaying, setIsPlaying] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const { toast } = useToast();

  const visualizeMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/api/visualize', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Visualization failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setVisualizationData({
        numbers: data.numbers,
        operations: data.operations,
      });
      setStackState({ a: data.numbers, b: [] });
      setCurrentOperation(0);
      setIsComplete(false);
      setIsPlaying(true); // Auto-start the animation
      toast({
        title: "Visualisation générée",
        description: `${data.operations.length} opérations à exécuter`,
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors de la visualisation",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!pushSwapFile) {
      toast({
        title: "Fichier manquant",
        description: "Veuillez sélectionner le fichier push_swap",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append('pushSwapFile', pushSwapFile);
    formData.append('listSize', listSize[0].toString());

    visualizeMutation.mutate(formData);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    if (visualizationData) {
      setStackState({ a: visualizationData.numbers, b: [] });
      setCurrentOperation(0);
      setIsPlaying(false);
      setIsComplete(false);
    }
  };

  const isFormValid = pushSwapFile !== null;

  return (
    <section className="w-full max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2 flex items-center justify-center">
          <Eye className="text-cyan-400 mr-3" />
          Mode Visualiseur
        </h2>
        <p className="text-gray-400 text-lg">Visualisez l'exécution de votre algorithme push_swap</p>
      </div>

      {/* Configuration Form */}
      <Card className="bg-gray-800 border-gray-700 mb-8">
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid md:grid-cols-3 gap-8">
              {/* File Upload */}
              <FileUpload
                label="1. Exécutable push_swap"
                onFileSelect={setPushSwapFile}
                className="bg-gray-900 border-gray-600"
              />

              {/* List Size */}
              <Card className="bg-gray-900 border-gray-600">
                <CardContent className="p-6">
                  <Label className="text-gray-300 mb-4 block">
                    2. Nombres à trier
                  </Label>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <Slider
                        value={listSize}
                        onValueChange={setListSize}
                        min={3}
                        max={500}
                        step={1}
                        className="flex-1"
                      />
                      <span className="w-16 text-center bg-gray-700 rounded-lg py-2 px-3 text-white font-semibold">
                        {listSize[0]}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 flex justify-between">
                      <span>3</span>
                      <span>500</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Animation Speed */}
              <Card className="bg-gray-900 border-gray-600">
                <CardContent className="p-6">
                  <Label className="text-gray-300 mb-4 block">
                    3. Vitesse d'animation
                  </Label>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <Slider
                        value={animationSpeed}
                        onValueChange={setAnimationSpeed}
                        min={50}
                        max={1000}
                        step={50}
                        className="flex-1"
                      />
                      <span className="w-20 text-center bg-gray-700 rounded-lg py-2 px-3 text-white font-semibold">
                        {animationSpeed[0]}ms
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 flex justify-between">
                      <span>Rapide</span>
                      <span>Lent</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Action Button */}
            <div className="text-center">
              <Button
                type="submit"
                disabled={!isFormValid || visualizeMutation.isPending}
                className="bg-gradient-to-r from-cyan-500 to-cyan-700 hover:from-cyan-600 hover:to-cyan-800 text-white font-bold py-3 px-8 rounded-lg text-lg transition-all shadow-lg"
              >
                {visualizeMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Génération...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Générer & Visualiser
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Visualization Container */}
      {visualizationData && (
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-8">
            {/* Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between mb-8 space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-6">
                <div className="operation-display flex items-center">
                  <Code2 className="w-4 h-4 mr-2" />
                  <span>
                    {visualizationData.operations[currentOperation] || 'Terminé'}
                  </span>
                </div>
                <div className="text-gray-300">
                  Opération: <span className="text-white font-semibold">{currentOperation + 1}</span> / 
                  <span className="text-gray-400 ml-1">{visualizationData.operations.length}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <Button
                  onClick={handlePlayPause}
                  disabled={isComplete}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-4 h-4 mr-2" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      {isComplete ? 'Terminé' : 'Reprendre'}
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleReset}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              </div>
            </div>

            {/* Stack Visualization */}
            <StackVisualization
              stackState={stackState}
              onStackStateChange={setStackState}
              operations={visualizationData.operations}
              currentOperation={currentOperation}
              onOperationChange={setCurrentOperation}
              isPlaying={isPlaying}
              animationSpeed={animationSpeed[0]}
              onComplete={() => {
                setIsComplete(true);
                setIsPlaying(false);
              }}
            />
          </CardContent>
        </Card>
      )}
    </section>
  );
}
