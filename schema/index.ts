import { z } from "zod";


export const LoginSchema = z.object({
    username: z.string().min(1, { message: "Username is required!" }),
    password: z.string().min(1, { message: "Password is required!" }),
});

export const RegisterSchema = z.object({
    email: z.string().email({ message: "Invalid email!" }),
    password: z.string().min(6, { message: "Minimum 6 characters is required!" }),
    name: z.string().min(1, { message: "First name is required!" }),    
   
});
// Ensure UserRole and UserSex enums are defined and imported

export const teacherSchema = z.object({
  id: z.string().optional(),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long!" })
    .max(20, { message: "Username must be at most 20 characters long!" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long!" })
    .optional()
    .or(z.literal("")),
  name: z.string().min(1, { message: "First name is required!" }),
  surname: z.string().min(1, { message: "Last name is required!" }),
  email: z
    .string()
    .email({ message: "Invalid email address!" })
    .optional()
    .or(z.literal("")),
  phone: z.string().optional(),
  address: z.string(),
  img: z.string().optional(),
  bloodType: z.string().min(1, { message: "Blood Type is required!" }),
  birthday: z.coerce.date({ message: "Birthday is required!" }),
  sex: z.enum(["MALE", "FEMALE"], { message: "Sex is required!" }),
  role: z.enum(["TEACHER", "ADMIN", "STUDENT", "PARENT"], { message: "Role is required!" }), // Add roles as needed
});

export type TeacherSchema = z.infer<typeof teacherSchema>;

export const subjectSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, { message: "Subject name is required!" }),
});

export type SubjectSchema = z.infer<typeof subjectSchema>;

