"use client";

import { useState, useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authApi } from "@/lib/api";
import {
  Button,
  Input,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui";
import { KeyRound, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

const verifyCodeSchema = z.object({
  resetCode: z.string().min(4, "Code must be at least 4 characters"),
});

type VerifyCodeFormData = z.infer<typeof verifyCodeSchema>;

export default function VerifyCodePage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
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
  } = useForm<VerifyCodeFormData>({
    resolver: zodResolver(verifyCodeSchema),
  });

  const onSubmit = async (data: VerifyCodeFormData) => {
    setIsLoading(true);
    try {
      await authApi.verifyResetCode(data);
      toast.success(t("codeVerified"));
      router.push("/reset-password");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || t("invalidCode"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) return;
    setIsLoading(true);
    try {
      await authApi.forgotPassword({ email });
      toast.success(t("resetCodeSent"));
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || t("resendError"));
    } finally {
      setIsLoading(false);
    }
  };

  if (!email) return null;

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{t("verifyCodeTitle")}</CardTitle>
        <CardDescription>
          {t("verifyCodeSubtitle")} <strong>{email}</strong>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="relative">
            <KeyRound className="absolute start-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder={t("enterCode")}
              className="ps-10 text-center text-lg tracking-widest"
              {...register("resetCode")}
              error={errors.resetCode?.message}
            />
          </div>

          <Button type="submit" className="w-full" isLoading={isLoading}>
            {t("verifyCode")}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={handleResendCode}
              disabled={isLoading}
              className="text-sm text-primary hover:underline disabled:opacity-50"
            >
              {t("resendCode")}
            </button>
          </div>
        </form>
      </CardContent>
      <CardFooter className="justify-center">
        <Link
          href="/forgot-password"
          className="flex items-center gap-2 text-sm text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("changeEmail")}
        </Link>
      </CardFooter>
    </Card>
  );
}
