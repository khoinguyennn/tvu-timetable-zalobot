import axios, { AxiosInstance } from 'axios';
import {
  BotConfig,
  ZaloEvent,
  GetUpdatesResponse,
  SendMessageRequest,
  SendMessageResponse,
  MessageHandler
} from '../types/zalo';

// Zalo Bot API URL format: https://bot-api.zapps.me/bot<BOT_TOKEN>/<functionName>
const ZALO_BOT_API_BASE = 'https://bot-api.zapps.me/bot';

export class ZaloBot {
  private token: string;
  private apiClient: AxiosInstance;
  private pollingInterval: number;
  private isPolling: boolean = false;
  private lastOffset: number = 0;
  private messageHandlers: MessageHandler[] = [];

  constructor(config: BotConfig) {
    this.token = config.token;
    this.pollingInterval = config.pollingInterval || 3000; // 3 seconds default

    // API URL format: https://bot-api.zapps.me/bot<BOT_TOKEN>/<functionName>
    const apiBaseURL = config.apiUrl || `${ZALO_BOT_API_BASE}${this.token}`;
    
    this.apiClient = axios.create({
      baseURL: apiBaseURL,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Add a message handler
   */
  public onMessage(handler: MessageHandler): void {
    this.messageHandlers.push(handler);
  }

  /**
   * Send a text message to a user
   */
  public async sendMessage(chatId: string, text: string): Promise<SendMessageResponse> {
    const payload: SendMessageRequest = {
      chat_id: chatId,
      text: text
    };

    try {
      const response = await this.apiClient.post<SendMessageResponse>('/sendMessage', payload);
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  /**
   * Send an image message to a user
   */
  public async sendImage(chatId: string, imageUrl: string): Promise<SendMessageResponse> {
    const payload: SendMessageRequest = {
      chat_id: chatId,
      attachment: {
        type: 'image',
        payload: {
          url: imageUrl
        }
      }
    };

    try {
      const response = await this.apiClient.post<SendMessageResponse>('/sendMessage', payload);
      return response.data;
    } catch (error) {
      console.error('Error sending image:', error);
      throw error;
    }
  }

  /**
   * Get updates from Zalo API using polling
   */
  private async getUpdates(): Promise<GetUpdatesResponse> {
    try {
      const response = await this.apiClient.get<GetUpdatesResponse>('/getUpdates', {
        params: {
          offset: this.lastOffset,
          limit: 10
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting updates:', error);
      throw error;
    }
  }

  /**
   * Process incoming events
   */
  private async processEvents(events: ZaloEvent[]): Promise<void> {
    for (const event of events) {
      try {
        // Execute all message handlers
        await Promise.all(
          this.messageHandlers.map(handler => handler(event))
        );
      } catch (error) {
        console.error('Error processing event:', error);
      }
    }
  }

  /**
   * Start polling for updates
   */
  public async startPolling(): Promise<void> {
    if (this.isPolling) {
      console.log('Bot is already polling');
      return;
    }

    this.isPolling = true;
    console.log('Starting Zalo bot polling...');

    while (this.isPolling) {
      try {
        const response = await this.getUpdates();

        if (response.ok && response.result) {
          // Process single event from response
          await this.processEvents([response.result]);
          // Update offset for next polling
          this.lastOffset = this.lastOffset + 1;
        }
      } catch (error) {
        console.error('Polling error:', error);
      }

      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, this.pollingInterval));
    }
  }

  /**
   * Stop polling
   */
  public stopPolling(): void {
    this.isPolling = false;
    console.log('Stopped Zalo bot polling');
  }

  /**
   * Get bot info
   */
  public async getBotInfo(): Promise<any> {
    try {
      const response = await this.apiClient.get('/getMe');
      return response.data;
    } catch (error) {
      console.error('Error getting bot info:', error);
      throw error;
    }
  }


}
