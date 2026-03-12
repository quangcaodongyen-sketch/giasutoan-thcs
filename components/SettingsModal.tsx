import React, { useState, useEffect } from 'react';
import { X, Key, Check, AlertTriangle, Cpu } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (apiKey: string, model: string) => void;
  currentApiKey?: string;
  currentModel?: string;
  isMandatory?: boolean; // If true, cannot close without saving valid key
}

const MODELS = [
  { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash (Preview)', desc: 'Tốc độ cực nhanh, tốt nhất cho Chat & Quiz' },
  { id: 'gemini-3-pro-preview', name: 'Gemini 3 Pro (Preview)', desc: 'Thông minh hơn, xử lý bài toán phức tạp' },
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', desc: 'Ổn định, tiết kiệm quota' },
];

const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  currentApiKey = '', 
  currentModel = 'gemini-3-flash-preview',
  isMandatory = false 
}) => {
  const [apiKey, setApiKey] = useState(currentApiKey);
  const [selectedModel, setSelectedModel] = useState(currentModel);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setApiKey(currentApiKey);
    setSelectedModel(currentModel);
  }, [currentApiKey, currentModel, isOpen]);

  const handleSave = () => {
    if (!apiKey.trim()) {
      setError('Vui lòng nhập API Key để tiếp tục');
      return;
    }
    setError(null);
    onSave(apiKey.trim(), selectedModel);
    if (!isMandatory) onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-300">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">Cấu hình AI</h2>
              <p className="text-xs text-gray-500 font-medium">API Key & Model Selection</p>
            </div>
          </div>
          {!isMandatory && (
            <button onClick={onClose} className="p-2 hover:bg-white/50 rounded-full transition-colors text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="p-6 space-y-6">
          
          {/* API Key Section */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-gray-700 flex items-center justify-between">
              <span>Google Gemini API Key <span className="text-red-500">*</span></span>
              <a 
                href="https://aistudio.google.com/api-keys" 
                target="_blank" 
                rel="noreferrer"
                className="text-xs text-blue-600 hover:text-blue-700 font-bold hover:underline"
              >
                Lấy Key ở đâu?
              </a>
            </label>
            <input 
              type="password" 
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Nhập khóa API (bắt đầu bằng AIza...)"
              className={`w-full p-3 rounded-xl border-2 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-mono text-sm
                ${error ? 'border-red-300 bg-red-50 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'}
              `}
            />
            {error && (
              <p className="text-red-500 text-xs font-bold flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                {error}
              </p>
            )}
            <p className="text-xs text-gray-400">
              Key được lưu cục bộ trên trình duyệt của bạn (localStorage).
            </p>
          </div>

          {/* Model Selection Section */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-gray-500" />
              Chọn Model AI
            </label>
            <div className="grid gap-3">
              {MODELS.map((model) => (
                <button
                  key={model.id}
                  onClick={() => setSelectedModel(model.id)}
                  className={`relative p-3 rounded-xl border-2 text-left transition-all group
                    ${selectedModel === model.id 
                      ? 'border-blue-500 bg-blue-50/50 shadow-sm' 
                      : 'border-gray-100 hover:border-blue-200 hover:bg-gray-50'
                    }
                  `}
                >
                  <div className="flex items-start justify-between">
                    <div>
                        <div className={`font-bold text-sm ${selectedModel === model.id ? 'text-blue-700' : 'text-gray-700'}`}>
                            {model.name}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{model.desc}</div>
                    </div>
                    {selectedModel === model.id && (
                        <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white shadow-sm">
                            <Check className="w-3 h-3" />
                        </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 pt-2">
          <button 
            onClick={handleSave}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transform active:scale-95 transition-all text-sm uppercase tracking-wide"
          >
            Lưu Cấu Hình
          </button>
        </div>

      </div>
    </div>
  );
};

export default SettingsModal;
