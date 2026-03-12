import React, { useState, useEffect } from 'react';
import { BookOpen, GraduationCap, School, Brain, Sparkles, Calculator, PenTool, History, Settings, Lock, User, Key, ArrowRight, AlertCircle } from 'lucide-react';
import { EducationLevel, QuizState, GradeConfig, QuizResult } from './types';
import { LEVELS, CURRICULUM, THEMES } from './constants';
import { generateQuizQuestions } from './services/geminiService';
import QuizInterface from './components/QuizInterface';
import ResultScreen from './components/ResultScreen';
import HistoryModal from './components/HistoryModal';
import ChatWidget from './components/ChatWidget';
import SettingsModal from './components/SettingsModal';

const App: React.FC = () => {
  // Setup State
  const [level, setLevel] = useState<EducationLevel>('middle');
  const [grade, setGrade] = useState<number>(6);
  const [topic, setTopic] = useState<string>('');
  const [customTopic, setCustomTopic] = useState<string>('');

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // History State
  const [history, setHistory] = useState<QuizResult[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Settings State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiKey, setApiKey] = useState(localStorage.getItem('gemini_api_key') || '');
  const [model, setModel] = useState(localStorage.getItem('gemini_model') || 'gemini-3-flash-preview');

  useEffect(() => {
    if (!localStorage.getItem('gemini_api_key')) {
      setIsSettingsOpen(true);
    }
  }, []);

  const handleSaveSettings = (key: string, newModel: string) => {
    localStorage.setItem('gemini_api_key', key);
    localStorage.setItem('gemini_model', newModel);
    setApiKey(key);
    setModel(newModel);
    setIsSettingsOpen(false);
  };

  // Quiz State
  const [quizState, setQuizState] = useState<QuizState>({
    status: 'setup',
    level: 'middle',
    grade: 6,
    topic: '',
    questions: [],
    currentQuestionIndex: 0,
    userAnswers: {},
    score: 0,
    startTime: 0,
    endTime: null,
  });

  const [loadingMsg, setLoadingMsg] = useState('Đang chuẩn bị...');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load history from local storage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('math_quiz_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  // Update default grade/topic when level changes
  useEffect(() => {
    const defaultGrade = CURRICULUM[level][0].grade;
    setGrade(defaultGrade);
    setTopic(CURRICULUM[level][0].topics[0]);
    setCustomTopic(''); // Reset custom topic on level change
  }, [level]);

  // Update default topic when grade changes
  useEffect(() => {
    const gradeConfig = CURRICULUM[level].find(g => g.grade === grade);
    if (gradeConfig && gradeConfig.topics.length > 0) {
      setTopic(gradeConfig.topics[0]);
    }
  }, [grade, level]);

  const currentTheme = THEMES[level];

  const handleStartQuiz = async () => {
    // Determine which topic to use
    const finalTopic = customTopic.trim() ? customTopic.trim() : topic;

    // Validation for custom topic
    if (customTopic.trim().length > 0) {
      if (customTopic.trim().length < 5 || customTopic.trim().length > 100) {
        setErrorMsg("⚠️ Vui lòng nhập chủ đề từ 5-100 ký tự");
        return;
      }
    }

    setQuizState(prev => ({ ...prev, status: 'loading' }));
    setErrorMsg(null);
    setLoadingMsg(customTopic.trim()
      ? `Đang tạo 20 câu hỏi về: ${finalTopic}...`
      : "AI đang soạn đề thi cho bạn..."
    );

    try {
      // Simulate loading steps for better UX
      setTimeout(() => setLoadingMsg("Đang phân bổ câu hỏi theo độ khó..."), 1000);
      setTimeout(() => setLoadingMsg("Đang kiểm tra kiến thức..."), 2500);

      const questions = await generateQuizQuestions(level, grade, finalTopic);

      setQuizState({
        status: 'active',
        level,
        grade,
        topic: finalTopic,
        questions,
        currentQuestionIndex: 0,
        userAnswers: {},
        score: 0,
        startTime: Date.now(),
        endTime: null,
      });
    } catch (error: any) {
      console.error(error);
      setErrorMsg(error.message || "Đã có lỗi xảy ra khi tạo câu hỏi. Vui lòng kiểm tra API Key.");
      setQuizState(prev => ({ ...prev, status: 'setup' }));
    }
  };

  const handleAnswer = (questionId: string, answer: string) => {
    setQuizState(prev => {
      const question = prev.questions.find(q => q.id === questionId);
      const isCorrect = question?.correctAnswer === answer;

      return {
        ...prev,
        userAnswers: { ...prev.userAnswers, [questionId]: answer },
        score: isCorrect ? prev.score + 1 : prev.score
      }
    });
  };

  const handleNext = () => {
    setQuizState(prev => ({
      ...prev,
      currentQuestionIndex: Math.min(prev.currentQuestionIndex + 1, prev.questions.length - 1)
    }));
  };

  const handleFinish = () => {
    // Create Result Object
    const result: QuizResult = {
      id: Date.now().toString(),
      date: Date.now(),
      grade: quizState.grade,
      topic: quizState.topic,
      score: quizState.score,
      totalQuestions: quizState.questions.length,
      level: quizState.level
    };

    // Update State and LocalStorage
    const updatedHistory = [result, ...history];
    setHistory(updatedHistory);
    localStorage.setItem('math_quiz_history', JSON.stringify(updatedHistory));

    setQuizState(prev => ({
      ...prev,
      status: 'finished',
      endTime: Date.now()
    }));
  };

  const handleRetry = () => {
    setQuizState(prev => ({
      ...prev,
      status: 'setup',
      questions: [],
      userAnswers: {},
      score: 0
    }));
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem('math_quiz_history');
    setIsHistoryOpen(false);
  };

  // --- RENDER HELPERS ---

  if (quizState.status === 'loading') {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${currentTheme.bg}`}>
        <div className="bg-white p-8 rounded-3xl shadow-xl flex flex-col items-center max-w-sm w-full text-center">
          <div className="w-24 h-24 mb-6 relative">
            <div className={`absolute inset-0 rounded-full border-4 border-t-transparent animate-spin ${currentTheme.border.replace('border-', 'border-t-').replace('200', '500')}`}></div>
            <Brain className={`absolute inset-0 m-auto w-10 h-10 ${currentTheme.text} animate-pulse`} />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">{loadingMsg}</h2>
          <p className="text-gray-500 text-sm">Vui lòng đợi trong giây lát...</p>
        </div>
      </div>
    );
  }

  // --- MAIN RENDER ---

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      (username === 'VIP1' && password === '12345') ||
      (username === 'vip2' && password === '0918688397')
    ) {
      setIsAuthenticated(true);
      setLoginError('');
      // Save to session or local storage if persistence is desired, but keeping it simple for now
    } else {
      setLoginError('Tên đăng nhập hoặc mật khẩu không chính xác!');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100 font-sans">
        <div className="bg-white p-8 md:p-10 rounded-[2rem] shadow-2xl max-w-md w-full animate-fade-in border border-white/50 backdrop-blur-sm relative overflow-hidden">
          {/* Decorative Pattern */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-blue-100 to-transparent opacity-50 rounded-bl-full pointer-events-none"></div>
          
          <div className="flex flex-col items-center mb-8 relative z-10">
            <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-3 mb-4">
              <Calculator className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-600 text-center">GIA SƯ TOÁN PRO</h1>
            <p className="text-gray-500 font-medium text-sm mt-2">Vui lòng đăng nhập để sử dụng</p>
          </div>

          {loginError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium animate-bounce-short flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6 relative z-10">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 block">Tên đăng nhập</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-11 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all font-medium text-gray-800 placeholder:text-gray-400"
                  placeholder="Nhập tên đăng nhập..."
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 block">Mật khẩu</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Key className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all font-medium text-gray-800 placeholder:text-gray-400"
                  placeholder="Nhập mật khẩu..."
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-4 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 transform transition-all active:scale-[0.98] group"
            >
              ĐĂNG NHẬP
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
          
          <div className="mt-8 text-center border-t border-gray-100 pt-6">
            <div className="inline-flex flex-col items-center gap-3">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-full text-yellow-700 text-xs font-bold">
                <Lock className="w-3 h-3" />
                Tài khoản cấp phép riêng
              </div>
              <p className="text-sm font-medium text-gray-600">
                Liên hệ Zalo <span className="text-blue-600 font-bold">0915213717 - Đ. Thành</span> để mua tài khoản VIP
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    if (quizState.status === 'active') {
      return (
        <QuizInterface
          state={quizState}
          onAnswer={handleAnswer}
          onNext={handleNext}
          onFinish={handleFinish}
        />
      );
    }

    if (quizState.status === 'finished') {
      return (
        <ResultScreen state={quizState} onRetry={handleRetry} />
      );
    }

    // SETUP SCREEN
    return (
      <div className={`min-h-screen flex flex-col font-sans ${currentTheme.bg} transition-colors duration-500`}>
        <header className="bg-white shadow-sm sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${currentTheme.primary} text-white shadow-md`}>
                <Calculator className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-lg md:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600">
                  GIA SƯ TOÁN PRO
                </h1>
                <span className="text-xs text-gray-500 font-medium tracking-wider">Math Tutor by Đinh Văn Thành</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="flex items-center gap-2 text-xs md:text-sm px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold border border-red-200 rounded-xl transition-all shadow-sm active:scale-95"
              >
                <Settings className="w-4 h-4" />
                <span className="hidden md:inline">Settings (API Key)</span>
              </button>
              <button
                onClick={() => setIsHistoryOpen(true)}
                className="flex items-center gap-2 text-xs md:text-sm px-3 py-2 bg-white hover:bg-gray-50 text-gray-600 font-bold border border-gray-200 rounded-xl transition-all shadow-sm active:scale-95"
              >
                <History className="w-4 h-4" />
                <span className="hidden md:inline">Lịch sử</span>
              </button>
              <span className="hidden md:flex items-center gap-2 text-xs px-3 py-1 bg-gray-100 rounded-full text-gray-500 font-medium border border-gray-200">
                <Sparkles className="w-3 h-3" />
                AI Powered
              </span>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8 md:py-12">
          <div className="bg-white rounded-[2rem] shadow-xl border border-white/50 overflow-hidden backdrop-blur-sm">
            {/* Tabs */}
            <div className="flex border-b border-gray-100">
              {(Object.keys(LEVELS) as EducationLevel[]).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setLevel(lvl)}
                  className={`flex-1 py-6 text-sm md:text-base font-bold transition-all flex items-center justify-center gap-2 relative overflow-hidden group
                      ${level === lvl
                      ? `bg-white ${THEMES[lvl].text}`
                      : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                    }`}
                >
                  {/* Active Indicator Line */}
                  {level === lvl && (
                    <div className={`absolute bottom-0 left-0 w-full h-1 ${THEMES[lvl].primary}`}></div>
                  )}

                  {lvl === 'middle' && <BookOpen className={`w-5 h-5 transition-transform group-hover:scale-110 ${level === lvl ? 'animate-bounce-short' : ''}`} />}
                  {LEVELS[lvl]}
                </button>
              ))}
            </div>

            <div className="p-6 md:p-10 space-y-8">
              <div className="text-center space-y-2">
                <h2 className={`text-2xl md:text-3xl font-bold ${currentTheme.text}`}>
                  Chào mừng các bạn học sinh! 👋
                </h2>
                <p className="text-gray-500 font-medium">Chọn lớp và chủ đề để bắt đầu hành trình chinh phục Toán học.</p>
              </div>

              {errorMsg && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-center text-sm font-medium animate-bounce-short">
                  {errorMsg}
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6 items-start">
                {/* Grade Selector */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Chọn Lớp</label>
                  <div className="relative group">
                    <select
                      value={grade}
                      onChange={(e) => setGrade(Number(e.target.value))}
                      className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:ring-4 focus:ring-opacity-20 focus:border-transparent outline-none appearance-none font-bold text-gray-700 transition-all cursor-pointer hover:border-gray-300"
                      style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)' }}
                    >
                      {CURRICULUM[level].map((g) => (
                        <option key={g.grade} value={g.grade}>
                          {g.label}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-gray-600 transition-colors">▼</div>
                  </div>
                </div>

                {/* Topic Selector & Custom Input */}
                <div className="space-y-4">
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Chọn Chủ Đề</label>
                    <div className={`relative group transition-opacity duration-300 ${customTopic.trim() ? 'opacity-50 grayscale' : 'opacity-100'}`}>
                      <select
                        value={topic}
                        onChange={(e) => {
                          setTopic(e.target.value);
                          setCustomTopic(''); // Clear custom input when choosing dropdown
                        }}
                        disabled={customTopic.trim().length > 0}
                        className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:ring-4 focus:ring-opacity-20 focus:border-transparent outline-none appearance-none font-bold text-gray-700 transition-all cursor-pointer hover:border-gray-300 disabled:cursor-not-allowed"
                        style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)' }}
                      >
                        {CURRICULUM[level]
                          .find((g) => g.grade === grade)
                          ?.topics.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-gray-600 transition-colors">▼</div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="relative flex items-center py-2">
                    <div className="flex-grow border-t border-gray-100"></div>
                    <span className="flex-shrink-0 mx-4 text-gray-300 text-xs font-bold uppercase">Hoặc</span>
                    <div className="flex-grow border-t border-gray-100"></div>
                  </div>

                  {/* Custom Topic Input */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1 flex items-center gap-1">
                      <PenTool className="w-3 h-3" />
                      Nhập chủ đề tự do
                    </label>
                    <input
                      type="text"
                      value={customTopic}
                      onChange={(e) => {
                        setCustomTopic(e.target.value);
                        // Visual feedback is handled by conditional rendering/styling, 
                        // we don't clear the dropdown value state to allow easy fallback, 
                        // but the logic prefers customTopic.
                      }}
                      placeholder="VD: Phương trình bậc hai, Tích phân..."
                      className={`w-full p-4 bg-white border-2 rounded-2xl focus:ring-4 focus:ring-opacity-20 outline-none font-medium text-gray-700 transition-all placeholder:text-gray-300
                                ${customTopic.trim()
                          ? `${currentTheme.border} ring-${currentTheme.primary.split('-')[1]}-200`
                          : 'border-gray-100 hover:border-gray-300'
                        }
                            `}
                    />
                  </div>
                </div>
              </div>

              {/* Info Card */}
              <div className={`p-6 rounded-2xl border ${currentTheme.border} bg-opacity-50 flex flex-col md:flex-row items-center justify-between gap-6`}>
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl ${currentTheme.primary} flex items-center justify-center text-white shadow-lg transform rotate-3`}>
                    <Sparkles className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className={`font-bold text-lg ${currentTheme.text}`}>Cấu trúc bài thi</h3>
                    <p className="text-sm opacity-80 text-gray-600 font-medium mt-1">20 câu hỏi • 3 mức độ • Tự luyện tập</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className={`px-3 py-1.5 rounded-lg text-xs font-bold bg-green-100 text-green-700 border border-green-200`}>Nhận biết</span>
                  <span className={`px-3 py-1.5 rounded-lg text-xs font-bold bg-orange-100 text-orange-700 border border-orange-200`}>Thông hiểu</span>
                  <span className={`px-3 py-1.5 rounded-lg text-xs font-bold bg-red-100 text-red-700 border border-red-200`}>Vận dụng</span>
                </div>
              </div>

              <button
                onClick={handleStartQuiz}
                className={`w-full py-5 rounded-2xl font-bold text-xl text-white shadow-xl shadow-gray-200 transform transition-all hover:scale-[1.02] active:scale-[0.98] ${currentTheme.primary} ${currentTheme.primaryHover} flex items-center justify-center gap-3 relative overflow-hidden group`}
              >
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
                {customTopic.trim() ? 'BẮT ĐẦU VỚI CHỦ ĐỀ NÀY 🚀' : 'BẮT ĐẦU ÔN TẬP 🚀'}
              </button>
            </div>
          </div>

          <p className="text-center text-gray-400 text-sm mt-8 font-medium">
            Được hỗ trợ bởi Google Gemini AI • Giúp bạn học tốt hơn mỗi ngày
          </p>
        </main>

        {/* Footer */}
        <footer className="bg-slate-800 text-slate-300 py-8 px-4 mt-auto border-t border-slate-700 no-print">
          <div className="max-w-5xl mx-auto text-center">
            <div className="space-y-2 text-sm md:text-base">
              <p className="font-medium text-slate-400">Bản quyền thuộc về:</p>
              <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-6">
                <span className="text-emerald-400 transition-colors duration-200 cursor-default flex items-center gap-2 font-bold">
                  Đinh Văn Thành - Trường THCS Đồng Yên 0915.213717
                </span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    );
  };

  return (
    <>
      {renderContent()}

      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onClearHistory={handleClearHistory}
      />

      <ChatWidget />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSaveSettings}
        currentApiKey={apiKey}
        currentModel={model}
        isMandatory={!apiKey}
      />
    </>
  );
};

export default App;
