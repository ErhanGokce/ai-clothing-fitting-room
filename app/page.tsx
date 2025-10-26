import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-[80vh] flex-col items-center justify-center gap-10 px-6 py-16 text-center sm:px-10">
      <div className="space-y-6">
        <span className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1 text-sm font-semibold text-primary">
          Supabase + Next.js 14
        </span>
        <h1 className="text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
          Güvenli giriş ve kayıt ekranları birkaç adım uzağınızda
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          Tailwind CSS ve shadcn/ui ile hazırlanmış modern arayüzler üzerinden
          kullanıcılarınızı Supabase altyapısıyla doğrulayın.
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <Link
          href="/register"
          className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-3 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition hover:-translate-y-0.5 hover:bg-primary/90"
        >
          Kayıt Ol
        </Link>
        <Link
          href="/login"
          className="inline-flex items-center justify-center rounded-full border border-border px-8 py-3 text-base font-semibold text-foreground transition hover:-translate-y-0.5 hover:bg-muted"
        >
          Giriş Yap
        </Link>
      </div>
    </main>
  );
}
