import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/auth/actions";

export default async function Header() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data?.user;

  let nickname: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("nickname")
      .eq("id", user.id)
      .single();
    nickname = profile?.nickname ?? null;
  }

  return (
    <header className="sticky top-0 z-10 border-b border-guma-purple-light bg-guma-cream/90 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-guma-purple-dark">
          <span aria-hidden>🍠</span>
          고구마마켓
        </Link>

        {user ? (
          <div className="flex items-center gap-3 text-sm">
            <Link
              href="/sell"
              className="rounded-full bg-guma-yellow px-3 py-1.5 font-bold text-guma-purple-dark transition hover:bg-guma-yellow-dark"
            >
              판매하기
            </Link>
            <span className="hidden text-guma-purple-dark sm:inline">
              <span className="font-bold">{nickname ?? user.email}</span>님 반가워요!
            </span>
            <form action={logout}>
              <button
                type="submit"
                className="rounded-full border border-guma-purple px-3 py-1.5 font-bold text-guma-purple-dark transition hover:bg-guma-purple-light"
              >
                로그아웃
              </button>
            </form>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm">
            <Link
              href="/login"
              className="rounded-full border border-guma-purple px-3 py-1.5 font-bold text-guma-purple-dark transition hover:bg-guma-purple-light"
            >
              로그인
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-guma-purple px-3 py-1.5 font-bold text-white transition hover:bg-guma-purple-dark"
            >
              회원가입
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
