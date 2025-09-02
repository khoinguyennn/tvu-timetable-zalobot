import { ZaloBot } from '../lib/ZaloBot';
import { ScheduleService } from './scheduleService';

export class NotificationService {
  private static instance: NotificationService;
  private subscribers: Set<string> = new Set();
  private checkInterval: NodeJS.Timeout | null = null;
  private bot: ZaloBot;
  private scheduleService: ScheduleService;

  private constructor(bot: ZaloBot) {
    this.bot = bot;
    this.scheduleService = ScheduleService.getInstance();
  }

  public static getInstance(bot: ZaloBot): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService(bot);
    }
    return NotificationService.instance;
  }

  public subscribe(userId: string): boolean {
    if (this.subscribers.has(userId)) {
      return false;
    }
    this.subscribers.add(userId);
    return true;
  }

  public unsubscribe(userId: string): boolean {
    return this.subscribers.delete(userId);
  }

  public isSubscribed(userId: string): boolean {
    return this.subscribers.has(userId);
  }

  public startScheduler(): void {
    if (this.checkInterval) {
      return;
    }

    // Kiểm tra mỗi phút
    this.checkInterval = setInterval(async () => {
      const now = new Date();
      
      // Kiểm tra nếu là 6:00 sáng
      if (now.getHours() === 6 && now.getMinutes() === 0) {
        await this.sendDailySchedule();
      }
    }, 60000); // 1 phút
  }

  public stopScheduler(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  private async sendDailySchedule(): Promise<void> {
    try {
      const response = await this.scheduleService.getWeeklySchedule();
      const today = new Date();
      const formattedDate = today.toISOString().split('T')[0];

      // Tìm tuần hiện tại
      const currentWeek = response.data.ds_tuan_tkb.find(week => {
        const [startDay, startMonth, startYear] = week.ngay_bat_dau.split('/');
        const [endDay, endMonth, endYear] = week.ngay_ket_thuc.split('/');
        
        const startDate = new Date(parseInt(startYear), parseInt(startMonth) - 1, parseInt(startDay));
        const endDate = new Date(parseInt(endYear), parseInt(endMonth) - 1, parseInt(endDay));
        
        return today >= startDate && today <= endDate;
      });

      if (!currentWeek) {
        return;
      }

      // Tìm lớp học trong ngày
      const todayClasses = currentWeek.ds_thoi_khoa_bieu.filter(schedule => {
        const scheduleDate = new Date(schedule.ngay_hoc);
        return scheduleDate.toISOString().split('T')[0] === formattedDate;
      });

      // Gửi thông báo cho tất cả người đăng ký
      for (const userId of this.subscribers) {
        if (todayClasses.length === 0) {
          await this.bot.sendMessage(userId, '🎉 Hôm nay không có lịch học!');
          continue;
        }

        // Sắp xếp theo tiết học
        todayClasses.sort((a, b) => a.tiet_bat_dau - b.tiet_bat_dau);
        
        // Format và gửi lịch học
        const scheduleText = todayClasses.map(cls => 
          this.scheduleService.formatSchedule(cls)
        ).join('\n\n');

        await this.bot.sendMessage(
          userId,
          `📅 Lịch học hôm nay (${today.toLocaleDateString('vi-VN')}):\n\n${scheduleText}`
        );
      }
    } catch (error) {
      console.error('Error sending daily schedule:', error);
    }
  }
}
