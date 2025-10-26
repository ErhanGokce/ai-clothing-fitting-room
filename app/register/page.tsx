'use client';

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import { signUpWithProfile } from "@/lib/supabase";

const MAX_SELFIE_SIZE = 5 * 1024 * 1024;
const EMPTY_FILE = undefined as unknown as File;

const registerSchema = z.object({
  fullName: z
    .string({ required_error: "Ad Soyad zorunludur." })
    .min(3, { message: "Ad Soyad en az 3 karakter olmalı." }),
  email: z
    .string({ required_error: "E-posta zorunludur." })
    .email({ message: "Geçerli bir e-posta adresi giriniz." }),
  password: z
    .string({ required_error: "Şifre zorunludur." })
    .min(6, { message: "Şifreniz en az 6 karakter olmalı." }),
  selfie: z
    .custom<File>(
      (file) => typeof file !== "undefined" && file !== null && isFileInstance(file),
      { message: "Selfie fotoğrafı yüklemelisiniz." }
    )
    .refine((file) => file && file.size <= MAX_SELFIE_SIZE, {
      message: "Dosya boyutu 5MB'yi geçmemelidir.",
    })
    .refine((file) => file && file.type.startsWith("image/"), {
      message: "Sadece görüntü dosyaları yükleyebilirsiniz.",
    }),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const isFileInstance = (value: unknown): value is File => {
  if (typeof File !== "undefined" && value instanceof File) {
    return true;
  }

  if (typeof Blob !== "undefined" && value instanceof Blob) {
    return true;
  }

  return false;
};

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      selfie: EMPTY_FILE,
    },
  });

  const selfie = useWatch({
    control: form.control,
    name: "selfie",
  });
  const previewUrl = useMemo(() => {
    if (!selfie || !isFileInstance(selfie)) return null;
    return URL.createObjectURL(selfie);
  }, [selfie]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const isSubmitting = form.formState.isSubmitting;

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      await signUpWithProfile({
        fullName: values.fullName,
        email: values.email,
        password: values.password,
        selfie: values.selfie,
      });

      toast({
        title: "Kayıt başarılı!",
        description: "Profiliniz oluşturuldu, yönlendiriliyorsunuz.",
      });

      router.push("/");
    } catch (error) {
      toast({
        title: "Kayıt başarısız",
        description:
          error instanceof Error ? error.message : "Lütfen bilgileri kontrol edin.",
        variant: "destructive",
      });
    }
  };

  return (
    <section className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-muted px-4 py-10">
      <Card className="w-full max-w-lg bg-card shadow-xl">
        <CardHeader className="space-y-3">
          <CardTitle>Kayıt Ol</CardTitle>
          <CardDescription>
            Bilgilerinizi doldurarak birkaç dakika içinde hesabınızı oluşturun.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ad Soyad</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Örn. Deniz Yılmaz"
                        autoComplete="name"
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
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-posta</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="ornek@mail.com"
                        autoComplete="email"
                        inputMode="email"
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
                        placeholder="En az 6 karakter"
                        autoComplete="new-password"
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
                name="selfie"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Selfie Fotoğrafı</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept="image/*"
                        disabled={isSubmitting}
                        ref={field.ref}
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          field.onChange((file as File | undefined) ?? EMPTY_FILE);
                          event.target.value = "";
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Sadece görüntü (JPG/PNG) ve maksimum 5MB olmalıdır.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {previewUrl && (
                <div className="space-y-2 rounded-xl border border-dashed border-muted-foreground/40 p-4 text-sm">
                  <p className="font-medium text-muted-foreground">Önizleme</p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrl}
                    alt="Selfie önizleme"
                    className="h-48 w-full rounded-lg object-cover"
                  />
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Lütfen bekleyin..." : "Hesabımı Oluştur"}
              </Button>
            </form>
          </Form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Zaten hesabınız var mı?{" "}
            <Link className="font-semibold text-primary hover:underline" href="/login">
              Giriş yapın
            </Link>
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
