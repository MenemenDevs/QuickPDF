
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ScanResult, AppState } from './types';
import CameraView from './components/CameraView';
import ScanReview from './components/ScanReview';
import HistoryView from './components/HistoryView';
import { 
  PlusIcon, 
  ClockIcon, 
  SparklesIcon, 
  Cog6ToothIcon 
} from '@heroicons/react/24/outline';

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<AppState>(AppState.HOME);
  const [scans, setScans] = useState<ScanResult[]>([]);
  const [activeScan, setActiveScan] = useState<Partial<ScanResult> | null>(null);
  const [isPro, setIsPro] = useState(false);

  // Load history from local storage
  useEffect(() => {
    const saved = localStorage.getItem('quickscan_history');
    if (saved) {
      try {
        setScans(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
  }, []);

  // Save history to local storage
  useEffect(() => {
    localStorage.setItem('quickscan_history', JSON.stringify(scans));
  }, [scans]);

  const handleCapture = (imageData: string) => {
    setActiveScan({
      id: crypto.randomUUID(),
      originalImage: imageData,
      createdAt: Date.now(),
    });
    setCurrentStep(AppState.REVIEW);
  };

  const handleSaveScan = (result: ScanResult) => {
    setScans(prev => [result, ...prev]);
    setCurrentStep(AppState.HOME);
    setActiveScan(null);
  };

  const deleteScan = (id: string) => {
    setScans(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-md mx-auto relative overflow-hidden shadow-2xl">
      {/* Header */}
      <header className="px-6 py-4 flex justify-between items-center bg-white border-b sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <SparklesIcon className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900">QuickScan ID</h1>
        </div>
        <button 
          onClick={() => setIsPro(!isPro)}
          className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${isPro ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-gray-100 text-gray-600 border border-gray-200'}`}
        >
          {isPro ? 'PRO ACTIVE' : 'GO PRO'}
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-24">
        {currentStep === AppState.HOME && (
          <div className="p-6 space-y-6">
            <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="text-2xl font-bold mb-2">Ready to scan?</h2>
                <p className="text-indigo-100 text-sm mb-4">Professional PDFs in just 3 taps.</p>
                <button 
                  onClick={() => setCurrentStep(AppState.SCANNING)}
                  className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-50 transition-colors"
                >
                  <PlusIcon className="w-6 h-6" />
                  New Scan
                </button>
              </div>
              <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-indigo-500 rounded-full blur-2xl opacity-50"></div>
            </div>

            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <ClockIcon className="w-5 h-5 text-indigo-500" />
                Recent Scans
              </h3>
              {scans.length > 0 && (
                <button 
                  onClick={() => setCurrentStep(AppState.HISTORY)}
                  className="text-xs font-medium text-indigo-600"
                >
                  View All
                </button>
              )}
            </div>

            {scans.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50">
                <div className="bg-gray-200 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                   <ClockIcon className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 text-sm">No recent documents found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {scans.slice(0, 4).map(scan => (
                  <div key={scan.id} className="group relative bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <img src={scan.processedImage} alt={scan.title} className="w-full h-32 object-cover" />
                    <div className="p-3">
                      <p className="text-xs font-bold truncate text-gray-800">{scan.title}</p>
                      <p className="text-[10px] text-gray-400">
                        {new Date(scan.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {currentStep === AppState.SCANNING && (
          <CameraView onCapture={handleCapture} onCancel={() => setCurrentStep(AppState.HOME)} />
        )}

        {currentStep === AppState.REVIEW && activeScan && (
          <ScanReview 
            scan={activeScan as ScanResult} 
            onSave={handleSaveScan} 
            onCancel={() => setCurrentStep(AppState.HOME)}
            isPro={isPro}
          />
        )}

        {currentStep === AppState.HISTORY && (
          <HistoryView 
            scans={scans} 
            onDelete={deleteScan} 
            onBack={() => setCurrentStep(AppState.HOME)} 
          />
        )}
      </main>

      {/* Navigation Bottom Bar */}
      {currentStep !== AppState.SCANNING && currentStep !== AppState.REVIEW && (
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t px-6 py-4 flex justify-between items-center z-50">
          <button 
            onClick={() => setCurrentStep(AppState.HOME)}
            className={`flex flex-col items-center gap-1 ${currentStep === AppState.HOME ? 'text-indigo-600' : 'text-gray-400'}`}
          >
            <ClockIcon className="w-6 h-6" />
            <span className="text-[10px] font-medium">History</span>
          </button>
          
          <button 
            onClick={() => setCurrentStep(AppState.SCANNING)}
            className="w-14 h-14 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg -mt-10 border-4 border-gray-50 hover:bg-indigo-700 transition-colors"
          >
            <PlusIcon className="w-8 h-8" />
          </button>

          <button 
             onClick={() => alert("Settings coming soon in Pro!")}
             className="flex flex-col items-center gap-1 text-gray-400"
          >
            <Cog6ToothIcon className="w-6 h-6" />
            <span className="text-[10px] font-medium">Settings</span>
          </button>
        </nav>
      )}
    </div>
  );
};

export default App;
