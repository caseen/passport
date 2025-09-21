import { z } from "zod";

export const passportSchema = z.object({
  firstName: z.string().min(1, "First name is required."),
  lastName: z.string().min(1, "Last name is required."),
  dateOfBirth: z.string().refine((val) => /^\d{4}-\d{2}-\d{2}$/.test(val) || val === '', {
    message: "Date of birth must be in YYYY-MM-DD format or empty.",
  }),
  passportNumber: z.string().min(1, "Passport number is required."),
  expirationDate: z.string().refine((val) => /^\d{4}-\d{2}-\d{2}$/.test(val) || val === '', {
    message: "Expiration date must be in YYYY-MM-DD format or empty.",
  }),
});

export type PassportData = z.infer<typeof passportSchema>;
