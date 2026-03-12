import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Question, EducationLevel, Difficulty } from "../types";

// --- CONFIGURATION & HELPERS ---

const FALLBACK_ORDER = [
  'gemini-3-flash-preview',
  'gemini-3-pro-preview',
  'gemini-2.5-flash',
  'gemini-2.5-pro'
];

const getApiKey = (): string => {
  const localKey = localStorage.getItem('gemini_api_key');
  if (localKey) return localKey;

  // Fallback to env if available
  return process.env.REACT_APP_GEMINI_API_KEY || (import.meta.env?.VITE_GEMINI_API_KEY as string) || '';
};

const getModel = (): string => {
  return localStorage.getItem('gemini_model') || 'gemini-3-flash-preview';
};

const getDifficultyLabel = (diff: Difficulty): string => {
  switch (diff) {
    case 'recognition': return 'Nhận biết';
    case 'understanding': return 'Thông hiểu';
    case 'application': return 'Vận dụng';
  }
};

interface Distribution {
  recognition: number;
  understanding: number;
  application: number;
}

const getDistribution = (level: EducationLevel, grade: number): Distribution => {
  return { recognition: 6, understanding: 8, application: 6 };
};

const questionSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    text: { type: Type.STRING, description: "Nội dung câu hỏi tiếng Việt (Unicode Math)" },
    options: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "4 lựa chọn A, B, C, D (Unicode Math).",
    },
    correctAnswer: { type: Type.STRING, description: "Đáp án đúng (chỉ ký tự 'A', 'B', 'C' hoặc 'D')" },
    explanation: { type: Type.STRING, description: "Giải thích chi tiết (xuống dòng rõ ràng, Unicode Math)" },
    difficulty: { type: Type.STRING, description: "'recognition', 'understanding', hoặc 'application'" }
  },
  required: ["text", "options", "correctAnswer", "explanation", "difficulty"]
};

const arraySchema: Schema = {
  type: Type.ARRAY,
  items: questionSchema
};

// --- CORE GENERATION LOGIC ---

export const generateQuizQuestions = async (
  level: EducationLevel,
  grade: number,
  topic: string
): Promise<Question[]> => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("API Key not found. Please set it in Settings.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const dist = getDistribution(level, grade);

  // Helper with Fallback/Retry Logic
  const generateBatch = async (count: number, difficulty: Difficulty, difficultyLabel: string): Promise<Question[]> => {
    if (count === 0) return [];

    // Start with selected model, then fallback through the list
    const preferredModel = getModel();
    // Create a list starting with preferred, then others in order, filtering duplicates
    const modelChain = [preferredModel, ...FALLBACK_ORDER].filter((v, i, a) => a.indexOf(v) === i);

    const prompt = `
      Generate ${count} [${difficulty}] level math questions for Grade ${grade} on topic '${topic}' following Vietnamese curriculum.
      
      CRITICAL FORMATTING RULES (STRICTLY NO LATEX):
      1. DO NOT use LaTeX syntax. NO '$', NO '\\frac', NO '\\sqrt', NO '\\cdot', NO '\\Rightarrow'.
      2. USE UNICODE characters for all math symbols to make it visual and readable as plain text:
         - Powers/Indices: Use superscripts/subscripts. Example: x², x³, aⁿ, x₁, x₂. (NOT x^2, x_1)
         - Fractions: Use slash or Unicode fractions. Example: 1/2, 3/4, ½, ⅓, (a+b)/c. (NOT \\frac{a}{b})
         - Roots: Use symbol. Example: √x, ∛x. (NOT \\sqrt{x})
         - Multiplication: Use '×' or '·'. (NOT *)
         - Arrows: Use '⇒' for implication, '⇔' for equivalent, '→' for arrow.
         - Geometry: ∠A, ΔABC, ⊥, ||, π, °.
         - Sets/Logic: ∈, ⊂, ∪, ∩, ∅, ∀, ∃.
         - Comparison: ≠, ≤, ≥, ≈.
      
      3. CONTENT STRUCTURE:
         - Questions must be in Vietnamese.
         - Explanation must be step-by-step using bullet points (-) or new lines for readability.
         - Example Answer Format: "a = 1, b = -2, c = 3" (Clean text).
         - CORRECT ANSWER: Must be one of A, B, C, D.
      
      4. ANSWER DISTRIBUTION (IMPORTANT):
         - Ensure that the correct answers are evenly distributed among A, B, C, and D.
         - Avoid making 'A' the correct answer too frequently.
         - For ${count} questions, aim for approximately ${Math.ceil(count/4)} of each option.
      
      Difficulty Definition for ${difficultyLabel} (${difficulty}):
      - Nhận biết (Recognition): Direct recall, simple calculation (1 step).
      - Thông hiểu (Understanding): Multi-step problem, apply formula (2-3 steps).
      - Vận dụng (Application): Complex scenario, integrate multiple concepts (3+ steps).
      
      Output JSON format:
      [
        { 
          "text": "Unicode Question text...", 
          "options": ["A. ...", "B. ...", "C. ...", "D. ..."], 
          "correctAnswer": "A", 
          "explanation": "- Step 1: ...\n- Step 2: ...\n=> Conclusion...", 
          "difficulty": "${difficulty}" 
        }
      ]
    `;

    for (const model of modelChain) {
      try {
        // console.log(`Generating ${difficulty} using model: ${model}`); // Debug
        const response = await ai.models.generateContent({
          model: model,
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: arraySchema,
            temperature: 0.7,
          }
        });

        const rawQuestions = JSON.parse(response.text || "[]");
        if (!Array.isArray(rawQuestions) || rawQuestions.length === 0) {
          throw new Error("Empty or invalid JSON response");
        }

        return rawQuestions.map((q: any, index: number) => ({
          id: `${difficulty}-${index}-${Date.now()}-${Math.random()}`,
          text: q.text,
          options: q.options,
          correctAnswer: q.correctAnswer ? q.correctAnswer.replace(/[^ABCD]/g, '').trim() : 'A',
          explanation: q.explanation,
          difficulty: difficulty,
          difficultyLabel: getDifficultyLabel(difficulty)
        }));

      } catch (error: any) {
        console.warn(`Model ${model} failed for ${difficulty}:`, error);
        // Continue to next model in chain
        if (model === modelChain[modelChain.length - 1]) {
          // If this was the last model, throw the error with specific API code if possible
          const errorMsg = error.toString();
          if (errorMsg.includes("429")) throw new Error("429 RESOURCE_EXHAUSTED");
          throw error;
        }
      }
    }

    return []; // Should throw before reaching here if all fail
  };

  // Run in parallel for speed, but each batch has its own internal fallback/retry
  try {
    const [recogQs, underQs, applyQs] = await Promise.all([
      generateBatch(dist.recognition, 'recognition', 'Nhận biết'),
      generateBatch(dist.understanding, 'understanding', 'Thông hiểu'),
      generateBatch(dist.application, 'application', 'Vận dụng')
    ]);

    const allQuestions = [...recogQs, ...underQs, ...applyQs];

    if (allQuestions.length === 0) {
      throw new Error("Không thể tạo câu hỏi. Tất cả các model đều thất bại. Vui lòng kiểm tra API Key và Quota.");
    }

    return allQuestions.sort(() => Math.random() - 0.5);
  } catch (e: any) {
    throw e;
  }
};

// --- CHAT TUTOR SERVICE ---

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  image?: string;
}

export const getChatTutorResponse = async (history: ChatMessage[], newMessage: string, imageBase64?: string): Promise<string> => {
  const apiKey = getApiKey();
  if (!apiKey) return "Vui lòng nhập API Key trong Settings để sử dụng Chat.";

  const ai = new GoogleGenAI({ apiKey });

  const preferredModel = getModel();
  const modelChain = [preferredModel, ...FALLBACK_ORDER].filter((v, i, a) => a.indexOf(v) === i);

  const systemInstruction = `
    VAI TRÒ:
    - Bạn là "Thầy Toán AI", một gia sư toán học thân thiện, kiên nhẫn và thông thái.
    - Nhiệm vụ: Giúp học sinh hiểu bài, giải toán từ ảnh (OCR), và hướng dẫn tư duy.
    - Đối tượng: Học sinh từ lớp 1 đến lớp 12.

    QUY TẮC ĐỊNH DẠNG TOÁN HỌC (UNICODE ONLY - NO LATEX):
    - KHÔNG dùng cú pháp LaTeX ($, \\frac, \\sqrt...).
    - Dùng ký tự Unicode: 1/2, x², √x, ⇒, ΔABC, ∠A, π, °...

    QUY TẮC SƯ PHẠM CHUNG:
    1. Hiểu câu hỏi & Xác nhận.
    2. Phương pháp Socrate: Gợi mở để học sinh tự tư duy.
    3. Giải thích từng bước dễ hiểu.
    4. Kiểm tra lại bằng bài toán tương tự.
    5. Luôn tích cực, dùng emoji (👋😊💡🎯).

    WORKFLOW XỬ LÝ ẢNH (OCR):
    1. Trích xuất văn bản/công thức.
    2. Nếu mờ -> yêu cầu chụp lại.
    3. Nếu đọc được -> Trả lời theo cấu trúc: 
       ## 📷 Đề bài nhận dạng: ...
       ## ❓ Xác nhận: ...
       ## 📖 Hướng dẫn giải: ...
       ## 💡 Lưu ý: ...
  `;

  const chatHistory = history.map(msg => ({
    role: msg.role,
    parts: [{ text: msg.text }]
  }));

  let contentParts: any[] = [];
  if (imageBase64) {
    const mimeMatch = imageBase64.match(/^data:([^;]+);base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";
    const cleanBase64 = imageBase64.replace(/^data:([^;]+);base64,/, '');
    contentParts.push({ inlineData: { data: cleanBase64, mimeType: mimeType } });
  }
  contentParts.push({ text: newMessage || "Hãy giải bài này giúp em." });

  for (const model of modelChain) {
    try {
      const chat = ai.chats.create({
        model: model,
        config: { systemInstruction, temperature: 0.7 },
        history: chatHistory
      });

      const result = await chat.sendMessage({ message: { parts: contentParts } });
      return result.text;

    } catch (error) {
      console.warn(`Chat Model ${model} failed:`, error);
      if (model === modelChain[modelChain.length - 1]) {
        const errStr = String(error);
        if (errStr.includes("429") || errStr.includes("RESOURCE_EXHAUSTED")) {
          return "⚠️ Hệ thống đang quá tải (Lỗi 429). Vui lòng thử lại sau giây lát hoặc đổi API Key.";
        }
        return `⚠️ Lỗi kết nối: ${errStr}. Vui lòng kiểm tra API Key.`;
      }
    }
  }

  return "Xin lỗi, thầy không thể kết nối ngay lúc này. 😔";
};
