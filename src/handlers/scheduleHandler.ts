import { ZaloEvent } from '../types/zalo';
import { ZaloBot } from '../lib/ZaloBot';
import { ScheduleService } from '../services/scheduleService';

export async function handleScheduleCommand(event: ZaloEvent, bot: ZaloBot): Promise<void> {
  const { message } = event;
  
  if (!message.text?.startsWith('/tkb')) {
    return;
  }

  try {
    const scheduleService = ScheduleService.getInstance();
    const response = await scheduleService.getWeeklySchedule();

    console.log('Schedule response:', JSON.stringify(response, null, 2));

    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];

    console.log('Looking for schedule on:', formattedDate);

    // Find current week's schedule
    const currentWeek = response.data.ds_tuan_tkb.find(week => {
      const [startDay, startMonth, startYear] = week.ngay_bat_dau.split('/');
      const [endDay, endMonth, endYear] = week.ngay_ket_thuc.split('/');
      
      const startDate = new Date(parseInt(startYear), parseInt(startMonth) - 1, parseInt(startDay));
      const endDate = new Date(parseInt(endYear), parseInt(endMonth) - 1, parseInt(endDay));
      
      const isCurrentWeek = today >= startDate && today <= endDate;
      if (isCurrentWeek) {
        console.log('Found matching week:', week.thong_tin_tuan);
      }
      return isCurrentWeek;
    });

    console.log('Current week:', currentWeek);

    if (!currentWeek) {
      await bot.sendMessage(message.from.id, 'Không tìm thấy thời khóa biểu cho tuần hiện tại.');
      return;
    }

    // Find today's classes
    const todayClasses = currentWeek.ds_thoi_khoa_bieu.filter(schedule => {
      const scheduleDate = new Date(schedule.ngay_hoc);
      const isToday = scheduleDate.toISOString().split('T')[0] === formattedDate;
      if (isToday) {
        console.log('Found class:', schedule.ten_mon);
      }
      return isToday;
    });

    console.log(`Found ${todayClasses.length} classes for today`);

      if (todayClasses.length === 0) {
      await bot.sendMessage(message.from.id, 'Hôm nay không có lịch học! 🎉');
      return;
    }    // Sort classes by period
    todayClasses.sort((a, b) => a.tiet_bat_dau - b.tiet_bat_dau);

    // Format and send schedule
    const scheduleText = todayClasses.map(cls => 
      scheduleService.formatSchedule(cls)
    ).join('\n\n');

    await bot.sendMessage(
      message.from.id,
      `📅 Thời khóa biểu ngày ${today.toLocaleDateString('vi-VN')}\n\n${scheduleText}`
    );

  } catch (error: any) {
    console.error('Failed to get schedule:', error);
    await bot.sendMessage(
      message.from.id,
      'Không thể lấy thời khóa biểu. Vui lòng đảm bảo bạn đã đăng nhập và thử lại.'
    );
  }
}
