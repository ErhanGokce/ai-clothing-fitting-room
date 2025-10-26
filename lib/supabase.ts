import { createClient } from "@supabase/supabase-js";
import type { User } from "@supabase/supabase-js";
import { formatErrorMessage } from "@/lib/utils";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Supabase yapılandırması eksik. Lütfen NEXT_PUBLIC_SUPABASE_URL ve NEXT_PUBLIC_SUPABASE_ANON_KEY değişkenlerini .env dosyasına ekleyin."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    detectSessionInUrl: true,
    persistSession: false,
  },
});

type SignUpPayload = {
  fullName: string;
  email: string;
  password: string;
  selfie: File;
};

export async function signUpWithProfile(payload: SignUpPayload) {
  const { fullName, email, password, selfie } = payload;

  const {
    data: { user },
    error,
  } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
      emailRedirectTo: `${supabaseUrl}/auth/v1/callback`,
    },
  });

  if (error) {
    throw new Error(
      translateSupabaseError(error.message) ??
        "Kayıt işlemi sırasında bir sorun oluştu."
    );
  }

  if (!user) {
    throw new Error("Kullanıcı bilgisine erişilemedi.");
  }

  const avatarUrl = await uploadSelfie(user, selfie);

  const { error: profileError } = await supabase.from("profiles").insert({
    id: user.id,
    full_name: fullName,
    avatar_url: avatarUrl,
  });

  if (profileError) {
    throw new Error(
      translateSupabaseError(profileError.message) ??
        "Profil kaydedilirken bir sorun oluştu."
    );
  }

  return { user, avatarUrl };
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(
      translateSupabaseError(error.message) ??
        "Giriş yapılamadı, lütfen bilgilerinizi kontrol edin."
    );
  }

  return data.user;
}

async function uploadSelfie(user: User, file: File) {
  const extension = ".jpg";
  const path = `selfies/${user.id}${extension}`;

  const { error: uploadError } = await supabase.storage
    .from("users")
    .upload(path, file, {
      cacheControl: "3600",
      upsert: true,
      contentType: file.type || "image/jpeg",
    });

  if (uploadError) {
    throw new Error(
      translateSupabaseError(uploadError.message) ??
        "Selfie yüklenirken bir hata oluştu."
    );
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("users").getPublicUrl(path);

  return publicUrl;
}

function translateSupabaseError(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("password")) {
    return "Şifreniz gereksinimleri karşılamıyor.";
  }

  if (normalized.includes("user already registered")) {
    return "Bu e-posta adresiyle zaten bir hesap oluşturulmuş.";
  }

  if (normalized.includes("invalid login credentials")) {
    return "E-posta veya şifre hatalı.";
  }

  if (normalized.includes("storage")) {
    return "Dosya yükleme sırasında Supabase Storage hatası oluştu.";
  }

  if (normalized.includes("profiles")) {
    return "Profil bilgileri kaydedilemedi.";
  }

  return formatErrorMessage(message);
}
