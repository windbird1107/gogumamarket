import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import MessageItem from "./MessageItem";
import { unblockUser } from "./actions";

type MessageRow = {
  id: number;
  content: string;
  is_read: boolean;
  created_at: string;
  sender_id: string;
  post_id: number | null;
  sender: unknown;
  posts: unknown;
};

function renderItem(m: MessageRow) {
  const sender = m.sender as { nickname: string; avatar_url: string | null } | null;
  const post = m.posts as { title: string } | null;
  return (
    <MessageItem
      key={m.id}
      id={m.id}
      senderId={m.sender_id}
      senderNickname={sender?.nickname ?? "알 수 없음"}
      senderAvatarUrl={sender?.avatar_url ?? null}
      postTitle={post?.title ?? null}
      postId={m.post_id}
      content={m.content}
      createdAt={m.created_at}
      isRead={m.is_read}
    />
  );
}

export default async function MessagesPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;

  if (!user) {
    redirect("/login");
  }

  // 받은 쪽지 (보낸 사람 프로필 + 글 제목 포함)
  const { data: messages } = await supabase
    .from("messages")
    .select("id, content, is_read, created_at, sender_id, post_id, sender:profiles!sender_id(nickname, avatar_url), posts(title)")
    .eq("receiver_id", user.id)
    .order("created_at", { ascending: false });

  // 내가 차단한 사용자 목록
  const { data: blocks } = await supabase
    .from("blocks")
    .select("blocked_id, profiles:profiles!blocked_id(nickname, avatar_url)")
    .eq("blocker_id", user.id);

  const messageList = (messages ?? []) as MessageRow[];
  const blockList = blocks ?? [];
  const unreadList = messageList.filter((m) => !m.is_read);
  const readList = messageList.filter((m) => m.is_read);

  return (
    <div className="flex flex-1 flex-col items-center px-4 py-10">
      <div className="w-full max-w-md">
        <h1 className="mb-4 text-2xl font-bold text-guma-purple-dark">쪽지함</h1>

        {messageList.length === 0 ? (
          <p className="rounded-2xl bg-white px-4 py-8 text-center text-sm text-guma-purple-dark/60">
            받은 쪽지가 없어요.
          </p>
        ) : (
          <div className="flex flex-col gap-6">
            {/* 안 읽은 쪽지 */}
            <section>
              <h2 className="mb-2 flex items-center gap-2 text-sm font-bold text-guma-purple-dark">
                안 읽은 쪽지
                <span className="rounded-full bg-guma-purple px-2 py-0.5 text-xs text-white">
                  {unreadList.length}
                </span>
              </h2>
              {unreadList.length === 0 ? (
                <p className="rounded-2xl bg-white px-4 py-5 text-center text-sm text-guma-purple-dark/50">
                  안 읽은 쪽지가 없어요.
                </p>
              ) : (
                <ul className="flex flex-col gap-3">{unreadList.map(renderItem)}</ul>
              )}
            </section>

            {/* 읽은 쪽지 */}
            <section>
              <h2 className="mb-2 text-sm font-bold text-guma-purple-dark/70">
                읽은 쪽지 {readList.length}
              </h2>
              {readList.length === 0 ? (
                <p className="rounded-2xl bg-white px-4 py-5 text-center text-sm text-guma-purple-dark/50">
                  읽은 쪽지가 없어요.
                </p>
              ) : (
                <ul className="flex flex-col gap-3 opacity-80">{readList.map(renderItem)}</ul>
              )}
            </section>
          </div>
        )}

        {/* 차단한 사용자 관리 */}
        <div className="mt-10">
          <h2 className="mb-3 text-lg font-bold text-guma-purple-dark">차단한 사용자</h2>
          {blockList.length === 0 ? (
            <p className="rounded-2xl bg-white px-4 py-6 text-center text-sm text-guma-purple-dark/60">
              차단한 사용자가 없어요.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {blockList.map((b) => {
                const blocked = b.profiles as unknown as { nickname: string } | null;
                return (
                  <li
                    key={b.blocked_id}
                    className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm"
                  >
                    <span className="text-sm font-bold text-guma-purple-dark">
                      {blocked?.nickname ?? "알 수 없음"}
                    </span>
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

        <div className="mt-8 text-center">
          <Link href="/" className="text-sm text-guma-purple-dark/60 hover:underline">
            ← 홈으로
          </Link>
        </div>
      </div>
    </div>
  );
}
