"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// 좋아요 토글: 이미 눌렀으면 취소, 안 눌렀으면 추가 (한 사용자당 최대 1개)
export async function toggleLike(postId: number) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;

  if (!user) {
    return { error: "로그인이 필요해요." };
  }

  const { data: existing } = await supabase
    .from("likes")
    .select("id")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    await supabase.from("likes").delete().eq("id", existing.id);
  } else {
    await supabase.from("likes").insert({ post_id: postId, user_id: user.id });
  }

  revalidatePath(`/posts/${postId}`);
  revalidatePath("/");
  return { ok: true };
}

export type CommentFormState = { error: string } | undefined;

export async function createComment(
  postId: number,
  _prevState: CommentFormState,
  formData: FormData
): Promise<CommentFormState> {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;

  if (!user) {
    return { error: "로그인이 필요해요." };
  }

  const content = (formData.get("content") as string)?.trim();
  if (!content) {
    return { error: "댓글 내용을 입력해주세요." };
  }
  if (content.length > 500) {
    return { error: "댓글은 500자까지 작성할 수 있어요." };
  }

  const { error } = await supabase.from("comments").insert({
    post_id: postId,
    user_id: user.id,
    content,
  });

  if (error) {
    return { error: "댓글 등록에 실패했어요. 잠시 후 다시 시도해주세요." };
  }

  revalidatePath(`/posts/${postId}`);
}

export async function deleteComment(formData: FormData) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;

  if (!user) return;

  const commentId = formData.get("commentId") as string;
  const postId = formData.get("postId") as string;

  await supabase
    .from("comments")
    .delete()
    .eq("id", commentId)
    .eq("user_id", user.id);

  revalidatePath(`/posts/${postId}`);
}
