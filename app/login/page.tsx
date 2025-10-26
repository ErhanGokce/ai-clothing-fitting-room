'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import { signInWithEmail } from "@/lib/supabase";

const loginSchema = z.object({
  email: z
    .string({ required_error: "E-posta zorunludur." })
    .email({ message: "Geçerli bir e-posta adresi giriniz." }),
  password: z
    .string({ required_error: "Şifre zorunludur." })
    .min(6, { message: "Şifreniz en az 6 karakter olmalı." }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await signInWithEmail(values.email, values.password);
      toast({
        title: "Hoş geldiniz!",
        description: "Başarıyla giriş yaptınız.",
      });
      router.push("/");
    } catch (error) {
      toast({
        title: "Giriş başarısız",
        description:
          error instanceof Error ? error.message : "Lütfen bilgilerinizi kontrol edin.",
        variant: "destructive",
      });
    }
  };

  const isSubmitting = form.formState.isSubmitting;

  return (
    <section className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-muted px-4 py-10">
      <Card className="w-full max-w-md bg-card shadow-xl">
        <CardHeader className="space-y-3">
          <CardTitle>Giriş Yap</CardTitle>
          <CardDescription>Hesabınıza erişmek için bilgilerinizi girin.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-posta</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="ornek@mail.com"
                        autoComplete="email"
                        disabled={isSubmitting}
                        {...field}
                      />
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
                    <FormLabel>Şifre</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Şifreniz"
                        autoComplete="current-password"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Giriş yapılıyor..." : "Giriş Yap"}
              </Button>
            </form>
          </Form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Hesabınız yok mu?{" "}
            <Link className="font-semibold text-primary hover:underline" href="/register">
              Kayıt olun
            </Link>
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
