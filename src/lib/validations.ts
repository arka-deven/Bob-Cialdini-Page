import { z } from "zod";

export const emailLoginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const emailSignupSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(72, "Password must be less than 72 characters"),
});

export const emailSignupWithPhoneSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(72, "Password must be less than 72 characters"),
  phone: z
    .string()
    .min(10, "Please enter a valid phone number")
    .regex(/^\+?[1-9]\d{1,14}$/, "Please enter a valid E.164 phone number"),
  newsletter: z.boolean().optional(),
});

export const phoneSchema = z.object({
  phone: z
    .string()
    .min(10, "Please enter a valid phone number")
    .regex(/^\+?[1-9]\d{1,14}$/, "Please enter a valid E.164 phone number"),
});

export const otpSchema = z.object({
  token: z
    .string()
    .length(6, "Code must be 6 digits")
    .regex(/^\d+$/, "Code must be numbers only"),
});

export const checkoutSchema = z.object({
  priceId: z
    .string()
    .min(1, "Price ID is required")
    .startsWith("price_", "Invalid price ID format"),
});

export type EmailLoginInput = z.infer<typeof emailLoginSchema>;
export type EmailSignupInput = z.infer<typeof emailSignupSchema>;
export type EmailSignupWithPhoneInput = z.infer<typeof emailSignupWithPhoneSchema>;
export type PhoneInput = z.infer<typeof phoneSchema>;
export type OtpInput = z.infer<typeof otpSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
