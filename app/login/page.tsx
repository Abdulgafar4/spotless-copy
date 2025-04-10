"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Eye, EyeOff, User } from "lucide-react";
import PageHeader from "@/components/page-header";
import { useAuth } from "@/hooks/use-auth";

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading } = useAuth();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    await login(data.email, data.password);
  };

  return (
    <div className="flex flex-col mt-10">
      <PageHeader
        title="LOGIN"
        breadcrumbs={[
          { label: "HOME", href: "/" },
          { label: "LOGIN", href: "/login", current: true },
        ]}
      />

      <section className="py-12 my-16">
        <div className="container mx-auto px-2 md:px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="hidden lg:block">
              <Image
                src="/assets/auth/Sign-in.png"
                alt="Login Illustration"
                width={500}
                height={500}
                className="mx-auto"
              />
            </div>

            <div className="bg-white p-12 rounded-lg shadow-lg max-w-lg mx-auto w-full space-y-10">
              <div className="text-left mb-6">
                <h2 className="text-base font-medium text-gray-600 mb-1">
                  WELCOME BACK
                </h2>
                <h1 className="text-lg sm:text-2xl xl:text-3xl font-bold text-gray-900">
                  LOGIN TO YOUR ACCOUNT
                </h1>
              </div>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                            <Input
                              placeholder="Username or Email"
                              className="pl-10 py-6"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
                              placeholder="Password"
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

                  <div className="mt-5">
                    <Link
                      href="/forgot-password"
                      className="text-sm text-gray-500 hover:text-green-500"
                    >
                      FORGET YOUR PASSWORD?
                    </Link>
                  </div>

                  <div className="flex flex-col-reverse gap-6 md:flex-row items-center justify-between">
                    <FormField
                      control={form.control}
                      name="rememberMe"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <label className="text-sm font-medium leading-none cursor-pointer">
                            REMEMBER THIS DEVICE
                          </label>
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-40 bg-green-500 hover:bg-green-600 text-white"
                      disabled={loading}
                    >
                      {loading ? "LOGGING IN..." : "LOGIN"}
                    </Button>
                  </div>

                  <div className="text-center text-sm">
                    Don&apos;t have an account?{" "}
                    <Link
                      href="/signup"
                      className="text-green-500 hover:underline"
                    >
                      Sign up
                    </Link>
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