"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/providers/auth-provider";
import { useTranslations } from "next-intl";
import api from "@/lib/api";
import { toast } from "sonner";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const locale = useLocale();
  const { login } = useAuth();
  const t = useTranslations();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [isForgotLoading, setIsForgotLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please fill in both email and password");
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      toast.success("Logged in successfully!");

      const storedUser = localStorage.getItem("user");
      console.log("Stored user:", storedUser);

      if (storedUser) {
        const user = JSON.parse(storedUser);
        console.log("User roles:", user.roles);

        if (user.roles?.includes("scholarship_giver")) {
          console.log(`Redirecting to /${locale}/scholarship-giver`);
          router.push(`/${locale}/scholarship-giver`);
        } else if (user.roles?.includes("admin")) {
          router.push(`/${locale}/admin`);
        } else if (user.roles?.includes("teacher")) {
          router.push(`/${locale}/teacher`);
        } else if (user.roles?.includes("seller")) {
          router.push(`/${locale}/seller`);
        } else if (user.roles?.includes("parent")) {
          router.push(`/${locale}/parent`);
        } else {
          router.push(`/${locale}/dashboard`);
        }
      } else {
        router.push(`/${locale}/dashboard`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!forgotEmail) {
      toast.error("Please enter your email");
      return;
    }

    setIsForgotLoading(true);
    try {
      await api.post("/forgot-password", { email: forgotEmail });
      setResetSent(true);
      toast.success("Reset link sent to your email");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to send reset link");
    } finally {
      setIsForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFF2EB] p-4 relative overflow-hidden font-sans">
      {}
      <div className="absolute top-[-10%] right-[-10%] w-[350px] h-[350px] rounded-full bg-[#FFE2D4] filter blur-3xl opacity-70 z-0 pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] rounded-full bg-[#FFE2D4] filter blur-3xl opacity-70 z-0 pointer-events-none" />

      <Card className="w-full max-w-md border border-[#FF7A45]/10 rounded-[24px] shadow-xl shadow-[#FF7A45]/5 bg-white relative z-10 p-2">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto flex justify-center mb-4">
            <Image 
              src="/logo.png" 
              alt="HobbyHub Education" 
              width={160} 
              height={40} 
              priority 
              className="h-10 w-auto object-contain"
            />
          </div>
          <CardTitle className="text-3xl font-extrabold text-[#1F2937] tracking-tight">{t('auth.welcomeBack')}</CardTitle>
          <CardDescription className="text-sm text-[#6B7280]">{t('auth.loginDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-semibold text-[#1F2937]">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 px-4 rounded-xl border-gray-200 focus-visible:ring-[#FF7A45]"
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="text-sm font-semibold text-[#1F2937]">{t('auth.password')}</Label>
                <Dialog>
                  <DialogTrigger asChild>
                    <button type="button" className="text-xs font-semibold text-[#FF7A45] hover:underline p-0">
                      {t('auth.forgotPassword')}
                    </button>
                  </DialogTrigger>
                  <DialogContent className="rounded-3xl max-w-sm">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-bold text-[#1F2937]">Reset Password</DialogTitle>
                      <DialogDescription className="text-sm text-gray-500">
                        Enter your email and we'll send you a reset link
                      </DialogDescription>
                    </DialogHeader>
                    {resetSent ? (
                      <div className="text-center py-4">
                        <p className="text-green-600 font-semibold mb-2">Reset link sent!</p>
                        <p className="text-xs text-gray-500">
                          Check your email inbox for instructions.
                        </p>
                      </div>
                    ) : (
                      <form onSubmit={handleForgotPassword} className="space-y-4 pt-2">
                        <div className="space-y-1.5">
                          <Label htmlFor="forgot-email" className="text-sm font-semibold text-[#1F2937]">Email</Label>
                          <Input
                            id="forgot-email"
                            type="email"
                            placeholder="you@example.com"
                            value={forgotEmail}
                            onChange={(e) => setForgotEmail(e.target.value)}
                            required
                            className="rounded-xl border-gray-200 focus-visible:ring-[#FF7A45]"
                          />
                        </div>
                        <Button
                          type="submit"
                          className="w-full h-11 rounded-xl bg-[#FF7A45] hover:bg-[#ff8f61] text-[#1F2937] font-medium"
                          disabled={isForgotLoading}
                        >
                          {isForgotLoading ? 'Sending...' : 'Send Reset Link'}
                        </Button>
                      </form>
                    )}
                  </DialogContent>
                </Dialog>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pr-10 h-11 px-4 rounded-xl border-gray-200 focus-visible:ring-[#FF7A45]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
            
            <Button
              type="submit"
              className="w-full h-12 bg-[#FF7A45] hover:bg-[#ff8f61] text-[#1F2937] font-semibold rounded-xl shadow-md shadow-[#FF7A45]/15 transition-all duration-200 hover:shadow-lg"
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : t('nav.login')}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-150"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-gray-400 font-medium">
                {t('auth.orContinue')}
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full h-12 rounded-xl border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold"
            onClick={() =>
              (window.location.href = "http://localhost:5001/api/auth/google")
            }
          >
            <svg className="mr-2.5 h-5 w-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </Button>

          <p className="text-center text-sm text-[#6B7280] mt-6">
            {t('auth.noAccount')}{" "}
            <Link href={`/${locale}/register`} className="text-[#FF7A45] font-semibold hover:underline">
              Register
            </Link>
          </p>

          <div className="mt-4 pt-4 border-t border-gray-100 text-center">
            <Link
              href={`/${locale}`}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#6B7280] hover:text-[#FF7A45] transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              {t('auth.backToHome')}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
