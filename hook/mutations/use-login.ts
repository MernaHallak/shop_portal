"use client";

import { useMutation } from "@tanstack/react-query";

import { login } from "@/api/auth";
import type { LoginRequest } from "@/types/auth";

export function useLogin() {
  return useMutation({ 
    // الداتا الهي credentials تمرر لل mutate وبعدين React Query تمرر هالداتا تلقائيًا لـ mutationFn
    mutationFn: (credentials: LoginRequest) => login(credentials), //arrow function
    //mutationFn : هي بس تعريف للرياكت كويري انو عملية تسجيل الدخول رح اتم بهل الدالة login اما تشغيل هي الدالة يتم عن طريق mutate
  });
}