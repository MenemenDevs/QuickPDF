
import React, { useState, useEffect } from 'react';
import { ScanResult } from '../types';
import { processDocument } from '../services/geminiService';
import { 
  CheckIcon, 
  ArrowPathIcon, 
  SparklesIcon,
  DocumentArrowDownIcon,
  ShareIcon
} from '@heroicons/react/24/solid';

interface ScanReviewProps {
  scan: ScanResult;
  onSave: (result: ScanResult) => void;
  onCancel: () => void;
  isPro: boolean;
}

const ScanReview: React.FC<ScanReviewProps> = ({ scan, onSave, onCancel, isPro }) => {
  const [loading, setLoading] = useState(false);
  const [processedData, setProcessedData] = useState<{
    title: string;
    ocr: string;
    processedImage: string;
  } | null>(null);

  useEffect(() => {
    enhanceDocument();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const enhanceDocument = async () => {
    setLoading(true);
    try {
      const result = await processDocument(scan.originalImage);
      setProcessedData({
        title: result.title || 'Untitled Scan',
        ocr: result.ocrContent || '',
        processedImage: scan.originalImage, // In a real app, we might use a canvas to apply filters
      });
    } catch (e) {
      console.error("AI enhancement failed", e);
      setProcessedData({
        title: 'Document ' + new Date().toLocaleTimeString(),
        ocr: '',
        processedImage: scan.originalImage
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = () => {
    if (processedData) {
      onSave({
        ...scan,
        title: processedData.title,
        ocrText: processedData.ocr,
        processedImage: processedData.processedImage,
        fileSize: 1024 * Math.random() * 500 // simulated
      });
    }
  };

  const downloadAsPdf = () => {
    // Simple way to trigger a "PDF download" simulation
    const link = document.createElement('a');
    link.href = scan.originalImage;
    link.download = `${processedData?.title || 'scan'}.pdf`;
    link.click();
  };

  return (
    <div className="flex flex-col min-h-full bg-gray-900 text-white">
      <div className="p-4 flex justify-between items-center bg-gray-900/80 backdrop-blur-md sticky top-0 z-10">
        <button onClick={onCancel} className="text-gray-400 font-medium px-2">Retake</button>
        <h2 className="font-bold">Review Scan</h2>
        <button 
          onClick={handleFinish}
          disabled={loading}
          className="bg-indigo-600 px-4 py-2 rounded-lg font-bold flex items-center gap-1 disabled:opacity-50"
        >
          <CheckIcon className="w-5 h-5" />
          Done
        </button>
      </div>

      <div className="flex-1 p-6 flex flex-col items-center">
        <div className="w-full aspect-[3/4] bg-white rounded-lg shadow-2xl overflow-hidden relative">
          <img 
            src={processedData?.processedImage || scan.originalImage} 
            className="w-full h-full object-contain" 
            alt="Review" 
          />
          {!isPro && (
            <div className="absolute bottom-4 right-4 bg-black/40 px-2 py-1 rounded text-[8px] tracking-widest uppercase font-bold text-white/50 backdrop-blur-sm pointer-events-none">
              QuickScan Free
            </div>
          )}
          {loading && (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-4">
              <ArrowPathIcon className="w-10 h-10 text-indigo-400 animate-spin" />
              <div className="text-center">
                <p className="font-bold text-indigo-300">AI ENHANCING...</p>
                <p className="text-xs text-gray-400 mt-1">Detecting text and auto-cropping</p>
              </div>
            </div>
          )}
        </div>

        <div className="w-full mt-6 space-y-4">
          <div className="bg-white/10 rounded-xl p-4 border border-white/10">
            <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block mb-1">Title</label>
            <input 
              type="text" 
              className="bg-transparent w-full text-lg font-bold border-none focus:ring-0 p-0 text-white"
              value={processedData?.title || ''}
              onChange={(e) => setProcessedData(prev => prev ? {...prev, title: e.target.value} : null)}
              placeholder="Detecting title..."
            />
          </div>

          <div className="flex gap-4">
            <button 
              onClick={downloadAsPdf}
              className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 py-3 rounded-xl flex flex-col items-center gap-1 transition-colors"
            >
              <DocumentArrowDownIcon className="w-6 h-6 text-indigo-400" />
              <span className="text-[10px] font-bold text-gray-300">SAVE PDF</span>
            </button>
            <button className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 py-3 rounded-xl flex flex-col items-center gap-1 transition-colors">
              <ShareIcon className="w-6 h-6 text-indigo-400" />
              <span className="text-[10px] font-bold text-gray-300">SHARE</span>
            </button>
            <button 
              onClick={enhanceDocument}
              className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 py-3 rounded-xl flex flex-col items-center gap-1 transition-colors"
            >
              <SparklesIcon className="w-6 h-6 text-indigo-400" />
              <span className="text-[10px] font-bold text-gray-300">RE-SCAN AI</span>
            </button>
          </div>

          {processedData?.ocr && (
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
               <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block mb-2">Extracted Text</label>
               <p className="text-xs text-gray-300 line-clamp-3 italic">"{processedData.ocr}"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScanReview;
