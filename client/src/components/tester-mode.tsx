import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { TestTubeDiagonal, Upload, Settings, Play, FileCode, CheckCircle, AlertTriangle, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import FileUpload from "./file-upload";
import type { TestResult, TestSummary } from "@/lib/types";

export default function TesterMode() {
  const [pushSwapFile, setPushSwapFile] = useState<File | null>(null);
  const [checkerFile, setCheckerFile] = useState<File | null>(null);
  const [listSize, setListSize] = useState(100);
  const [maxOperations, setMaxOperations] = useState(700);
  const [testCount, setTestCount] = useState(100);
  const [showArgs, setShowArgs] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [summary, setSummary] = useState<TestSummary | null>(null);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const testMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/api/test', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Test failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setTestResults(data.details);
      setSummary(data.summary);
      setProgress(100);
      toast({
        title: "Tests terminés",
        description: `${data.summary.validationPassed}/${data.summary.totalTests} tests de validation réussis`,
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors des tests",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!pushSwapFile || !checkerFile) {
      toast({
        title: "Fichiers manquants",
        description: "Veuillez sélectionner les fichiers push_swap et checker",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append('pushSwapFile', pushSwapFile);
    formData.append('checkerFile', checkerFile);
    formData.append('listSize', listSize.toString());
    formData.append('maxOperations', maxOperations.toString());
    formData.append('testCount', testCount.toString());
    formData.append('showArgs', showArgs.toString());

    setProgress(0);
    setTestResults([]);
    setSummary(null);
    testMutation.mutate(formData);
  };

  const isFormValid = pushSwapFile && checkerFile;

  return (
    <section className="w-full max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2 flex items-center justify-center">
          <TestTubeDiagonal className="text-teal-400 mr-3" />
          Mode Testeur
        </h2>
        <p className="text-gray-400 text-lg">Testez rigoureusement votre implémentation push_swap</p>
      </div>

      {/* Configuration Form */}
      <Card className="bg-gray-800 border-gray-700 mb-8">
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* File Upload Section */}
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-white flex items-center mb-4">
                  <Upload className="text-teal-400 mr-2" />
                  Fichiers Exécutables
                </h3>
                
                <FileUpload
                  label="1. Exécutable push_swap"
                  icon={<FileCode className="w-16 h-16 text-gray-400 mx-auto mb-4" />}
                  onFileSelect={setPushSwapFile}
                />

                <FileUpload
                  label="2. Binaire checker"
                  icon={<CheckCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />}
                  onFileSelect={setCheckerFile}
                />
              </div>

              {/* Parameters Section */}
              <Card className="bg-gray-900 border-gray-600">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-white flex items-center">
                    <Settings className="text-teal-400 mr-2" />
                    Paramètres de Test
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="list-size" className="text-gray-300 mb-2 block">
                      Taille de la liste
                    </Label>
                    <Input
                      id="list-size"
                      type="number"
                      min="3"
                      max="1000"
                      value={listSize}
                      onChange={(e) => setListSize(parseInt(e.target.value))}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="max-ops" className="text-gray-300 mb-2 block">
                      Opérations maximum
                    </Label>
                    <Input
                      id="max-ops"
                      type="number"
                      min="1"
                      max="10000"
                      value={maxOperations}
                      onChange={(e) => setMaxOperations(parseInt(e.target.value))}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="test-count" className="text-gray-300 mb-2 block">
                      Nombre de tests
                    </Label>
                    <Input
                      id="test-count"
                      type="number"
                      min="1"
                      max="1000"
                      value={testCount}
                      onChange={(e) => setTestCount(parseInt(e.target.value))}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Options and Action */}
            <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-gray-700 space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="show-args"
                  checked={showArgs}
                  onCheckedChange={(checked) => setShowArgs(checked as boolean)}
                />
                <Label htmlFor="show-args" className="text-sm text-gray-300">
                  Afficher les arguments si échec
                </Label>
              </div>
              <Button
                type="submit"
                disabled={!isFormValid || testMutation.isPending}
                className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-bold py-3 px-8 rounded-lg transition-all shadow-lg"
              >
                {testMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Tests en cours...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Lancer les tests
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Test Results */}
      <div className="space-y-6">
        {/* Progress Section */}
        {testMutation.isPending && (
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-teal-400 mr-2"></div>
                Tests en cours...
              </h3>
              <Progress value={progress} className="w-full" />
            </CardContent>
          </Card>
        )}

        {/* Results Summary */}
        {summary && (
          <div className="grid md:grid-cols-2 gap-6">
            <Card className={`test-result-card ${summary.validationRate >= 90 ? 'success' : 'error'} border-gray-700`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-white">Test de Validation</h4>
                  <span className={`text-2xl ${summary.validationRate >= 90 ? 'text-green-400' : 'text-red-400'}`}>
                    {summary.validationRate >= 90 ? <CheckCircle /> : <AlertTriangle />}
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-300">
                    Résultat: <span className={`font-semibold ${summary.validationRate >= 90 ? 'text-green-400' : 'text-red-400'}`}>
                      {summary.validationRate >= 90 ? '✓ OK' : '✗ KO'}
                    </span>
                  </p>
                  <p className="text-gray-300">
                    Tests réussis: <span className="text-white font-semibold">{summary.validationPassed}/{summary.totalTests}</span>
                  </p>
                  <p className="text-gray-300">
                    Taux de réussite: <span className={`font-semibold ${summary.validationRate >= 90 ? 'text-green-400' : 'text-red-400'}`}>
                      {summary.validationRate}%
                    </span>
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className={`test-result-card ${summary.performanceRate >= 90 ? 'success' : 'error'} border-gray-700`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-white">Test de Performance</h4>
                  <span className={`text-2xl ${summary.performanceRate >= 90 ? 'text-green-400' : 'text-red-400'}`}>
                    {summary.performanceRate >= 90 ? <TrendingUp /> : <AlertTriangle />}
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-300">
                    Résultat: <span className={`font-semibold ${summary.performanceRate >= 90 ? 'text-green-400' : 'text-red-400'}`}>
                      {summary.performanceRate >= 90 ? '✓ OK' : '✗ KO'}
                    </span>
                  </p>
                  <p className="text-gray-300">
                    Tests réussis: <span className="text-white font-semibold">{summary.performancePassed}/{summary.totalTests}</span>
                  </p>
                  <p className="text-gray-300">
                    Taux de réussite: <span className={`font-semibold ${summary.performanceRate >= 90 ? 'text-green-400' : 'text-red-400'}`}>
                      {summary.performanceRate}%
                    </span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Detailed Results */}
        {testResults.length > 0 && (
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Résultats détaillés</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {testResults.map((result, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <span className="text-gray-300">Test {result.test}</span>
                      <span className={`text-sm ${result.validation ? 'text-green-400' : 'text-red-400'}`}>
                        {result.validation ? '✓ Valide' : '✗ Invalide'}
                      </span>
                      <span className={`text-sm ${result.performanceValid ? 'text-green-400' : 'text-red-400'}`}>
                        {result.operations} ops {result.performanceValid ? '✓' : '✗'}
                      </span>
                    </div>
                    {result.error && (
                      <span className="text-red-400 text-sm">{result.error}</span>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
}
