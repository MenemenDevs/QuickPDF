
import React, { useState } from 'react';
import { ScanResult } from '../types';
import { 
  ArrowLeftIcon, 
  TrashIcon, 
  MagnifyingGlassIcon,
  EllipsisVerticalIcon
} from '@heroicons/react/24/outline';

interface HistoryViewProps {
  scans: ScanResult[];
  onDelete: (id: string) => void;
  onBack: () => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ scans, onDelete, onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredScans = scans.filter(s => 
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.ocrText.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-full bg-white animate-in slide-in-from-right duration-300">
      <div className="p-4 border-b flex items-center gap-4 bg-white sticky top-0 z-10">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-bold">Document History</h2>
      </div>

      <div className="p-4">
        <div className="relative mb-6">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text"
            placeholder="Search scans or extracted text..."
            className="w-full bg-gray-100 border-none rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {filteredScans.length === 0 ? (
          <div className="text-center py-20">
             <p className="text-gray-400">No documents found matching "{searchTerm}"</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredScans.map(scan => (
              <div key={scan.id} className="flex gap-4 p-3 bg-gray-50 rounded-2xl border border-transparent hover:border-indigo-100 transition-all group">
                <div className="w-20 h-24 bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 flex-shrink-0">
                  <img src={scan.processedImage} className="w-full h-full object-cover" alt="" />
                </div>
                <div className="flex-1 flex flex-col justify-between py-1 min-w-0">
                  <div>
                    <h4 className="font-bold text-gray-900 truncate">{scan.title}</h4>
                    <p className="text-xs text-gray-500 mb-1">{new Date(scan.createdAt).toLocaleString()}</p>
                    <p className="text-[10px] text-gray-400 line-clamp-2 leading-relaxed">
                      {scan.ocrText || 'No text extracted.'}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                     <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">PDF</span>
                     <span className="text-[10px] font-medium text-gray-400">{(scan.fileSize / 1024).toFixed(1)} MB</span>
                  </div>
                </div>
                <div className="flex flex-col justify-between items-end">
                   <button className="text-gray-400 hover:text-gray-600">
                     <EllipsisVerticalIcon className="w-5 h-5" />
                   </button>
                   <button 
                    onClick={() => onDelete(scan.id)}
                    className="p-2 text-red-300 hover:text-red-500 transition-colors"
                   >
                     <TrashIcon className="w-5 h-5" />
                   </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryView;
