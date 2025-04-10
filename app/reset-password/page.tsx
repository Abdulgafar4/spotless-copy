"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Eye, EyeOff } from "lucide-react";
import PageHeader from "@/components/page-header";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" })
      .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
      .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
      .regex(/[0-9]/, { message: "Password must contain at least one number" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const { resetPassword } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  // Check if the URL contains the required hash parameter
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash || !hash.includes("type=recovery")) {
      toast.error("Invalid password reset link. Please request a new one.");
      router.push("/forgot-password");
    }
  }, [router]);

  const onSubmit = async (data: ResetPasswordFormValues) => {
    setIsSubmitting(true);
    
    try {
      const success = await resetPassword(data.password);
      
      if (success) {
        toast.success("Password reset successful! You can now log in with your new password.");
        router.push("/login");
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col mt-10">
      <PageHeader
        title="RESET PASSWORD"
        breadcrumbs={[
          { label: "HOME", href: "/" },
          { label: "LOGIN", href: "/login" },
          { label: "RESET PASSWORD", href: "/reset-password", current: true },
        ]}
      />

      <section className="py-12 my-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="hidden md:block">
              <Image
                src="/assets/auth/Sign-in.png"
                alt="Reset Password Illustration"
                width={500}
                height={500}
                className="mx-auto"
              />
            </div>

            <div className="bg-white p-12 rounded-lg shadow-lg max-w-lg mx-auto w-full space-y-10">
              <div className="text-left mb-6">
                <h2 className="text-base font-medium text-gray-600 mb-1">
                  CREATE NEW PASSWORD
                </h2>
                <h1 className="text-lg sm:text-2xl xl:text-3xl  font-bold text-gray-900">
                  RESET YOUR PASSWORD
                </h1>
                <p className="text-gray-600 mt-4">
                  Enter your new password below. Make sure it's strong and secure.
                </p>
              </div>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative">
                            <div className="absolute left-3 top-3">
                              <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="text-gray-400"
                              >
                                <path
                                  d="M16 9V7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7V9"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                />
                                <path
                                  d="M5 10C3.89543 10 3 10.8954 3 12V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V12C21 10.8954 20.1046 10 19 10H5Z"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                />
                              </svg>
                            </div>
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="New Password"
                              className="px-10 py-6"
                              {...field}
                            />
                            <button
                              type="button"
                              className="absolute right-3 top-3 text-gray-400"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="h-5 w-5" />
                              ) : (
                                <Eye className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative">
                            <div className="absolute left-3 top-3">
                              <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="text-gray-400"
                              >
                                <path
                                  d="M16 9V7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7V9"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                />
                                <path
                                  d="M5 10C3.89543 10 3 10.8954 3 12V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V12C21 10.8954 20.1046 10 19 10H5Z"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                />
                              </svg>
                            </div>
                            <Input
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="Confirm New Password"
                              className="px-10 py-6"
                              {...field}
                            />
                            <button
                              type="button"
                              className="absolute right-3 top-3 text-gray-400"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="h-5 w-5" />
                              ) : (
                                <Eye className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="pt-4">
                    <ul className="text-xs text-gray-500 space-y-1 list-disc pl-4">
                      <li>At least 8 characters</li>
                      <li>At least one uppercase letter</li>
                      <li>At least one lowercase letter</li>
                      <li>At least one number</li>
                    </ul>
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <Link
                      href="/login"
                      className="text-sm text-gray-500 hover:text-green-500"
                    >
                      BACK TO LOGIN
                    </Link>

                    <Button
                      type="submit"
                      className="w-40 bg-green-500 hover:bg-green-600 text-white"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "RESETTING..." : "RESET PASSWORD"}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}