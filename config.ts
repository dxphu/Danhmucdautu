
/**
 * FinSmart Configuration
 * Tập trung tất cả cấu hình hệ thống vào một nơi duy nhất.
 */

export const CONFIG = {
  // Cấu hình cho Google Gemini AI
  GEMINI: {
    // Không hardcode API Key ở đây, SDK sẽ lấy từ process.env.API_KEY
    MODEL: 'gemini-3-flash-preview',
    API_KEY:'AIzaSyDhgaqfa_cDWdEpl-nqIGtcdD4YotZgI-Q',
    SYSTEM_INSTRUCTION: 'Bạn là một chuyên gia tư vấn tài chính cá nhân, hỗ trợ phân tích danh mục đầu tư.',
  },

  // Cấu hình cho Supabase
  SUPABASE: {
    URL: 'https://evyoqbkdnneiqmamwkll.supabase.co',
    ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2eW9xYmtkbm5laXFtYW13a2xsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5ODU1NDQsImV4cCI6MjA4NTU2MTU0NH0.0bFrMYG0dwJdsLeG096u1L18oBh6BaQpQ_J8kcKojUI',
  },

  // Cấu hình ứng dụng
  APP: {
    NAME: 'FinSmart Rebalance',
    VERSION: '2.0.2',
    MONTHLY_INVESTMENT: 40000000, // 40,000,000 VND
    STORAGE_KEY: 'finsmart_assets',
    CURRENCY: 'VND',
    LOCALES: 'vi-VN',
  },

  // Cấu hình màu sắc thương hiệu
  COLORS: {
    PRIMARY: '#10b981', // Emerald 500
    SECONDARY: '#3b82f6', // Blue 500
    BACKGROUND: '#0a0a0a',
    CARD: '#18181b', // Zinc 900
  }
};
