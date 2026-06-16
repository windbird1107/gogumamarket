import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/auth/actions";
import Avatar from "@/components/Avatar";

export default async function Header() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data?.user;

  let nickname: string | null = null;
  let avatarUrl: string | null = null;
  let unreadCount = 0;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("nickname, avatar_url")
      .eq("id", user.id)
      .single();
    nickname = profile?.nickname ?? null;
    avatarUrl = (profile?.avatar_url as string | null) ?? null;

    const { count } = await supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("receiver_id", user.id)
      .eq("is_read", false);
    unreadCount = count ?? 0;
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
            <Link
              href="/messages"
              className="relative rounded-full border border-guma-purple px-3 py-1.5 font-bold text-guma-purple-dark transition hover:bg-guma-purple-light"
            >
              쪽지함
              {unreadCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-guma-purple px-1 text-xs font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </Link>
            <Link
              href="/profile"
              className="flex items-center gap-1.5 text-guma-purple-dark transition hover:opacity-80"
            >
              <Avatar src={avatarUrl} nickname={nickname} size={28} />
              <span className="hidden sm:inline">
                <span className="font-bold">{nickname ?? user.email}</span>님
              </span>
            </Link>
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
