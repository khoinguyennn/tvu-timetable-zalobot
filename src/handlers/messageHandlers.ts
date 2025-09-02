import { ZaloEvent } from '../types/zalo';
import { ZaloBot } from '../lib/ZaloBot';
import { NotificationService } from '../services/notificationService';
import { SessionManager } from '../services/sessionManager';

/**
 * Handle text messages
 */
export async function handleTextMessage(event: ZaloEvent, bot: ZaloBot): Promise<void> {
  const text = event.message.text;
  const chatId = event.message.chat.id;

  if (!text) return;

  console.log(`Received text message from ${event.message.from.display_name} (${chatId}): ${text}`);

  const notificationService = NotificationService.getInstance(bot);

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
• Gửi "bật thông báo" để nhận thông báo lịch học hàng ngày
• Gửi "tắt thông báo" để tắt thông báo lịch học
• Gửi "lưu tài khoản <username> <password>" để lưu thông tin đăng nhập TTSV
• Gửi "xóa tài khoản" để xóa thông tin đăng nhập đã lưu
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
  } else if (text.toLowerCase() === 'bật thông báo') {
    if (notificationService.subscribe(chatId)) {
      await bot.sendMessage(chatId, '✅ Đã bật thông báo lịch học hàng ngày. Bạn sẽ nhận được thông báo vào 6:00 sáng.');
    } else {
      await bot.sendMessage(chatId, '⚠️ Bạn đã đăng ký nhận thông báo từ trước.');
    }
  } else if (text.toLowerCase() === 'tắt thông báo') {
    if (notificationService.unsubscribe(chatId)) {
      await bot.sendMessage(chatId, '❌ Đã tắt thông báo lịch học hàng ngày.');
    } else {
      await bot.sendMessage(chatId, '⚠️ Bạn chưa đăng ký nhận thông báo.');
    }
  } else if (text.toLowerCase().startsWith('lưu tài khoản')) {
    const sessionManager = SessionManager.getInstance();
    // Format: lưu tài khoản <username> <password>
    const parts = text.split(' ');
    if (parts.length === 4) {
      const [_, __, username, password] = parts;
      sessionManager.saveCredentials(chatId, { username, password });
      await bot.sendMessage(chatId, '✅ Đã lưu thông tin đăng nhập của bạn. Bot sẽ tự động duy trì phiên đăng nhập.');
      
      // Bắt đầu phiên ngay lập tức
      const token = await sessionManager.refreshSession(chatId);
      if (token) {
        sessionManager.startPingSession(chatId, token);
      }
    } else {
      await bot.sendMessage(chatId, '❌ Sai cú pháp. Vui lòng sử dụng: lưu tài khoản <username> <password>');
    }
  } else if (text.toLowerCase() === 'xóa tài khoản') {
    const sessionManager = SessionManager.getInstance();
    if (sessionManager.hasStoredCredentials(chatId)) {
      sessionManager.clearCredentials(chatId);
      sessionManager.stopPingSession();
      await bot.sendMessage(chatId, '✅ Đã xóa thông tin đăng nhập của bạn.');
    } else {
      await bot.sendMessage(chatId, '⚠️ Không có thông tin đăng nhập nào được lưu.');
    }
  }
}
