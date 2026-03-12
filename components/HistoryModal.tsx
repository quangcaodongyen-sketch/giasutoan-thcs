import React from 'react';
import { X, Trash2, Calendar, Trophy, BookOpen } from 'lucide-react';
import { QuizResult } from '../types';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: QuizResult[];
  onClearHistory: () => void;
}

const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose, history, onClearHistory }) => {
  if (!isOpen) return null;

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getScoreColor = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (percentage >= 50) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-white rounded-3xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl animate-fade-in overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            Lịch sử làm bài
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {history.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p>Chưa có lịch sử làm bài nào.</p>
              <p className="text-sm mt-2">Hãy hoàn thành bài kiểm tra đầu tiên nhé!</p>
            </div>
          ) : (
            history.map((item) => (
              <div 
                key={item.id} 
                className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                      Lớp {item.grade}
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(item.date)}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-800 text-sm md:text-base line-clamp-1" title={item.topic}>
                    {item.topic}
                  </h3>
                </div>

                <div className={`px-4 py-2 rounded-xl font-bold border ${getScoreColor(item.score, item.totalQuestions)} whitespace-nowrap`}>
                  {item.score} / {item.totalQuestions} câu
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {history.length > 0 && (
          <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
            <button 
              onClick={() => {
                if (window.confirm('Bạn có chắc muốn xóa toàn bộ lịch sử không?')) {
                  onClearHistory();
                }
              }}
              className="flex items-center gap-2 text-red-500 hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors text-sm font-medium"
            >
              <Trash2 className="w-4 h-4" />
              Xóa lịch sử
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryModal;
