import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProfileForm from "./ProfileForm";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("nickname, avatar_url")
    .eq("id", user.id)
    .single();

  // 메뉴별 개수
  const [{ count: postCount }, { count: likeCount }, { count: blockCount }] =
    await Promise.all([
      supabase.from("posts").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("likes").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("blocks").select("id", { count: "exact", head: true }).eq("blocker_id", user.id),
    ]);

  const menus = [
    { href: "/profile/posts", label: "내 판매글", icon: "🍠", count: postCount ?? 0 },
    { href: "/profile/likes", label: "관심 목록 (좋아요한 글)", icon: "❤️", count: likeCount ?? 0 },
    { href: "/profile/blocked", label: "차단 사용자 목록", icon: "🚫", count: blockCount ?? 0 },
  ];

  return (
    <div className="flex flex-1 flex-col items-center px-4 py-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        {/* 프로필 사진 편집 */}
        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <h1 className="mb-6 text-center text-2xl font-bold text-guma-purple-dark">
            내 프로필
          </h1>
          <ProfileForm
            nickname={profile?.nickname ?? "고구마"}
            email={user.email ?? ""}
            avatarUrl={(profile?.avatar_url as string | null) ?? null}
          />
        </div>

        {/* 메뉴 */}
        <ul className="overflow-hidden rounded-3xl bg-white shadow-sm">
          {menus.map((menu, i) => (
            <li key={menu.href}>
              <Link
                href={menu.href}
                className={`flex items-center justify-between px-6 py-4 transition hover:bg-guma-purple-light/30 ${
                  i > 0 ? "border-t border-guma-purple-light" : ""
                }`}
              >
                <span className="flex items-center gap-3 font-bold text-guma-purple-dark">
                  <span aria-hidden>{menu.icon}</span>
                  {menu.label}
                </span>
                <span className="flex items-center gap-2 text-sm text-guma-purple-dark/50">
                  {menu.count}
                  <span aria-hidden>›</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>

        {/* 개인 정보 */}
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-guma-purple-dark">개인 정보</h2>
          <dl className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-guma-purple-dark/60">이메일 주소</dt>
              <dd className="font-bold text-guma-purple-dark">{user.email}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-guma-purple-dark/60">가입일자</dt>
              <dd className="font-bold text-guma-purple-dark">
                {new Date(user.created_at).toLocaleDateString("ko-KR")}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-guma-purple-dark/60">게시글 수</dt>
              <dd className="font-bold text-guma-purple-dark">{postCount ?? 0}개</dd>
            </div>
          </dl>
        </div>

        <div className="text-center">
          <Link href="/" className="text-sm text-guma-purple-dark/60 hover:underline">
            ← 홈으로
          </Link>
        </div>
      </div>
    </div>
  );
}
