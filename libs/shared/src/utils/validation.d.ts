import { z } from 'zod';
export declare const emailSchema: z.ZodString;
export declare const passwordSchema: z.ZodString;
export declare const usernameSchema: z.ZodString;
export declare const gitUrlSchema: z.ZodEffects<z.ZodString, string, string>;
export declare const commitShaSchema: z.ZodString;
export declare const branchNameSchema: z.ZodString;
export declare const filePathSchema: z.ZodEffects<z.ZodString, string, string>;
export declare const paginationSchema: z.ZodObject<
  {
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    sortBy: z.ZodOptional<z.ZodString>;
    sortOrder: z.ZodDefault<z.ZodEnum<['asc', 'desc']>>;
  },
  'strip',
  z.ZodTypeAny,
  {
    page: number;
    limit: number;
    sortOrder: 'asc' | 'desc';
    sortBy?: string | undefined;
  },
  {
    page?: number | undefined;
    limit?: number | undefined;
    sortBy?: string | undefined;
    sortOrder?: 'asc' | 'desc' | undefined;
  }
>;
export declare const validateEmail: (email: string) => boolean;
export declare const validatePassword: (password: string) => boolean;
export declare const validateGitUrl: (url: string) => boolean;
export declare const sanitizeInput: (input: string) => string;
//# sourceMappingURL=validation.d.ts.map
