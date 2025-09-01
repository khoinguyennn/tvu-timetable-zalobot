export interface ScheduleResponse {
  data: {
    total_items: number;
    total_pages: number;
    ds_tiet_trong_ngay: DailyPeriod[];
    ds_tuan_tkb: WeekSchedule[];
  };
}

export interface DailyPeriod {
  tiet: number;
  gio_bat_dau: string;
  so_phut: number;
  nhhk: number;
}

export interface WeekSchedule {
  tuan_hoc_ky: number;
  tuan_tuyet_doi: number;
  thong_tin_tuan: string;
  ngay_bat_dau: string;
  ngay_ket_thuc: string;
  ds_thoi_khoa_bieu: ClassSchedule[];
  ds_id_thoi_khoa_bieu_trung: string[];
}

export interface ClassSchedule {
  is_hk_lien_truoc: number;
  thu_kieu_so: number;
  tiet_bat_dau: number;
  so_tiet: number;
  ma_mon: string;
  ten_mon: string;
  ten_mon_eg: string;
  so_tin_chi: string;
  id_to_hoc: string;
  id_tkb: string;
  ma_nhom: string;
  ma_to_th: string;
  ma_giang_vien: string;
  ten_giang_vien: string;
  ma_lop: string;
  ten_lop: string;
  ma_phong: string;
  ma_co_so: string;
  is_day_bu: boolean;
  ngay_hoc: string;
}
