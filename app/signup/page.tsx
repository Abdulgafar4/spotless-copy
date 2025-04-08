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
import { Eye, EyeOff, User, Mail, Phone, Lock, Check } from "lucide-react";
import PageHeader from "@/components/page-header";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { SignupFormValues, signupSchema } from "@/model/signup-schema";


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
      userRole: "client"
    },
  });

  const onSubmit = async (data: SignupFormValues) => {
    const { email, password, firstName, lastName, phone, userRole } = data;

    const { data: signUpData, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          firstName,
          lastName,
          phone,
          role: userRole
        },
      },
    });

    if (error) {
      toast.error(`Signup failed: ${error.message}`);
      return;
    }

    console.log("Signup successful:", signUpData);
    toast.success(
      "Signup successful! Please confirm your email to activate your account."
    );
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
                WHY JOIN US
              </h3>
              <p className="text-gray-700 my-6">
                Our expert team applies Design Thinking to help you design
                products and services that genuinely meet customer demands.
                Through research, ideation, and prototyping, we create solutions
                that work.
              </p>

              {/* Mapped list items */}
              <ul className="space-y-4 ml-4">
                {[
                  "Align your product with user insights and market demand",
                  "Minimize risks by testing ideas early",
                  "Innovate ahead of your competition",
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="bg-[#10b981] rounded-full p-1 flex items-center justify-center">
                      <Check size={16} color="white" />
                    </div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              {/* Fixed the duplicate paragraph content */}
              <p className="text-gray-700 mt-6">
                Our collaborative approach ensures your team builds the
                capabilities to continue innovating long after our engagement
                ends.
              </p>
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
