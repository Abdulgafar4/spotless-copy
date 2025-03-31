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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Eye, EyeOff, User, Mail, Phone, Lock } from "lucide-react";
import PageHeader from "@/components/page-header";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

// Zod validation schema
const signupSchema = z
  .object({
    firstName: z
      .string()
      .min(2, { message: "First name must be at least 2 characters" }),
    lastName: z
      .string()
      .min(2, { message: "Last name must be at least 2 characters" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    phone: z.string().min(10, { message: "Please enter a valid phone number" }),
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters" }),
    confirmPassword: z.string(),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: "You must accept the terms and conditions",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SignupFormValues = z.infer<typeof signupSchema>;

const stringFields: {
  name: keyof Omit<
    SignupFormValues,
    "acceptTerms" | "confirmPassword" | "password"
  >;
  icon: React.ReactNode;
  placeholder: string;
}[] = [
  { name: "firstName", icon: <User />, placeholder: "First Name" },
  { name: "lastName", icon: <User />, placeholder: "Last Name" },
  { name: "email", icon: <Mail />, placeholder: "Email" },
  { name: "phone", icon: <Phone />, placeholder: "Phone Number" },
];

export default function SignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
  });

  const onSubmit = async (data: SignupFormValues) => {
    const { email, password, firstName, lastName, phone } = data;
  
    const { data: signUpData, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          firstName,
          lastName,
          phone,
        },
      },
    });
  
    if (error) {
      toast.error(`Signup failed: ${error.message}`);
      return;
    }
  
    console.log("Signup successful:", signUpData);
    toast.success("Signup successful! Please confirm your email to activate your account.");
    router.push("/login");
  };

  return (
    <div className="flex flex-col min-h-screen mt-20">
      <PageHeader
        title="SIGN UP"
        breadcrumbs={[
          { label: "HOME", href: "/" },
          { label: "SIGN UP", href: "/signup", current: true },
        ]}
      />

      <section className="py-12 my-16 container mx-auto">
        <div className="px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Left Side */}
            <div className="bg-white p-8 rounded-lg">
              <Image
                src="/assets/auth/Sign-up.png"
                alt="Signup Illustration"
                width={500}
                height={300}
                className="mb-6"
              />
              <h3 className="text-xl font-bold text-[#10b981] mb-4">
                WHY JOINING US
              </h3>
              <p className="text-gray-700 mb-6">
                Join our community and gain access to exclusive features and
                content.
              </p>
              <ul className="space-y-2 ml-4 list-disc text-gray-600">
                <li>Real-time collaboration and tracking</li>
                <li>Access to exclusive dashboards</li>
                <li>Secure and scalable data management</li>
              </ul>
            </div>

            {/* Right Side - Form */}
            <div className="bg-white p-10 rounded-xl shadow-xl mx-auto w-full max-w-lg">
              <div className="text-left mb-8">
                <h2 className="text-sm font-semibold text-gray-500">JOIN US</h2>
                <h1 className="text-2xl font-bold text-gray-900">
                  CREATE ACCOUNT
                </h1>
              </div>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-5"
                >
                  {stringFields.map(({ name, icon, placeholder }) => (
                    <FormField
                      key={name}
                      control={form.control}
                      name={name}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="relative">
                              <span className="absolute left-3 top-3.5 text-gray-400">
                                {icon}
                              </span>
                              <Input
                                className="pl-10 h-14 rounded-lg"
                                placeholder={placeholder}
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}

                  {/* Password */}
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3.5 text-gray-400" />
                            <Input
                              type={showPassword ? "text" : "password"}
                              className="pl-10 pr-10 h-14 rounded-lg"
                              placeholder="Password"
                              {...field}
                            />
                            <button
                              type="button"
                              className="absolute right-3 top-3.5"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="h-5 w-5 text-gray-400" />
                              ) : (
                                <Eye className="h-5 w-5 text-gray-400" />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Confirm Password */}
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3.5 text-gray-400" />
                            <Input
                              type={showConfirmPassword ? "text" : "password"}
                              className="pl-10 pr-10 h-14 rounded-lg"
                              placeholder="Confirm Password"
                              {...field}
                            />
                            <button
                              type="button"
                              className="absolute right-3 top-3.5"
                              onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                              }
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="h-5 w-5 text-gray-400" />
                              ) : (
                                <Eye className="h-5 w-5 text-gray-400" />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Terms */}
                  <FormField
                    control={form.control}
                    name="acceptTerms"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <span className="text-sm text-gray-600">
                          I accept the terms and conditions
                        </span>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full bg-[#10b981] hover:bg-[#0d9668] text-white h-14 rounded-lg font-semibold"
                  >
                    CREATE ACCOUNT
                  </Button>

                  {/* Google Signup */}
                  {/* <Button
                    type="button"
                    onClick={googleSignup}
                    className="w-full mt-2 bg-red-600 hover:bg-red-700 text-white h-14 rounded-lg font-semibold"
                  >
                    SIGN UP WITH GOOGLE
                  </Button> */}

                  <div className="text-center text-sm mt-4">
                    Already have an account?{" "}
                    <Link
                      href="/login"
                      className="text-green-500 hover:underline"
                    >
                      Login
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
