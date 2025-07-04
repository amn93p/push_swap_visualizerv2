import { useState } from "react";
import { Code, TestTubeDiagonal, Eye } from "lucide-react";
import TesterMode from "@/components/tester-mode";
import VisualizerMode from "@/components/visualizer-mode";

export default function Home() {
  const [activeTab, setActiveTab] = useState<'tester' | 'visualizer'>('tester');

  return (
    <div className="min-h-screen text-gray-50">
      {/* Navigation Header */}
      <nav className="glass-effect p-4 sticky top-0 z-50 border-b border-gray-700">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Code className="text-2xl text-teal-400" />
            <h1 className="text-2xl font-bold text-white">
              PushSwap<span className="text-teal-400">.tools</span>
            </h1>
          </div>
          <div className="flex items-center space-x-2 p-1 bg-gray-800 rounded-lg">
            <button
              onClick={() => setActiveTab('tester')}
              className={`tab px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:bg-gray-700 flex items-center space-x-2 ${
                activeTab === 'tester' ? 'active' : 'text-gray-300'
              }`}
            >
              <TestTubeDiagonal className="w-4 h-4" />
              <span>Tester</span>
            </button>
            <button
              onClick={() => setActiveTab('visualizer')}
              className={`tab px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:bg-gray-700 flex items-center space-x-2 ${
                activeTab === 'visualizer' ? 'active' : 'text-gray-300'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>Visualizer</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="p-4 sm:p-6 lg:p-8">
        {activeTab === 'tester' && <TesterMode />}
        {activeTab === 'visualizer' && <VisualizerMode />}
      </main>
    </div>
  );
}
