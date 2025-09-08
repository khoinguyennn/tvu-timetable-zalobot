import axios, { AxiosError } from 'axios';
import { ScheduleResponse, ClassSchedule } from '../types/schedule';
import { SessionManager } from './sessionManager';

export class ScheduleService {
  private static instance: ScheduleService;
  private token: string = '';
  private userId: string = '';

  private constructor() {}

  public static getInstance(): ScheduleService {
    if (!ScheduleService.instance) {
      ScheduleService.instance = new ScheduleService();
    }
    return ScheduleService.instance;
  }

  public setToken(token: string) {
    this.token = token;
  }

  public setUserId(userId: string) {
    this.userId = userId;
  }

  private async handleTokenExpiration(): Promise<string | null> {
    if (!this.userId) {
      console.error('No userId set for token refresh');
      return null;
    }

    console.log('Token expired, attempting to refresh...');
    const sessionManager = SessionManager.getInstance();
    const newToken = await sessionManager.refreshSession(this.userId);
    
    if (newToken) {
      console.log('Token refreshed successfully');
      this.token = newToken;
      return newToken;
    }
    
    return null;
  }

  public async getWeeklySchedule(semester: number = 20251): Promise<ScheduleResponse> {
    if (!this.token) {
      throw new Error('Token not set. Please login first.');
    }

    console.log('Getting schedule for semester:', semester);

    try {
      const response = await axios.post(
        'https://ttsv.tvu.edu.vn/api/sch/w-locdstkbtuanusertheohocky',
        {
          filter: {
            hoc_ky: semester,
            ten_hoc_ky: ''
          },
          additional: {
            paging: {
              limit: 100,
              page: 1
            },
            ordering: [{
              name: null,
              order_type: null
            }]
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        // Thử refresh token
        const newToken = await this.handleTokenExpiration();
        if (newToken) {
          // Thử lại request với token mới
          console.log('Retrying request with new token...');
          return this.getWeeklySchedule(semester);
        }
      }
      throw new Error(`Failed to get schedule: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  public formatSchedule(schedule: ClassSchedule): string {
    // Thêm các biểu tượng ngẫu nhiên cho môn học
    const subjectEmojis = ['📚', '📖', '📗', '📘', '📙', '📔', '📕', '🔬', '💻', '🧮', '🧪', '📐', '📏'];
    const roomEmojis = ['🏫', '🏢', '🏤', '🏛️', '🏗️', '🏠'];
    const teacherEmojis = ['👨‍🏫', '👩‍🏫', '👨‍🎓', '👩‍🎓', '👨‍🔬', '👩‍🔬'];
    
    const getRandomEmoji = (list: string[]) => list[Math.floor(Math.random() * list.length)];
    
    // Tạo thời gian dễ đọc hơn
    const startTiet = schedule.tiet_bat_dau;
    const endTiet = schedule.tiet_bat_dau + schedule.so_tiet - 1;
    
    // Thời gian tiết học (ước lượng)
    const tietToTime = (tiet: number) => {
      const startHours = [7, 7, 8, 9, 10, 13, 13, 14, 15, 16, 18, 18, 19, 20];
      const startMins =  [0, 30, 20, 10, 0, 0, 30, 20, 10, 0, 0, 30, 20, 10];
      if (tiet >= 1 && tiet <= startHours.length) {
        return `${startHours[tiet-1]}:${startMins[tiet-1].toString().padStart(2, '0')}`;
      }
      return "";
    };
    
    const timeStr = `${tietToTime(startTiet)} - ${tietToTime(endTiet + 1)}`;
    
    return `${getRandomEmoji(subjectEmojis)} Môn: ${schedule.ten_mon}\n` +
           `⏰ Tiết ${startTiet}-${endTiet} (${timeStr})\n` +
           `${getRandomEmoji(teacherEmojis)} Giảng viên: ${schedule.ten_giang_vien}\n` +
           `${getRandomEmoji(roomEmojis)} Phòng: ${schedule.ma_phong}\n` +
           `📝 Nhóm: ${schedule.ma_nhom}`;
  }
}
