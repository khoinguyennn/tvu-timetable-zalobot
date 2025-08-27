# Zalo Chatbot

Một chatbot Zalo được xây dựng bằng TypeScript, sử dụng Zalo Bot API mới (zapps.me).

## ✨ Tính năng

- ✅ Nhận và xử lý tin nhắn văn bản
- ✅ Hỗ trợ tin nhắn hình ảnh, sticker, video, audio  
- ✅ Xử lý tin nhắn vị trí và file
- ✅ Cơ chế polling để nhận tin nhắn real-time
- ✅ Handlers có thể mở rộng dễ dàng
- ✅ TypeScript với type safety hoàn toàn
- ✅ API URL mới: `https://bot-api.zapps.me/bot<TOKEN>/<function>`

## 🚀 Cài đặt

1. Clone repository:
```bash
git clone <repository-url>
cd ZaloBot
```

2. Cài đặt dependencies:
```bash
npm install
```

3. Tạo file `.env` và thêm bot token:
```env
ZALO_BOT_TOKEN=your_bot_token_here
POLLING_INTERVAL=3000
```

## Sử dụng

### Development mode
```bash
npm run dev
```

### Build và chạy production
```bash
npm run build
npm start
```

### Watch mode (auto-restart on changes)
```bash
npm run watch
```

## Cấu trúc dự án

```
src/
├── types/
│   └── zalo.ts          # TypeScript types cho Zalo API
├── lib/
│   └── ZaloBot.ts       # Core bot class
├── handlers/
│   └── messageHandlers.ts # Message handlers
└── index.ts             # Entry point
```

## 🤖 Bot Commands

Bot hỗ trợ các lệnh cơ bản:

- `hello` hoặc `hi` - Chào hỏi
- `help` hoặc `giúp` - Hiển thị hướng dẫn
- `time` hoặc `thời gian` - Hiển thị thời gian hiện tại
- `echo [text]` - Lặp lại tin nhắn

Bot cũng sẽ respond với các loại media khác như hình ảnh, sticker, video, v.v.

## Mở rộng

### Thêm handler mới

1. Tạo handler function trong `src/handlers/messageHandlers.ts`:
```typescript
export async function handleCustomMessage(event: ZaloEvent, bot: ZaloBot): Promise<void> {
  // Your logic here
}
```

2. Thêm vào switch case trong `src/index.ts`

### Thêm API endpoints mới

Mở rộng class `ZaloBot` trong `src/lib/ZaloBot.ts` để thêm các method API mới.

## ⚙️ Configuration

Bot sử dụng environment variables từ file `.env`:

1. **Tạo file `.env`** (bắt buộc):
```env
ZALO_BOT_TOKEN=your_bot_token_here
POLLING_INTERVAL=3000
```

2. **Environment Variables**:
   - `ZALO_BOT_TOKEN` (bắt buộc): Token của Zalo Bot
   - `POLLING_INTERVAL` (tùy chọn): Polling interval tính bằng milliseconds (mặc định: 3000)
   - `ZALO_API_URL` (tùy chọn): Custom API URL

## 🔗 API Information

- **Base URL**: `https://bot-api.zapps.me/bot<TOKEN>/`
- **getMe**: Lấy thông tin bot
- **getUpdates**: Nhận tin nhắn mới (polling)
- **sendMessage**: Gửi tin nhắn

## Troubleshooting

### Bot không nhận được tin nhắn
1. Kiểm tra bot token có đúng không
2. Đảm bảo OA đã được approve
3. Kiểm tra network connection

### API errors
- Kiểm tra logs để xem error messages chi tiết
- Verify API endpoints và parameters

## License

MIT
