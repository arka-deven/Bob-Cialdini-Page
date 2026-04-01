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

// Allowed country codes — restrict to prevent SMS pumping to premium-rate numbers
// Add more country codes as you expand to new markets
const ALLOWED_PHONE_REGEX = /^\+1[2-9]\d{9}$/; // US/CA only
const PHONE_ERROR = "Please enter a valid US or Canadian phone number (e.g. +12125551234)";

export const emailSignupWithPhoneSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(72, "Password must be less than 72 characters"),
  phone: z
    .string()
    .min(10, "Please enter a valid phone number")
    .regex(ALLOWED_PHONE_REGEX, PHONE_ERROR),
  newsletter: z.boolean().optional(),
});

export const phoneSchema = z.object({
  phone: z
    .string()
    .min(10, "Please enter a valid phone number")
    .regex(ALLOWED_PHONE_REGEX, PHONE_ERROR),
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
  coupon: z
    .string()
    .max(50)
    .regex(/^[a-zA-Z0-9_-]*$/, "Invalid coupon format")
    .optional(),
});

export type EmailLoginInput = z.infer<typeof emailLoginSchema>;
export type EmailSignupInput = z.infer<typeof emailSignupSchema>;
export type EmailSignupWithPhoneInput = z.infer<typeof emailSignupWithPhoneSchema>;
export type PhoneInput = z.infer<typeof phoneSchema>;
export type OtpInput = z.infer<typeof otpSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
