// For the form
export type MemberFormData = {
  user_name: string;
  email: string;
  gender: string;
  birthday: string;
  phone: string;
  mobile_phone: string;
  company_title: string;
  company_tax_id: string;
  company_business_type: string;
  receiver_name: string;
  receiver_phone: string;
  address: string;
  notes: string;
  member_type: string;
  // 新增欄位
  register_date: string;
  last_login_time: string;
  login_ip: string;
  // 公司相關資料
  company_name?: string;
  tax_id?: string;
  job_title?: string;
  industry_type?: string;
  other_company_industry?: string;
};

// For the order table
export type Order = {
  order_id: string;
  order_date: string;
  order_status: string;
  payment_status: string;
  shipping_status: string;
  total: number;
};
