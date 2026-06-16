import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Avatar from "@/components/Avatar";
import { unblockUser } from "@/app/messages/actions";

export default async function BlockedUsersPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;

  if (!user) {
    redirect("/login");
  }

  const { data: blocks } = await supabase
    .from("blocks")
    .select("blocked_id, profiles:profiles!blocked_id(nickname, avatar_url)")
    .eq("blocker_id", user.id);

  const blockList = blocks ?? [];

  return (
    <div className="flex flex-1 flex-col items-center px-4 py-10">
      <div className="w-full max-w-md">
        <Link href="/profile" className="text-sm text-guma-purple-dark/60 hover:underline">
          ← 프로필로
        </Link>
        <h1 className="mb-4 mt-2 text-2xl font-bold text-guma-purple-dark">
          차단 사용자 목록 {blockList.length}
        </h1>

        {blockList.length === 0 ? (
          <p className="rounded-2xl bg-white px-4 py-8 text-center text-sm text-guma-purple-dark/60">
            차단한 사용자가 없어요.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {blockList.map((b) => {
              const blocked = b.profiles as unknown as { nickname: string; avatar_url: string | null } | null;
              return (
                <li
                  key={b.blocked_id}
                  className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm"
                >
                  <div className="flex items-center gap-2">
                    <Avatar src={blocked?.avatar_url} nickname={blocked?.nickname} size={32} />
                    <span className="text-sm font-bold text-guma-purple-dark">
                      {blocked?.nickname ?? "알 수 없음"}
                    </span>
                  </div>
                  <form action={unblockUser}>
                    <input type="hidden" name="targetId" value={b.blocked_id} />
                    <button
                      type="submit"
                      className="rounded-full border border-guma-purple-light px-3 py-1 text-xs font-bold text-guma-purple-dark transition hover:bg-guma-purple-light"
                    >
                      차단 해제
                    </button>
                  </form>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
