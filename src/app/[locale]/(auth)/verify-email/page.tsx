"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useAuthStore } from "@/stores/authStore";
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
import { KeyRound, Mail, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

export default function VerifyEmailPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const {
    pendingVerificationEmail,
    verifyEmail,
    resendVerification,
    isAuthenticated,
    isLoading: storeLoading,
  } = useAuthStore();

  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  // Redirect if no pending email
  useEffect(() => {
    if (!pendingVerificationEmail && !storeLoading) {
      router.push("/register");
    }
  }, [pendingVerificationEmail, storeLoading, router]);

  // Cooldown timer for resend button
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!code || code.length < 6) {
        toast.error(t("enterVerificationCode"));
        return;
      }

      setIsLoading(true);
      try {
        await verifyEmail(code);
        toast.success(t("emailVerified"));
        router.push("/");
      } catch (error: unknown) {
        const err = error as { response?: { data?: { message?: string } } };
        toast.error(err.response?.data?.message || t("invalidVerificationCode"));
      } finally {
        setIsLoading(false);
      }
    },
    [code, verifyEmail, router, t]
  );

  const handleResend = useCallback(async () => {
    setIsResending(true);
    try {
      await resendVerification();
      toast.success(t("verificationCodeResent"));
      setCooldown(60); // 60 second cooldown
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || t("resendError"));
    } finally {
      setIsResending(false);
    }
  }, [resendVerification, t]);

  if (!pendingVerificationEmail) return null;

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Mail className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-2xl">{t("verifyEmailTitle")}</CardTitle>
        <CardDescription>
          {t("verifyEmailSubtitle")}{" "}
          <strong className="text-foreground">{pendingVerificationEmail}</strong>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <KeyRound className="absolute start-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder={t("enterVerificationCode")}
              className="ps-10 text-center text-lg tracking-[0.5em] font-mono"
              value={code}
              onChange={(e) => {
                // Only allow digits, max 6
                const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                setCode(val);
              }}
              maxLength={6}
              inputMode="numeric"
              autoComplete="one-time-code"
            />
          </div>

          <p className="text-xs text-muted-foreground text-center">
            {t("verificationCodeExpiry")}
          </p>

          <Button
            type="submit"
            className="w-full"
            isLoading={isLoading}
            disabled={code.length < 6}
          >
            {t("verifyEmail")}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending || cooldown > 0}
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`h-4 w-4 ${isResending ? "animate-spin" : ""}`} />
              {cooldown > 0
                ? `${t("resendCode")} (${cooldown}s)`
                : t("resendCode")}
            </button>
          </div>
        </form>
      </CardContent>
      <CardFooter className="justify-center">
        <button
          type="button"
          onClick={() => {
            useAuthStore.getState().setPendingVerificationEmail(null);
            router.push("/register");
          }}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          {t("changeEmail")}
        </button>
      </CardFooter>
    </Card>
  );
}
