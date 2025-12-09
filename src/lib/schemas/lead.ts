import { z } from 'zod';

export const inquiryTypes = ['product', 'agency', 'other'] as const;
export type InquiryType = (typeof inquiryTypes)[number];

export const leadSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.email(),
  phone: z.string().max(20).optional().or(z.literal('')),
  company: z.string().max(200).optional().or(z.literal('')),
  inquiryType: z.enum(inquiryTypes).optional().or(z.literal('')),
  productSlug: z.string().max(200).optional().or(z.literal('')),
  productName: z.string().max(200).optional().or(z.literal('')),
  formPage: z.string().max(500).optional().or(z.literal('')),
  message: z.string().max(5000).optional().or(z.literal('')),
  locale: z.enum(['en', 'zh', 'es', 'ar']),
  turnstileToken: z.string().min(1),
});

export type LeadInput = z.infer<typeof leadSchema>;

export interface Lead extends Omit<LeadInput, 'turnstileToken'> {
  id: string;
  createdAt: number;
  status: 'pending' | 'processed' | 'failed';
}
