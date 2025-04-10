"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
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
import { Mail } from "lucide-react";
import PageHeader from "@/components/page-header";
import { useAuth } from "@/hooks/use-auth";

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { forgotPassword } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setIsSubmitting(true);
    await forgotPassword(data.email);
    setIsSubmitting(false);
  };

  return (
    <div className="flex flex-col mt-10">
      <PageHeader
        title="FORGOT PASSWORD"
        breadcrumbs={[
          { label: "HOME", href: "/" },
          { label: "LOGIN", href: "/login" },
          { label: "FORGOT PASSWORD", href: "/forgot-password", current: true },
        ]}
      />

      <section className="py-12 my-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="hidden md:block">
              <Image
                src="/assets/auth/Sign-in.png"
                alt="Forgot Password Illustration"
                width={500}
                height={500}
                className="mx-auto"
              />
            </div>

            <div className="bg-white p-12 rounded-lg shadow-lg max-w-lg mx-auto w-full space-y-10">
              <div className="text-left mb-6">
                <h2 className="text-base font-medium text-gray-600 mb-1">
                  FORGOT PASSWORD
                </h2>
                <h1 className="text-lg sm:text-2xl xl:text-3xl font-bold text-gray-900">
                  RESET YOUR PASSWORD
                </h1>
                <p className="text-gray-600 mt-4">
                  Enter your email address below and we'll send you a link to reset your password.
                </p>
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
                            <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                            <Input
                              placeholder="Email Address"
                              className="pl-10 py-6"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex items-center justify-between pt-2">
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
                      {isSubmitting ? "SENDING..." : "SEND LINK"}
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