export interface MemberData {
  MEMBER_ID: string;
  MEMBER_TYPE: string;
  USER_NAME: string;
  MOBILE_PHONE: string;
  EMAIL: string;
  PASSWORD_HASH: string;
  COMPANY_NAME?: string;
  TAX_ID?: string;
  JOB_TITLE?: string;
  INDUSTRY_TYPE?: string[];
  OTHER_COMPANY_INDUSTRY?: string;
  STATUS?: string;
  REGION?: string;
  CITY?: string;
  ADDRESS?: string;
  GENDER?: string;
  PHONE?: string;
  BIRTHDAY?: string;
  CREATED_AT?: string;
  UPDATED_AT?: string;
  LAST_LOGIN_AT?: string;
  IS_VERIFIED?: number;
  VERIFICATION_TOKEN?: string;
}
