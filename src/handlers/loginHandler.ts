import { ZaloEvent } from '../types/zalo';
import { ZaloBot } from '../lib/ZaloBot';
import { TVULoginCredentials, TVUUserInfo } from '../types/tvu';
import axios from 'axios';
import { ScheduleService } from '../services/scheduleService';

export async function handleLoginCommand(event: ZaloEvent, bot: ZaloBot): Promise<void> {
  const { message } = event;
  
  if (!message.text || !message.text.startsWith('/login')) {
    return;
  }

  const parts = message.text.split(' ');
  if (parts.length < 3) {
    await bot.sendMessage(message.from.id, 'Cách sử dụng: /login &lt;mssv&gt; &lt;mật khẩu&gt;');
    return;
  }

  const username = parts[1];
  const password = parts[2];

  try {
    const userInfo = await loginToTVU(username, password);
    await bot.sendMessage(
      message.from.id, 
      `Đăng nhập thành công!\nChào mừng ${userInfo.FullName} 👋\nMSSV: ${userInfo.userName}\nVai trò: ${userInfo.roles}`
    );
  } catch (error: any) {
    console.error('Login failed:', error);
    await bot.sendMessage(
      message.from.id, 
      'Đăng nhập thất bại. Vui lòng kiểm tra thông tin đăng nhập và thử lại.'
    );
  }
}

export async function loginToTVU(username: string, password: string): Promise<TVUUserInfo> {
  const credentials: TVULoginCredentials = {
    username,
    password,
    uri: 'https://ttsv.tvu.edu.vn/#/home'
  };

  // Encode credentials to Base64
  const code = Buffer.from(JSON.stringify(credentials)).toString('base64');

  try {
    // Send GET request to TVU API
    const response = await axios.get('https://ttsv.tvu.edu.vn/api/pn-signin', {
      params: {
        code,
        mgr: 1
      },
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      maxRedirects: 0,
      validateStatus: (status) => status === 302
    });

    // Extract location header
    const location = response.headers['location'];
    if (!location) {
      throw new Error('Đăng nhập thất bại: Không tìm thấy thông tin chuyển hướng');
    }

    // Parse user information from location URL
    const urlParams = new URLSearchParams(location.split('?')[1]);
    const currUser = urlParams.get('CurrUser');
    if (!currUser) {
      throw new Error('Đăng nhập thất bại: Không tìm thấy thông tin người dùng');
    }

    // Validate Base64 string
    if (!isValidBase64(currUser)) {
      throw new Error('Đăng nhập thất bại: Thông tin người dùng không hợp lệ');
    }

    // Decode CurrUser parameter
    try {
      const userInfo = JSON.parse(Buffer.from(currUser, 'base64').toString('utf-8'));
      
      // Save token for subsequent requests
      const scheduleService = ScheduleService.getInstance();
      scheduleService.setToken(userInfo.access_token);
      
      return userInfo;
    } catch (decodeError: any) {
      throw new Error(`Đăng nhập thất bại: ${decodeError.message}`);
    }
  } catch (error: any) {
    console.error('TVU Login failed:', error);
    throw error;
  }
}

function isValidBase64(str: string): boolean {
  try {
    return Buffer.from(str, 'base64').toString('base64') === str;
  } catch {
    return false;
  }
}
