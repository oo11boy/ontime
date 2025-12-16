// File Path: src\lib\types.ts

// lib/types.ts
export type User = {
  id: number;
  job_id?: number | null;
  name: string;
  phone: string;
  is_superadmin: number;
  sms_balance: number;
  plan_key: string;
};
