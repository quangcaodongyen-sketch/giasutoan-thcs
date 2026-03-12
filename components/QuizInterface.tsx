import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, ChevronRight, AlertCircle, HelpCircle } from 'lucide-react';
import { QuizState, ThemeConfig, EducationLevel } from '../types';
import { THEMES, DIFFICULTY_CONFIG } from '../constants';
import MathRenderer from './MathRenderer';

interface QuizInterfaceProps {
  state: QuizState;
  onAnswer: (questionId: string, answer: string) => void;
  onNext: () => void;
  onFinish: () => void;
}

const QuizInterface: React.FC<QuizInterfaceProps> = ({ state, onAnswer, onNext, onFinish }) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  const currentQuestion = state.questions[state.currentQuestionIndex];
  const theme = THEMES[state.level];
  const progress = ((state.currentQuestionIndex + 1) / state.questions.length) * 100;
  const isLastQuestion = state.currentQuestionIndex === state.questions.length - 1;

  // Timer logic
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Reset local state when question changes
  useEffect(() => {
    const savedAnswer = state.userAnswers[currentQuestion.id];
    if (savedAnswer) {
        setSelectedOption(savedAnswer);
        setShowFeedback(true);
    } else {
        setSelectedOption(null);
        setShowFeedback(false);
    }
  }, [currentQuestion.id, state.userAnswers]);

  const handleOptionClick = (option: string) => {
    if (showFeedback) return; // Prevent changing after answering
    const optionLetter = option.charAt(0); // Extract "A" from "A. Answer"
    setSelectedOption(optionLetter);
    setShowFeedback(true);
    onAnswer(currentQuestion.id, optionLetter);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const difficultyConf = DIFFICULTY_CONFIG[currentQuestion.difficulty];

  return (
    <div className={`max-w-6xl mx-auto p-4 md:p-6 min-h-screen flex flex-col font-sans ${theme.bg}`}>
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100 sticky top-4 z-20">
        <div className="flex items-center gap-4 flex-1">
          <div className="hidden md:block text-sm font-bold text-gray-600">
             Tiến độ
          </div>
          <div className="relative w-full max-w-xs h-3 bg-gray-100 rounded-full overflow-hidden">
             <div 
               className={`absolute top-0 left-0 h-full transition-all duration-500 ease-out ${theme.primary}`} 
               style={{ width: `${progress}%` }}
             ></div>
          </div>
          <span className="text-sm font-bold text-gray-500 whitespace-nowrap">
            {state.currentQuestionIndex + 1}/{state.questions.length}
          </span>
        </div>
        
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full bg-gray-50 text-gray-700 font-mono font-bold border border-gray-200 ml-4`}>
          <Clock className="w-5 h-5 text-gray-400" />
          {formatTime(elapsedTime)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-grow items-start">
        {/* Question Card (Left - 8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 md:p-10 animate-fade-in relative overflow-hidden min-h-[400px]">
             {/* Decorative Background */}
             <div className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-br ${theme.gradient} opacity-10 rounded-bl-full pointer-events-none`}></div>

            <div className="flex items-center gap-3 mb-6 relative z-10">
              <span className={`px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider shadow-sm ${difficultyConf.color} ${difficultyConf.textColor}`}>
                {difficultyConf.label}
              </span>
              <span className="text-sm text-gray-400 font-medium">Câu {state.currentQuestionIndex + 1}</span>
            </div>

            <h2 className="text-xl md:text-2xl font-semibold text-gray-800 leading-relaxed mb-8">
              <MathRenderer text={currentQuestion.text} />
            </h2>

            <div className="grid gap-3">
              {currentQuestion.options.map((option, idx) => {
                const optionLetter = option.charAt(0); 
                const isSelected = selectedOption === optionLetter;
                const isCorrect = currentQuestion.correctAnswer === optionLetter;
                
                let btnClass = "w-full text-left p-4 rounded-xl border-2 transition-all duration-200 hover:bg-gray-50 flex items-center gap-4 group relative overflow-hidden";
                let circleClass = "w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-base transition-colors shrink-0";
                
                if (showFeedback) {
                  if (isCorrect) {
                    btnClass = "w-full text-left p-4 rounded-xl border-2 border-green-500 bg-green-50 flex items-center gap-4";
                    circleClass = "w-10 h-10 rounded-full bg-green-500 text-white border-green-500 flex items-center justify-center font-bold";
                  } else if (isSelected && !isCorrect) {
                    btnClass = "w-full text-left p-4 rounded-xl border-2 border-red-500 bg-red-50 flex items-center gap-4";
                    circleClass = "w-10 h-10 rounded-full bg-red-500 text-white border-red-500 flex items-center justify-center font-bold";
                  } else {
                     btnClass += " opacity-50 grayscale";
                     circleClass += " border-gray-300 text-gray-400";
                  }
                } else {
                    if (isSelected) {
                        btnClass = `w-full text-left p-4 rounded-xl border-2 ${theme.border} ring-2 ring-offset-1 ring-opacity-50 ${theme.primary.replace('bg-', 'ring-')} flex items-center gap-4 transform scale-[1.01]`;
                        circleClass = `w-10 h-10 rounded-full ${theme.primary} text-white flex items-center justify-center font-bold`;
                    } else {
                        btnClass = "w-full text-left p-4 rounded-xl border-2 border-gray-100 hover:border-gray-300 hover:shadow-md flex items-center gap-4";
                        circleClass = "w-10 h-10 rounded-full border-2 border-gray-200 text-gray-400 group-hover:border-gray-400 group-hover:text-gray-600 flex items-center justify-center font-bold";
                    }
                }

                return (
                  <button 
                    key={idx}
                    onClick={() => handleOptionClick(option)}
                    disabled={showFeedback}
                    className={btnClass}
                  >
                    <span className={circleClass}>{optionLetter}</span>
                    <span className="text-gray-700 font-medium text-lg">
                        <MathRenderer text={option.substring(2)} />
                    </span> 
                    
                    {showFeedback && isCorrect && <CheckCircle className="w-6 h-6 text-green-500 ml-auto shrink-0" />}
                    {showFeedback && isSelected && !isCorrect && <XCircle className="w-6 h-6 text-red-500 ml-auto shrink-0" />}
                  </button>
                );
              })}
            </div>

            {showFeedback && (
              <div className="mt-8 p-6 bg-blue-50 rounded-2xl border border-blue-100 animate-fade-in">
                <div className="flex items-start gap-4">
                    <div className="p-2 bg-blue-100 rounded-full text-blue-600">
                        <HelpCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="font-bold text-blue-900 mb-2 text-lg">Giải thích chi tiết:</h4>
                        <div className="text-blue-800 leading-relaxed text-base">
                            <MathRenderer text={currentQuestion.explanation} />
                        </div>
                    </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex justify-end">
            <button
                onClick={isLastQuestion ? onFinish : onNext}
                disabled={!selectedOption}
                className={`
                    px-8 py-4 rounded-xl font-bold text-white text-lg shadow-lg flex items-center gap-3 transform transition-all
                    ${!selectedOption ? 'bg-gray-300 cursor-not-allowed' : `${theme.primary} ${theme.primaryHover} hover:-translate-y-1 hover:shadow-xl`}
                `}
            >
                {isLastQuestion ? 'Hoàn thành bài thi' : 'Câu tiếp theo'}
                <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Sidebar / Navigation Grid (Right - 4 cols) */}
        <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 sticky top-24">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-gray-700 font-bold text-lg">Danh sách câu hỏi</h3>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${theme.badge}`}>20 câu</span>
                </div>
                
                <div className="grid grid-cols-5 gap-3">
                    {state.questions.map((q, idx) => {
                        const isCurrent = idx === state.currentQuestionIndex;
                        const answer = state.userAnswers[q.id];
                        const isCorrect = answer === q.correctAnswer;
                        
                        let bgClass = "bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100";
                        if (answer) {
                            bgClass = isCorrect ? "bg-green-100 text-green-700 border-green-300" : "bg-red-100 text-red-700 border-red-300";
                        }
                        if (isCurrent) {
                            bgClass = `ring-2 ring-offset-2 ring-${theme.primary.split('-')[1]}-400 font-bold ${bgClass} transform scale-110 z-10`;
                        }

                        return (
                            <button 
                                key={idx} 
                                disabled 
                                className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm border transition-all duration-200 ${bgClass}`}
                            >
                                {idx + 1}
                            </button>
                        )
                    })}
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100 space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded bg-green-100 border border-green-300 flex items-center justify-center">
                            <CheckCircle className="w-3 h-3 text-green-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-600">Đã làm đúng</span>
                    </div>
                    <div className="flex items-center gap-3">
                         <div className="w-4 h-4 rounded bg-red-100 border border-red-300 flex items-center justify-center">
                            <XCircle className="w-3 h-3 text-red-600" />
                         </div>
                        <span className="text-sm font-medium text-gray-600">Đã làm sai</span>
                    </div>
                     <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded bg-gray-50 border border-gray-300"></div>
                        <span className="text-sm font-medium text-gray-600">Chưa làm</span>
                    </div>
                     <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded border-2 border-${theme.primary.split('-')[1]}-400`}></div>
                        <span className="text-sm font-medium text-gray-600">Đang làm</span>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default QuizInterface;