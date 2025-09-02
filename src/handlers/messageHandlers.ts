import { ZaloEvent } from '../types/zalo';
import { ZaloBot } from '../lib/ZaloBot';

/**
 * Handle text messages
 */
export async function handleTextMessage(event: ZaloEvent, bot: ZaloBot): Promise<void> {
  const text = event.message.text;
  const chatId = event.message.chat.id;

  if (!text) return;

  console.log(`Received text message from ${event.message.from.display_name} (${chatId}): ${text}`);

  // Basic echo bot functionality
  if (text.toLowerCase().includes('hello') || text.toLowerCase().includes('hi')) {
    await bot.sendMessage(chatId, 'Xin chào! Tôi là Zalo Bot. Tôi có thể giúp gì cho bạn?');
  } else if (text.toLowerCase().includes('help') || text.toLowerCase().includes('giúp')) {
    const helpMessage = `
🤖 Zalo Bot Commands:
• Gửi "hello" hoặc "hi" để chào hỏi
• Gửi "help" để xem hướng dẫn
• Gửi "time" để xem thời gian hiện tại
• Gửi "echo [text]" để bot lặp lại tin nhắn
    `;
    await bot.sendMessage(chatId, helpMessage.trim());
  } else if (text.toLowerCase().includes('time') || text.toLowerCase().includes('thời gian')) {
    const currentTime = new Date().toLocaleString('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh'
    });
    await bot.sendMessage(chatId, `⏰ Thời gian hiện tại: ${currentTime}`);
  } else if (text.toLowerCase().startsWith('echo ')) {
    const echoText = text.substring(5);
    await bot.sendMessage(chatId, `🔄 Echo: ${echoText}`);
  }
}

/**
 * Handle image messages
 */
export async function handleImageMessage(event: ZaloEvent): Promise<void> {
  const chatId = event.message.chat.id;
  const userName = event.message.from.display_name;
  console.log(`Received image message from ${userName} (${chatId})`);
  
  // Không cần gửi phản hồi khi nhận ảnh
}

/**
 * Handle sticker messages
 */
export async function handleStickerMessage(event: ZaloEvent): Promise<void> {
  const chatId = event.message.chat.id;
  const userName = event.message.from.display_name;
  console.log(`Received sticker message from ${userName} (${chatId})`);
  
  // Không cần gửi phản hồi khi nhận sticker
}

/**
 * Handle location messages
 */
export async function handleLocationMessage(event: ZaloEvent): Promise<void> {
  const chatId = event.message.chat.id;
  const userName = event.message.from.display_name;
  console.log(`Received location message from ${userName} (${chatId})`);
  
  // Không cần gửi phản hồi khi nhận location
}

/**
 * Handle file messages
 */
export async function handleFileMessage(event: ZaloEvent): Promise<void> {
  const chatId = event.message.chat.id;
  const userName = event.message.from.display_name;
  console.log(`Received file message from ${userName} (${chatId})`);
  
  // Không cần gửi phản hồi khi nhận file
}

/**
 * Handle audio messages
 */
export async function handleAudioMessage(event: ZaloEvent): Promise<void> {
  const chatId = event.message.chat.id;
  const userName = event.message.from.display_name;
  console.log(`Received audio message from ${userName} (${chatId})`);
  
  // Không cần gửi phản hồi khi nhận audio
}

/**
 * Handle video messages
 */
export async function handleVideoMessage(event: ZaloEvent): Promise<void> {
  const chatId = event.message.chat.id;
  const userName = event.message.from.display_name;
  console.log(`Received video message from ${userName} (${chatId})`);
  
  // Không cần gửi phản hồi khi nhận video
}
