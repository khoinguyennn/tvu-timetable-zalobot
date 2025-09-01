import axios from 'axios';
import { ScheduleResponse, ClassSchedule } from '../types/schedule';

export class ScheduleService {
  private static instance: ScheduleService;
  private token: string = '';

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
    } catch (error: any) {
      throw new Error(`Failed to get schedule: ${error.message}`);
    }
  }

  public formatSchedule(schedule: ClassSchedule): string {
    const dayMap = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    return `📚 ${schedule.ten_mon}
�️ ${dayMap[schedule.thu_kieu_so]}
�🕐 Tiết: ${schedule.tiet_bat_dau}-${schedule.tiet_bat_dau + schedule.so_tiet - 1}
👨‍🏫 GV: ${schedule.ten_giang_vien}
🏫 Phòng: ${schedule.ma_phong}
📝 Nhóm: ${schedule.ma_nhom}`;
  }
}
