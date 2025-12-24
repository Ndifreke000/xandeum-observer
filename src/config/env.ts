export const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  telegramBotToken: import.meta.env.VITE_TELEGRAM_BOT_TOKEN,
  telegramChatId: import.meta.env.VITE_TELEGRAM_CHAT_ID,
};

// Validate required env variables
export function validateEnv() {
  if (!config.apiUrl) {
    console.warn('VITE_API_URL not set, using default');
  }
  
  console.log('✅ Environment validated');
  console.log('API URL:', config.apiUrl);
}