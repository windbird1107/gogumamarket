import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import Avatar from "@/components/Avatar";
import { createClient } from "@/lib/supabase/server";
import { deletePost } from "./actions";
import { deleteComment } from "./social-actions";
import DeleteButton from "./DeleteButton";
import LikeButton from "./LikeButton";
import CommentForm from "./CommentForm";
import SendMessageButton from "./SendMessageButton";
import ReplyButton from "./ReplyButton";

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;

  const { data: post } = await supabase
    .from("posts")
    .select("id, title, description, price, category, status, created_at, user_id, image_urls, profiles(nickname, avatar_url)")
    .eq("id", id)
    .single();

  if (!post) {
    notFound();
  }

  // 좋아요 개수 + 내가 눌렀는지, 댓글 목록을 함께 조회
  const [{ count: likeCount }, myLikeResult, { data: comments }] = await Promise.all([
    supabase.from("likes").select("id", { count: "exact", head: true }).eq("post_id", id),
    user
      ? supabase.from("likes").select("id").eq("post_id", id).eq("user_id", user.id).maybeSingle()
      : Promise.resolve({ data: null }),
    supabase
      .from("comments")
      .select("id, content, created_at, user_id, parent_id, profiles(nickname, avatar_url)")
      .eq("post_id", id)
      .order("created_at", { ascending: true }),
  ]);

  const isFree = Number(post.price) === 0;
  const seller = post.profiles as unknown as { nickname: string; avatar_url: string | null } | null;
  const isOwner = user?.id === post.user_id;
  const imageUrls: string[] = (post.image_urls as string[]) ?? [];
  const liked = Boolean(myLikeResult.data);
  const commentList = comments ?? [];

  // 최상위 댓글과 답글로 분리
  type CommentRow = (typeof commentList)[number];
  const topLevelComments = commentList.filter((c) => c.parent_id == null);
  const repliesByParent = new Map<number, CommentRow[]>();
  for (const c of commentList) {
    if (c.parent_id != null) {
      const list = repliesByParent.get(c.parent_id) ?? [];
      list.push(c);
      repliesByParent.set(c.parent_id, list);
    }
  }

  return (
    <div className="flex flex-1 flex-col items-center px-4 py-10">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-sm">
        <Link href="/" className="text-sm text-guma-purple-dark/60 hover:underline">
          ← 목록으로
        </Link>

        {/* 이미지 갤러리 */}
        {imageUrls.length > 0 && (
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {imageUrls.map((url, i) => (
              <div key={i} className="relative h-52 w-52 shrink-0 overflow-hidden rounded-2xl">
                <Image
                  src={url}
                  alt={`상품 사진 ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="208px"
                />
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 flex items-center gap-2">
          <span className="rounded-full bg-guma-purple-light px-2 py-0.5 text-xs font-bold text-guma-purple-dark">
            {post.category}
          </span>
          <span className="rounded-full bg-guma-yellow/30 px-2 py-0.5 text-xs font-bold text-guma-purple-dark">
            {post.status}
          </span>
        </div>

        <h1 className="mt-3 text-2xl font-bold text-guma-purple-dark">{post.title}</h1>

        <p className="mt-1 text-xl font-bold text-guma-purple-dark">
          {isFree ? "나눔" : `${Number(post.price).toLocaleString()}원`}
        </p>

        <div className="mt-2 flex items-center gap-2">
          <Avatar src={seller?.avatar_url} nickname={seller?.nickname} size={28} />
          <p className="text-sm text-guma-purple-dark/60">
            {seller?.nickname ?? "알 수 없음"} ·{" "}
            {new Date(post.created_at).toLocaleDateString("ko-KR")}
          </p>
        </div>

        <p className="mt-4 whitespace-pre-wrap text-guma-purple-dark/80">
          {post.description}
        </p>

        {/* 좋아요 버튼 */}
        <div className="mt-6">
          <LikeButton
            postId={post.id}
            initialLiked={liked}
            initialCount={likeCount ?? 0}
            isLoggedIn={Boolean(user)}
          />
        </div>

        {isOwner && (
          <div className="mt-4 flex gap-2">
            <Link
              href={`/posts/${post.id}/edit`}
              className="rounded-full border border-guma-purple px-4 py-2 text-sm font-bold text-guma-purple-dark transition hover:bg-guma-purple-light"
            >
              수정
            </Link>
            <form action={deletePost}>
              <input type="hidden" name="id" value={post.id} />
              <DeleteButton />
            </form>
          </div>
        )}

        {/* 댓글 영역 */}
        <div className="mt-8 border-t border-guma-purple-light pt-6">
          <h2 className="mb-3 text-lg font-bold text-guma-purple-dark">
            댓글 {commentList.length}
          </h2>

          {user ? (
            <CommentForm postId={post.id} />
          ) : (
            <p className="rounded-xl bg-guma-purple-light/30 px-4 py-3 text-sm text-guma-purple-dark/70">
              댓글을 작성하려면{" "}
              <Link href="/login" className="font-bold underline">
                로그인
              </Link>
              이 필요해요.
            </p>
          )}

          <ul className="mt-4 flex flex-col gap-3">
            {commentList.length === 0 ? (
              <li className="py-4 text-center text-sm text-guma-purple-dark/50">
                아직 댓글이 없어요. 첫 댓글을 남겨보세요!
              </li>
            ) : (
              topLevelComments.map((comment) => {
                const writer = comment.profiles as unknown as { nickname: string; avatar_url: string | null } | null;
                const isMine = user?.id === comment.user_id;
                const replies = repliesByParent.get(comment.id) ?? [];
                return (
                  <li
                    key={comment.id}
                    className="rounded-xl bg-guma-purple-light/20 px-4 py-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Avatar src={writer?.avatar_url} nickname={writer?.nickname} size={24} />
                        <span className="text-sm font-bold text-guma-purple-dark">
                          {writer?.nickname ?? "알 수 없음"}
                        </span>
                      </div>
                      <span className="text-xs text-guma-purple-dark/50">
                        {new Date(comment.created_at).toLocaleDateString("ko-KR")}
                      </span>
                    </div>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-guma-purple-dark/80">
                      {comment.content}
                    </p>

                    <div className="mt-2 flex items-center gap-3">
                      {/* 로그인한 사용자는 답글 작성 가능 */}
                      {user && (
                        <ReplyButton
                          postId={post.id}
                          parentId={comment.id}
                          authorNickname={writer?.nickname ?? "작성자"}
                        />
                      )}
                      {isMine && (
                        <form action={deleteComment}>
                          <input type="hidden" name="commentId" value={comment.id} />
                          <input type="hidden" name="postId" value={post.id} />
                          <button
                            type="submit"
                            className="text-xs text-guma-purple-dark/50 hover:text-red-500 hover:underline"
                          >
                            삭제
                          </button>
                        </form>
                      )}
                    </div>

                    {/* 판매자는 댓글 단 구매 희망자에게 쪽지 보내기 가능 (본인 댓글 제외) */}
                    {isOwner && comment.user_id !== post.user_id && (
                      <div className="mt-2">
                        <SendMessageButton
                          postId={post.id}
                          receiverId={comment.user_id}
                          receiverNickname={writer?.nickname ?? "구매 희망자"}
                        />
                      </div>
                    )}

                    {/* 답글 목록 */}
                    {replies.length > 0 && (
                      <ul className="mt-3 flex flex-col gap-2 border-l-2 border-guma-purple-light pl-3">
                        {replies.map((reply) => {
                          const replyWriter = reply.profiles as unknown as { nickname: string; avatar_url: string | null } | null;
                          const isMyReply = user?.id === reply.user_id;
                          return (
                            <li key={reply.id} className="rounded-xl bg-white/70 px-3 py-2">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5">
                                  <Avatar src={replyWriter?.avatar_url} nickname={replyWriter?.nickname} size={20} />
                                  <span className="text-xs font-bold text-guma-purple-dark">
                                    ↳ {replyWriter?.nickname ?? "알 수 없음"}
                                  </span>
                                </div>
                                <span className="text-xs text-guma-purple-dark/50">
                                  {new Date(reply.created_at).toLocaleDateString("ko-KR")}
                                </span>
                              </div>
                              <p className="mt-1 whitespace-pre-wrap text-sm text-guma-purple-dark/80">
                                {reply.content}
                              </p>
                              {isMyReply && (
                                <form action={deleteComment} className="mt-1 text-right">
                                  <input type="hidden" name="commentId" value={reply.id} />
                                  <input type="hidden" name="postId" value={post.id} />
                                  <button
                                    type="submit"
                                    className="text-xs text-guma-purple-dark/50 hover:text-red-500 hover:underline"
                                  >
                                    삭제
                                  </button>
                                </form>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </li>
                );
              })
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
