import React, { useState } from 'react';
import { RefreshCcw, Check, X, Award, Eye } from 'lucide-react';
import { QuizState, ThemeConfig } from '../types';
import { THEMES, DIFFICULTY_CONFIG } from '../constants';
import MathRenderer from './MathRenderer';

interface ResultScreenProps {
  state: QuizState;
  onRetry: () => void;
}

const ResultScreen: React.FC<ResultScreenProps> = ({ state, onRetry }) => {
  const [filter, setFilter] = useState<'all' | 'correct' | 'incorrect'>('all');
  
  const theme = THEMES[state.level];
  const correctCount = state.score;
  const totalQuestions = state.questions.length;
  
  // Calculate time
  const timeTaken = state.endTime && state.startTime 
    ? Math.floor((state.endTime - state.startTime) / 1000)
    : 0;
  
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getEncouragement = (score: number) => {
    if (score >= 18) return "🌟 Xuất sắc! Em đã thành thạo kiến thức này rồi!";
    if (score >= 15) return "👍 Giỏi lắm! Em chỉ cần ôn luyện thêm một chút nữa thôi!";
    if (score >= 12) return "💪 Tốt đấy! Em đang tiến bộ, hãy cố gắng thêm nhé!";
    if (score >= 9) return "📚 Em cần ôn tập thêm một số phần. Cùng học tiếp nhé!";
    return "🌱 Đây là bước đầu tốt! Hãy xem lại lý thuyết và thử lại nhé!";
  };

  const filteredQuestions = state.questions.filter(q => {
    const isCorrect = state.userAnswers[q.id] === q.correctAnswer;
    if (filter === 'correct') return isCorrect;
    if (filter === 'incorrect') return !isCorrect;
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 min-h-screen font-sans">
      {/* Header Summary */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden mb-8 animate-fade-in">
        <div className={`bg-gradient-to-r ${theme.gradient} p-8 md:p-12 text-center text-white relative`}>
           {/* Background Pattern */}
           <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 2px, transparent 2px)', backgroundSize: '20px 20px' }}></div>
           
           <Award className="w-20 h-20 mx-auto mb-4 text-white drop-shadow-md animate-bounce-short" />
           <h1 className="text-3xl md:text-4xl font-bold mb-2">HOÀN THÀNH BÀI TẬP!</h1>
           <p className="text-lg md:text-xl opacity-90 font-medium">{getEncouragement(correctCount)}</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100 border-b border-gray-100">
          <div className="p-6 text-center">
             <div className="text-xs text-gray-500 font-bold uppercase tracking-wide mb-2">Tổng điểm</div>
             <div className={`text-4xl font-bold ${theme.text}`}>{correctCount}/20</div>
          </div>
          <div className="p-6 text-center">
             <div className="text-xs text-gray-500 font-bold uppercase tracking-wide mb-2">Câu đúng</div>
             <div className="text-4xl font-bold text-green-500 flex items-center justify-center gap-2">
               {correctCount} <Check className="w-6 h-6" />
             </div>
          </div>
          <div className="p-6 text-center">
             <div className="text-xs text-gray-500 font-bold uppercase tracking-wide mb-2">Câu sai</div>
             <div className="text-4xl font-bold text-red-500 flex items-center justify-center gap-2">
               {totalQuestions - correctCount} <X className="w-6 h-6" />
             </div>
          </div>
          <div className="p-6 text-center">
             <div className="text-xs text-gray-500 font-bold uppercase tracking-wide mb-2">Thời gian</div>
             <div className="text-xl md:text-2xl font-bold text-gray-700 mt-2 font-mono">{formatTime(timeTaken)}</div>
          </div>
        </div>

        <div className="p-6 bg-gray-50 flex justify-center gap-4">
           <button 
             onClick={onRetry}
             className={`px-8 py-3 rounded-xl font-bold text-white shadow-lg flex items-center gap-2 transform transition-all ${theme.primary} ${theme.primaryHover} hover:-translate-y-1`}
           >
             <RefreshCcw className="w-5 h-5" />
             LÀM BÀI MỚI 🔄
           </button>
        </div>
      </div>

      {/* Review Section */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Eye className="w-6 h-6 text-gray-500" />
            Xem chi tiết đáp án
          </h2>
          
          <div className="flex bg-white rounded-lg p-1 shadow-sm border border-gray-200">
            {(['all', 'correct', 'incorrect'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${filter === f ? `${theme.primary} text-white shadow-md` : 'text-gray-500 hover:bg-gray-50'}`}
              >
                {f === 'all' ? 'Tất cả' : f === 'correct' ? 'Câu đúng' : 'Câu sai'}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-6">
          {filteredQuestions.map((q, idx) => {
            const userAnswer = state.userAnswers[q.id];
            const isCorrect = userAnswer === q.correctAnswer;
            const diffConf = DIFFICULTY_CONFIG[q.difficulty];

            return (
              <div key={q.id} className={`bg-white rounded-2xl p-6 shadow-sm border-2 ${isCorrect ? 'border-green-100' : 'border-red-100'} transition-all`}>
                 <div className="flex items-start justify-between mb-4">
                    <div className="flex gap-3">
                       <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white shadow-sm ${isCorrect ? 'bg-green-500' : 'bg-red-500'}`}>
                         {state.questions.findIndex(qk => qk.id === q.id) + 1}
                       </span>
                       <span className={`px-2 py-1 rounded text-xs font-bold uppercase self-center shadow-sm ${diffConf.color} ${diffConf.textColor}`}>
                         {diffConf.label}
                       </span>
                    </div>
                 </div>
                 
                 <h3 className="text-lg font-medium text-gray-800 mb-4 ml-11">
                    <MathRenderer text={q.text} />
                 </h3>
                 
                 <div className="ml-11 grid gap-2 mb-4">
                    {q.options.map(opt => {
                      const letter = opt.charAt(0);
                      const isSelected = userAnswer === letter;
                      const isTheCorrectAnswer = q.correctAnswer === letter;
                      
                      let optClass = "p-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-500";
                      
                      if (isTheCorrectAnswer) {
                        optClass = "p-3 rounded-lg border-2 border-green-500 bg-green-50 text-green-800 font-medium";
                      } else if (isSelected && !isCorrect) {
                        optClass = "p-3 rounded-lg border-2 border-red-500 bg-red-50 text-red-800 line-through opacity-70";
                      }

                      return (
                        <div key={opt} className={optClass}>
                          {opt}
                        </div>
                      )
                    })}
                 </div>

                 <div className="ml-11 p-4 bg-gray-50 rounded-xl text-sm text-gray-700 leading-relaxed border border-gray-100">
                    <strong className="block text-gray-900 mb-1">Giải thích:</strong>
                    <MathRenderer text={q.explanation} />
                 </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  );
};

export default ResultScreen;