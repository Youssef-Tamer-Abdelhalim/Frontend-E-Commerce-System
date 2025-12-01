"use client";

import { useState, useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import {
  Button,
  Input,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui";
import { Lock, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z
      .string()
      .min(6, "Password must be at least 6 characters"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const { setToken } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const storedEmail = sessionStorage.getItem("resetEmail");
    if (!storedEmail) {
      router.push("/forgot-password");
    } else {
      setEmail(storedEmail);
    }
  }, [router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!email) return;
    setIsLoading(true);
    try {
      const response = await authApi.resetPassword({
        email,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });

      // Clear the stored email
      sessionStorage.removeItem("resetEmail");

      // If token is returned, log the user in
      if (response.token) {
        setToken(response.token);
      }

      toast.success(t("passwordResetSuccess"));
      router.push("/login");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || t("resetPasswordError"));
    } finally {
      setIsLoading(false);
    }
  };

  if (!email) return null;

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{t("resetPasswordTitle")}</CardTitle>
        <CardDescription>{t("resetPasswordSubtitle")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="relative">
            <Lock className="absolute start-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type={showPassword ? "text" : "password"}
              placeholder={t("newPassword")}
              className="ps-10 pe-10"
              {...register("newPassword")}
              error={errors.newPassword?.message}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>

          <div className="relative">
            <Lock className="absolute start-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type={showConfirmPassword ? "text" : "password"}
              placeholder={t("confirmPassword")}
              className="ps-10 pe-10"
              {...register("confirmPassword")}
              error={errors.confirmPassword?.message}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>

          <Button type="submit" className="w-full" isLoading={isLoading}>
            {t("resetPassword")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
