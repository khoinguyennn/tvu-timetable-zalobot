import axios, { AxiosError } from 'axios';

export interface Credentials {
  username: string;
  password: string;
}

export class SessionManager {
  private static instance: SessionManager;
  private credentials: Map<string, Credentials> = new Map();
  private pingInterval: NodeJS.Timeout | null = null;
  private tokens: Map<string, string> = new Map(); // Lưu trữ token cho mỗi user
  private readonly PING_INTERVAL = 120000; // 2 phút
  private readonly MAX_RETRIES = 3;
  private readonly REQUEST_TIMEOUT = 10000; // 10 giây

  // Tạo instance axios với timeout và interceptor
  private axiosInstance = axios.create({
    timeout: this.REQUEST_TIMEOUT,
    validateStatus: status => status < 500 // Chỉ reject khi status >= 500
  });

  private async handleTokenExpiration(userId: string, error: any): Promise<string | null> {
    // Kiểm tra lỗi token hết hạn (401) hoặc token không hợp lệ (403)
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.log(`Token expired or invalid for user ${userId}, refreshing session...`);
      const newToken = await this.refreshSession(userId);
      if (newToken) {
        this.tokens.set(userId, newToken);
        this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        return newToken;
      }
    }
    return null;
  }

  private constructor() {}

  public static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  public saveCredentials(userId: string, credentials: Credentials): void {
    this.credentials.set(userId, credentials);
    // Xóa token cũ khi lưu credentials mới
    this.tokens.delete(userId);
  }

  public getCurrentToken(userId: string): string | null {
    return this.tokens.get(userId) || null;
  }

  private async retryRequest(request: () => Promise<any>, retries = this.MAX_RETRIES): Promise<any> {
    try {
      return await request();
    } catch (error: any) {
      if (retries > 0 && (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT' || error.response?.status >= 500)) {
        console.log(`Retrying request, ${retries} attempts remaining...`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Đợi 1 giây trước khi thử lại
        return this.retryRequest(request, retries - 1);
      }
      throw error;
    }
  }

  public async refreshSession(userId: string): Promise<string | null> {
    const credentials = this.credentials.get(userId);
    if (!credentials) {
      console.log(`No stored credentials for user ${userId}`);
      return null;
    }

    try {
      // Tạo credentials object theo format yêu cầu
      const loginCredentials = {
        username: credentials.username,
        password: credentials.password,
        uri: 'https://ttsv.tvu.edu.vn/#/home'
      };

      // Encode credentials to Base64
      const code = Buffer.from(JSON.stringify(loginCredentials)).toString('base64');

      // Gọi API đăng nhập với retry mechanism
      const response = await this.retryRequest(() => 
        this.axiosInstance.get('https://ttsv.tvu.edu.vn/api/pn-signin', {
          params: { code }
        })
      );

      if (response.data?.Token) {
        console.log(`Successfully refreshed session for user ${userId}`);
        return response.data.Token;
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error(`Failed to refresh session for user ${userId}: ${error.code} - ${error.message}`);
      } else {
        console.error(`Failed to refresh session for user ${userId}:`, error);
      }
    }

    return null;
  }

  public startPingSession(userId: string, token: string): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }

    // Lưu token ban đầu
    this.tokens.set(userId, token);
    this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    this.pingInterval = setInterval(async () => {
      try {
        // Lấy token hiện tại
        const currentToken = this.tokens.get(userId);
        if (!currentToken) {
          console.error('No token found for user', userId);
          this.stopPingSession();
          return;
        }

        // Gửi ping để giữ session với retry mechanism
        const response = await this.retryRequest(() =>
          this.axiosInstance.get('https://ttsv.tvu.edu.vn/signalr/ping', {
            headers: {
              Authorization: `Bearer ${currentToken}`
            }
          })
        );

        if (response.data?.Response !== 'pong') {
          console.log('Ping failed, attempting to refresh session...');
          const newToken = await this.refreshSession(userId);
          if (newToken) {
            this.tokens.set(userId, newToken);
            this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
          } else {
            console.error('Failed to refresh token after failed ping');
            this.stopPingSession();
          }
        }
      } catch (error) {
        if (error instanceof AxiosError) {
          console.error(`Ping failed: ${error.code} - ${error.message}`);
          // Xử lý token hết hạn
          const newToken = await this.handleTokenExpiration(userId, error);
          if (!newToken) {
            console.error('Failed to refresh token after error');
            this.stopPingSession();
          }
        } else {
          console.error('Ping failed:', error);
          this.stopPingSession();
        }
      }
    }, this.PING_INTERVAL);
  }

  public stopPingSession(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  public hasStoredCredentials(userId: string): boolean {
    return this.credentials.has(userId);
  }

  public clearCredentials(userId: string): void {
    this.credentials.delete(userId);
  }
}
