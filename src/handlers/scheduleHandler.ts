import { ZaloEvent } from '../types/zalo';
import { ZaloBot } from '../lib/ZaloBot';
import { ScheduleService } from '../services/scheduleService';

export async function handleScheduleCommand(event: ZaloEvent, bot: ZaloBot): Promise<void> {
  const { message } = event;
  
  if (!message.text?.startsWith('/tkb')) {
    return;
  }

  // Kiểm tra xem người dùng muốn xem tkb ngày mai hay hôm nay
  const isRequestingTomorrow = message.text.trim().toLowerCase().includes('mai');

  try {
    const scheduleService = ScheduleService.getInstance();
    scheduleService.setUserId(message.from.id); // Thêm userId cho việc refresh token
    const response = await scheduleService.getWeeklySchedule();

    // Tính toán ngày cần xem (hôm nay hoặc ngày mai)
    const today = new Date();
    const targetDate = new Date(today);
    
    if (isRequestingTomorrow) {
      targetDate.setDate(today.getDate() + 1);
    }

    // Tìm tuần chứa ngày cần xem (hôm nay hoặc ngày mai)
    const findWeekContainingDate = (date: Date) => {
      return response.data.ds_tuan_tkb.find(week => {
        try {
          // Format: DD/MM/YYYY
          const [startDay, startMonth, startYear] = week.ngay_bat_dau.split('/');
          const [endDay, endMonth, endYear] = week.ngay_ket_thuc.split('/');
          
          // Create date objects with time set to beginning/end of day
          const startDate = new Date(parseInt(startYear), parseInt(startMonth) - 1, parseInt(startDay), 0, 0, 0);
          const endDate = new Date(parseInt(endYear), parseInt(endMonth) - 1, parseInt(endDay), 23, 59, 59);
          
          const isInWeek = date >= startDate && date <= endDate;
          return isInWeek;
        } catch (err) {
          console.error(`Lỗi xử lý tuần: ${week.thong_tin_tuan}`, err);
          return false;
        }
      });
    };
    
    // Tìm tuần chứa ngày cần xem
    const targetWeek = findWeekContainingDate(targetDate);
    
    // Tìm tuần hiện tại (hôm nay)
    const currentWeek = isRequestingTomorrow ? targetWeek : findWeekContainingDate(today);

    // Xử lý khi không tìm thấy tuần hoặc không phải tuần hiện tại
    const weekToUse = isRequestingTomorrow ? targetWeek : currentWeek;
    
    if (!weekToUse) {
      // Tìm tuần gần nhất chứa lịch học
      const weekWithSchedule = response.data.ds_tuan_tkb.find(week => 
        week.ds_thoi_khoa_bieu && week.ds_thoi_khoa_bieu.length > 0);
      
      // Tạo emoji ngẫu nhiên
      const emojis = ['🔍', '📆', '📌', '🧐', '🤔', '📅', '🗓️', '📝', '📚'];
      const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
      
      if (weekWithSchedule) {
        const dayStr = isRequestingTomorrow ? 'ngày mai' : 'hôm nay';
        const dateStr = targetDate.toLocaleDateString('vi-VN');
        
        const startDate = new Date(
          parseInt(weekWithSchedule.ngay_bat_dau.split('/')[2]), 
          parseInt(weekWithSchedule.ngay_bat_dau.split('/')[1]) - 1, 
          parseInt(weekWithSchedule.ngay_bat_dau.split('/')[0])
        );
        
        const daysUntil = Math.ceil((startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        let timeMessage = '';
        
        if (daysUntil > 0) {
          timeMessage = `\n\nLịch học sẽ bắt đầu trong ${daysUntil} ngày nữa. Hãy chuẩn bị sẵn sàng nhé! 💪`;
        } else {
          timeMessage = '\n\nBạn có thể xem lịch học của các ngày khác trong tuần đó.';
        }
          
        await bot.sendMessage(
          message.from.id, 
          `${randomEmoji} Thông báo: Không tìm thấy lịch học cho ${dayStr} (${dateStr}).\n\nTuy nhiên, tôi tìm thấy lịch học ở ${weekWithSchedule.thong_tin_tuan}.${timeMessage}\n\nBạn có thể gửi /tkb để xem lịch học khi đến tuần đó.`
        );
      } else {
        await bot.sendMessage(
          message.from.id, 
          `${randomEmoji} Thông báo: Hiện không tìm thấy thời khóa biểu nào trong học kỳ này.\n\nCó thể học kỳ chưa bắt đầu hoặc chưa có lịch học được cập nhật. Vui lòng kiểm tra lại sau nhé!`
        );
      }
      return;
    }

    // Tìm các lớp học cho ngày cần xem
    const targetClasses = weekToUse.ds_thoi_khoa_bieu.filter(schedule => {
      // Fix vấn đề múi giờ - chuyển đổi cả hai ngày sang ngày địa phương để so sánh
      const scheduleDate = new Date(schedule.ngay_hoc);
      
      // Lấy ngày, tháng, năm trong múi giờ địa phương
      const scheduleDateLocal = new Date(
        scheduleDate.getFullYear(),
        scheduleDate.getMonth(),
        scheduleDate.getDate()
      );
      
      const targetDateLocal = new Date(
        targetDate.getFullYear(),
        targetDate.getMonth(),
        targetDate.getDate()
      );
      
      // So sánh hai ngày (bỏ qua thời gian)
      const isTargetDay = scheduleDateLocal.getTime() === targetDateLocal.getTime();
      return isTargetDay;
    });

    if (targetClasses.length === 0) {
      const dayText = isRequestingTomorrow ? 'ngày mai' : 'hôm nay';
      const dateStr = targetDate.toLocaleDateString('vi-VN');
      const weekday = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'][targetDate.getDay()];
      
      // Tạo lời chào phù hợp với thời gian trong ngày
      const hour = new Date().getHours();
      let greeting = 'Xin chào';
      if (hour < 12) greeting = 'Chào buổi sáng';
      else if (hour < 18) greeting = 'Chào buổi chiều';
      else greeting = 'Chào buổi tối';
      
      // Tạo thông báo ngẫu nhiên khi không có lớp học
      const freeTimeMessages = [
        `${greeting}! 🌟\n\nTuyệt vời! ${dayText} (${weekday}, ${dateStr}) bạn được nghỉ học rồi! 🎉\n\nHãy tận dụng thời gian này để nghỉ ngơi hoặc học thêm nhé! 📚`,
        `${greeting}! 🌈\n\nTin vui! ${dayText} (${weekday}, ${dateStr}) không có lịch học! �\n\nBạn có thể dành thời gian cho bản thân hoặc làm bài tập các môn khác nhé! 💪`,
        `${greeting}! ✨\n\nYeah! ${dayText} (${weekday}, ${dateStr}) được nghỉ học rồi nè! 🎯\n\nThời gian rảnh là cơ hội tốt để phát triển bản thân đó! 🌱`
      ];
      
      const randomMessage = freeTimeMessages[Math.floor(Math.random() * freeTimeMessages.length)];
      await bot.sendMessage(message.from.id, randomMessage);
      return;
    }
    
    // Sort classes by period
    targetClasses.sort((a, b) => a.tiet_bat_dau - b.tiet_bat_dau);

    // Format and send schedule
    const scheduleText = targetClasses.map(cls => 
      scheduleService.formatSchedule(cls)
    ).join('\n\n');

    // Tạo lời chào phù hợp với thời gian trong ngày
    const getGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) return 'Chào buổi sáng! 🌄';
      if (hour < 18) return 'Chào buổi chiều! 🌇';
      return 'Chào buổi tối! 🌃';
    };

    // Tạo emojis ngẫu nhiên để trang trí
    const emojis = ['✨', '📚', '📝', '📖', '🎓', '💯', '🔔', '📒', '📋'];
    const randomEmoji = () => emojis[Math.floor(Math.random() * emojis.length)];
    
    // Tạo lời nhắn đặc biệt tùy theo số lượng lớp học
    const getSpecialMessage = (count: number) => {
      if (count >= 3) return `Hôm đó có ${count} lớp học, hãy chuẩn bị tinh thần nhé! 💪`;
      if (count === 2) return 'Lịch học vừa phải, cố gắng nhé! 👍';
      return 'Chỉ có một lớp học thôi, nhẹ nhàng đấy! 😊';
    };

    const dayText = isRequestingTomorrow ? 'ngày mai' : 'hôm nay';
    const dateStr = targetDate.toLocaleDateString('vi-VN');
    const weekday = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'][targetDate.getDay()];
    
    await bot.sendMessage(
      message.from.id,
      `${getGreeting()}\n\n${randomEmoji()} *THỜI KHÓA BIỂU ${dayText.toUpperCase()}* ${randomEmoji()}\n📅 ${weekday}, ngày ${dateStr}\n\n${scheduleText}\n\n${getSpecialMessage(targetClasses.length)}\nChúc bạn học tập tốt! ✨`
    );

  } catch (error: any) {
    console.error('Failed to get schedule:', error);
    
    // Emoji ngẫu nhiên cho thông báo lỗi
    const errorEmojis = ['❌', '⚠️', '😓', '🔄', '📛', '🚫'];
    const randomErrorEmoji = errorEmojis[Math.floor(Math.random() * errorEmojis.length)];
    
    await bot.sendMessage(
      message.from.id,
      `${randomErrorEmoji} Không thể lấy thời khóa biểu. Vui lòng đảm bảo bạn đã đăng nhập và thử lại sau.\n\nNếu vẫn gặp lỗi, hãy thử đăng nhập lại với lệnh /login <mssv> <mật khẩu>`
    );
  }
}
