import { GradeConfig, ThemeConfig, EducationLevel, DifficultyConfig } from './types';

export const LEVELS: Record<EducationLevel, string> = {
  middle: 'THCS 📚',
};

export const THEMES: Record<EducationLevel, ThemeConfig> = {
  middle: {
    bg: 'bg-[#E3F2FD]', // Blue
    primary: 'bg-[#2196F3]',
    primaryHover: 'hover:bg-[#42A5F5]',
    text: 'text-blue-800',
    border: 'border-blue-200',
    badge: 'bg-blue-100 text-blue-700',
    gradient: 'from-[#2196F3] to-[#03A9F4]',
  },
};

export const DIFFICULTY_CONFIG: Record<string, DifficultyConfig> = {
  recognition: { id: 'recognition', label: 'Nhận biết', color: 'bg-[#66BB6A]', textColor: 'text-white' },
  understanding: { id: 'understanding', label: 'Thông hiểu', color: 'bg-[#FFA726]', textColor: 'text-white' },
  application: { id: 'application', label: 'Vận dụng', color: 'bg-[#EF5350]', textColor: 'text-white' },
};

export const CURRICULUM: Record<EducationLevel, GradeConfig[]> = {
  middle: [
    {
      grade: 6,
      label: 'Lớp 6',
      topics: [
        'Số nguyên, phép toán với số nguyên',
        'Phân số, số thập phân nâng cao',
        'Tỉ lệ thức, chia tỉ lệ',
        'Hình học: Góc, đường thẳng song song, đường thẳng vuông góc',
        'Số học: Ước, bội, số nguyên tố',
        'Phân tích số ra thừa số nguyên tố'
      ]
    },
    {
      grade: 7,
      label: 'Lớp 7',
      topics: [
        'Số hữu tỉ, biểu thức đại số',
        'Đơn thức, đa thức một biến',
        'Phương trình bậc nhất một ẩn',
        'Thống kê: Bảng tần số, biểu đồ',
        'Hình học: Tam giác, các trường hợp bằng nhau của tam giác',
        'Quan hệ giữa các yếu tố trong tam giác',
        'Tam giác cân, tam giác đều'
      ]
    },
    {
      grade: 8,
      label: 'Lớp 8',
      topics: [
        'Phân thức đại số',
        'Phương trình bậc nhất hai ẩn, hệ phương trình',
        'Bất phương trình bậc nhất một ẩn',
        'Hình học: Tứ giác, đa giác, diện tích',
        'Hình thang, hình thang cân, hình bình hành',
        'Hình chữ nhật, hình thoi, hình vuông',
        'Định lý Pythagore và ứng dụng'
      ]
    },
    {
      grade: 9,
      label: 'Lớp 9',
      topics: [
        'Căn bậc hai, biểu thức chứa căn',
        'Hàm số bậc nhất, đồ thị hàm số y = ax + b',
        'Phương trình bậc hai một ẩn',
        'Công thức nghiệm, công thức nghiệm thu gọn',
        'Hệ thức Vi-et và ứng dụng',
        'Hệ thức lượng trong tam giác vuông',
        'Tỉ số lượng giác của góc nhọn',
        'Đường tròn, dây cung, góc ở tâm, góc nội tiếp'
      ]
    }
  ]
};