# Zalo Chatbot TVU - Tra Cứu Thời Khóa Biểu

Một chatbot Zalo thông minh được xây dựng bằng TypeScript, tích hợp với hệ thống TVU (Trường Đại học Trà Vinh) để tra cứu thời khóa biểu và quản lý lịch học.

## ✨ Tính năng chính

### 🔐 Xác thực & Đăng nhập
- ✅ Đăng nhập vào hệ thống TVU với MSSV và mật khẩu
- ✅ Quản lý phiên đăng nhập tự động
- ✅ Duy trì token và refresh session thông minh

### 📅 Quản lý thời khóa biểu
- ✅ Tra cứu thời khóa biểu theo tuần
- ✅ Xem lịch học hôm nay và ngày mai
- ✅ Hiển thị thông tin chi tiết môn học, giảng viên, phòng học
- ✅ Tự động cập nhật lịch từ hệ thống TVU

### 🔔 Thông báo thông minh
- ✅ Đăng ký nhận thông báo lịch học
- ✅ Tự động thông báo khi có thay đổi lịch
- ✅ Notification service linh hoạt

### 🤖 Chatbot cơ bản
- ✅ Nhận và xử lý tin nhắn văn bản
- ✅ Hỗ trợ tin nhắn hình ảnh, sticker, video, audio  
- ✅ Xử lý tin nhắn vị trí và file
- ✅ Cơ chế polling để nhận tin nhắn real-time
- ✅ Handlers có thể mở rộng dễ dàng
- ✅ TypeScript với type safety hoàn toàn
- ✅ API URL mới: `https://bot-api.zapps.me/bot<TOKEN>/<function>`

## 🚀 Cài đặt

### Yêu cầu hệ thống
- Node.js >= 16.0.0
- npm >= 8.0.0

### Bước cài đặt

1. Clone repository:
  ```bash
  git clone <repository-url>
  cd ZaloBot
  ```

2. Cài đặt dependencies:
  ```bash
  npm install
  ```

3. Tạo file `.env` và cấu hình:
  ```env
  ZALO_BOT_TOKEN=your_bot_token_here
  POLLING_INTERVAL=3000
  TVU_BASE_URL=https://ttsv.tvu.edu.vn
  ```

## 📋 Hướng dẫn sử dụng

### 🔧 Development mode
  ```bash
  npm run dev
  ```

### 🏗️ Build và chạy production
  ```bash
  npm run build
  npm start
  ```

### 👀 Watch mode (auto-restart on changes)
  ```bash
  npm run watch
  ```

## 🤖 Lệnh Bot

### Lệnh cơ bản
- `hello` hoặc `hi` - Chào hỏi
- `help` hoặc `giúp` - Hiển thị hướng dẫn
- `time` hoặc `thời gian` - Hiển thị thời gian hiện tại
- `echo [text]` - Lặp lại tin nhắn

### Lệnh TVU - Thời khóa biểu
- `/login <mssv> <mật_khẩu>` - Đăng nhập vào hệ thống TVU
- `/tkb` - Xem thời khóa biểu hôm nay
- `/tkb mai` - Xem thời khóa biểu ngày mai
- `/notify` - Đăng ký/hủy thông báo lịch học

### Ví dụ sử dụng
  ```
  /login 2051052001 password123
  /tkb
  /tkb mai
  /notify
  ```

## 📁 Cấu trúc dự án

  ```
  src/
  ├── types/
  │   ├── zalo.ts          # TypeScript types cho Zalo API
  │   ├── tvu.ts           # TypeScript types cho TVU API
  │   └── schedule.ts      # Types cho thời khóa biểu
  ├── lib/
  │   └── ZaloBot.ts       # Core bot class
  ├── handlers/
  │   ├── messageHandlers.ts # Message handlers chung
  │   ├── loginHandler.ts    # Xử lý đăng nhập TVU
  │   └── scheduleHandler.ts # Xử lý lệnh thời khóa biểu
  ├── services/
  │   ├── scheduleService.ts     # Service tra cứu lịch học
  │   ├── sessionManager.ts     # Quản lý phiên đăng nhập
  │   └── notificationService.ts # Service thông báo
  └── index.ts             # Entry point
  ```

## 🏗️ Kiến trúc hệ thống

### Core Components

1. **ZaloBot**: Core bot engine xử lý API Zalo
2. **SessionManager**: Quản lý phiên đăng nhập TVU và refresh token
3. **ScheduleService**: Tích hợp với TVU API để lấy dữ liệu lịch học
4. **NotificationService**: Hệ thống thông báo tự động
5. **Handlers**: Xử lý các loại message và command khác nhau

### Workflow

1. User gửi `/login` → Xác thực với TVU → Lưu session
2. User gửi `/tkb` → Lấy dữ liệu từ TVU API → Format và trả về
3. Background: Auto refresh token + check schedule changes
4. Notification service → Gửi thông báo khi có thay đổi

## 🔧 Mở rộng và phát triển

### Thêm handler mới

1. Tạo handler function trong thư mục `src/handlers/`:
  ```typescript
  // src/handlers/customHandler.ts
  import { ZaloEvent } from '../types/zalo';
  import { ZaloBot } from '../lib/ZaloBot';

  export async function handleCustomCommand(event: ZaloEvent, bot: ZaloBot): Promise<void> {
    // Your logic here
  }
  ```

2. Import và sử dụng trong `src/index.ts`

### Thêm service mới

1. Tạo service class trong `src/services/`:
  ```typescript
  // src/services/customService.ts
  export class CustomService {
    private static instance: CustomService;
    
    public static getInstance(): CustomService {
      if (!CustomService.instance) {
        CustomService.instance = new CustomService();
      }
      return CustomService.instance;
    }
    
    // Your methods here
  }
  ```

### Thêm API endpoints mới

Mở rộng class `ZaloBot` trong `src/lib/ZaloBot.ts` để thêm các method API mới hoặc tạo service riêng cho API integration.

## ⚙️ Configuration

### Environment Variables

Bot sử dụng các biến môi trường từ file `.env`:

  ```env
  # Zalo Bot Configuration (Bắt buộc)
  ZALO_BOT_TOKEN=your_bot_token_here
  
  # Polling Configuration (Tùy chọn)
  POLLING_INTERVAL=3000
  
  # TVU API Configuration (Bắt buộc cho tính năng lịch học)
  TVU_BASE_URL=https://ttsv.tvu.edu.vn
  
  # Custom API URL (Tùy chọn)
  ZALO_API_URL=https://bot-api.zapps.me
  ```

### Cấu hình chi tiết

- **ZALO_BOT_TOKEN**: Token của Zalo Bot (lấy từ Zalo Developers)
- **POLLING_INTERVAL**: Khoảng thời gian polling (milliseconds, mặc định: 3000)
- **TVU_BASE_URL**: URL base của hệ thống TVU
- **ZALO_API_URL**: Custom API URL (mặc định: https://bot-api.zapps.me)

## 🔗 API Information

### Zalo Bot API
- **Base URL**: `https://bot-api.zapps.me/bot<TOKEN>/`
- **getMe**: Lấy thông tin bot
- **getUpdates**: Nhận tin nhắn mới (polling)
- **sendMessage**: Gửi tin nhắn

### TVU API Integration
- **Base URL**: `https://ttsv.tvu.edu.vn`
- **Authentication**: Base64 encoded credentials
- **Schedule API**: Lấy dữ liệu thời khóa biểu theo tuần
- **Session Management**: Auto refresh token mechanism

## 🛠️ Troubleshooting

### Bot không nhận được tin nhắn
1. ✅ Kiểm tra bot token có đúng không
2. ✅ Đảm bảo OA đã được approve
3. ✅ Kiểm tra network connection
4. ✅ Verify ZALO_BOT_TOKEN trong file .env

### Lỗi đăng nhập TVU
1. ✅ Kiểm tra MSSV và mật khẩu chính xác
2. ✅ Đảm bảo tài khoản TVU không bị khóa
3. ✅ Kiểm tra TVU_BASE_URL trong cấu hình
4. ✅ Verify network có thể access ttsv.tvu.edu.vn

### Không thể lấy thời khóa biểu
1. ✅ Đảm bảo đã đăng nhập thành công trước
2. ✅ Kiểm tra session còn hiệu lực
3. ✅ Verify API endpoints TVU không thay đổi

### API errors
- ✅ Kiểm tra logs để xem error messages chi tiết
- ✅ Verify API endpoints và parameters
- ✅ Check rate limiting và timeout settings

### Performance issues
- ✅ Monitor memory usage của session management
- ✅ Optimize polling interval dựa trên usage pattern
- ✅ Consider implementing webhook thay vì polling

## 📝 Development Notes

### Known Issues
- TVU API có thể thay đổi endpoint mà không thông báo
- Session timeout cần được handle gracefully
- Polling interval cần balance giữa real-time và performance

### Future Improvements
- [ ] Implement webhook thay vì polling
- [ ] Add caching layer cho schedule data
- [ ] Support multiple universities
- [ ] Add web dashboard cho admin
- [ ] Implement rate limiting protection

## 🤝 Contributing

1. Fork repository
2. Tạo feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📄 License

MIT License - xem file [LICENSE](LICENSE) để biết thêm chi tiết.
