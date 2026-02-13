import { z } from "zod/v4";
import { KID_AGE_MIN, KID_AGE_MAX } from "./constants";

export const signUpSchema = z.object({
  email: z.email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const loginSchema = z.object({
  email: z.email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const acceptTermsSchema = z.object({
  accepted: z.literal(true, "You must accept the Terms & Conditions"),
});

export const kidProfileSchema = z.object({
  nickname: z.string().min(1, "Nickname is required").max(50, "Nickname is too long"),
  age: z.coerce.number().int().min(KID_AGE_MIN, `Age must be at least ${KID_AGE_MIN}`).max(KID_AGE_MAX, `Age must be at most ${KID_AGE_MAX}`),
  grade: z.string().min(1, "Grade is required"),
  attestation: z.literal(true, "You must agree to the Terms & Conditions for creating this child profile"),
});

export const kidProfileUpdateSchema = z.object({
  nickname: z.string().min(1, "Nickname is required").max(50, "Nickname is too long"),
  age: z.coerce.number().int().min(KID_AGE_MIN).max(KID_AGE_MAX),
  grade: z.string().min(1, "Grade is required"),
});

export const blockedTopicsSchema = z.object({
  topics: z.array(z.string().min(1).max(200)).max(50, "Maximum 50 blocked topics allowed"),
});

export const timeLimitSchema = z.object({
  enabled: z.boolean(),
  minutes: z.coerce.number().int().min(5).max(480).nullable(),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type KidProfileInput = z.infer<typeof kidProfileSchema>;
export type KidProfileUpdateInput = z.infer<typeof kidProfileUpdateSchema>;
export type BlockedTopicsInput = z.infer<typeof blockedTopicsSchema>;
export type TimeLimitInput = z.infer<typeof timeLimitSchema>;
