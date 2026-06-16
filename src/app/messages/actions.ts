"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type SendMessageState = { error: string } | { ok: true } | undefined;

// 판매자가 자기 글에 댓글을 단 사람에게 쪽지 보내기
export async function sendMessage(
  postId: number,
  receiverId: string,
  _prevState: SendMessageState,
  formData: FormData
): Promise<SendMessageState> {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;

  if (!user) {
    return { error: "로그인이 필요해요." };
  }

  const content = (formData.get("content") as string)?.trim();
  if (!content) {
    return { error: "쪽지 내용을 입력해주세요." };
  }
  if (content.length > 1000) {
    return { error: "쪽지는 1000자까지 보낼 수 있어요." };
  }

  // 1) 내가 이 글의 판매자(작성자)인지 확인
  const { data: post } = await supabase
    .from("posts")
    .select("id, user_id")
    .eq("id", postId)
    .single();

  if (!post || post.user_id !== user.id) {
    return { error: "이 글의 판매자만 쪽지를 보낼 수 있어요." };
  }

  // 2) 받는 사람이 이 글에 댓글을 단 사람인지 확인
  const { data: comment } = await supabase
    .from("comments")
    .select("id")
    .eq("post_id", postId)
    .eq("user_id", receiverId)
    .limit(1)
    .maybeSingle();

  if (!comment) {
    return { error: "댓글을 단 구매 희망자에게만 쪽지를 보낼 수 있어요." };
  }

  // 3) 차단 관계 확인
  const { data: blocked } = await supabase.rpc("is_blocked_with", {
    other: receiverId,
  });

  if (blocked) {
    return { error: "차단된 사용자와는 쪽지를 주고받을 수 없어요." };
  }

  const { error } = await supabase.from("messages").insert({
    post_id: postId,
    sender_id: user.id,
    receiver_id: receiverId,
    content,
  });

  if (error) {
    return { error: "쪽지 전송에 실패했어요. 잠시 후 다시 시도해주세요." };
  }

  revalidatePath("/messages");
  return { ok: true };
}

// 쪽지 읽음 처리
export async function markAsRead(messageId: number) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  if (!user) return;

  await supabase
    .from("messages")
    .update({ is_read: true })
    .eq("id", messageId)
    .eq("receiver_id", user.id);

  revalidatePath("/messages");
}

// 사용자 차단
export async function blockUser(formData: FormData) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  if (!user) return;

  const targetId = formData.get("targetId") as string;
  if (!targetId || targetId === user.id) return;

  await supabase
    .from("blocks")
    .insert({ blocker_id: user.id, blocked_id: targetId });

  revalidatePath("/messages");
  revalidatePath("/profile/blocked");
}

// 차단 해제
export async function unblockUser(formData: FormData) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  if (!user) return;

  const targetId = formData.get("targetId") as string;
  if (!targetId) return;

  await supabase
    .from("blocks")
    .delete()
    .eq("blocker_id", user.id)
    .eq("blocked_id", targetId);

  revalidatePath("/messages");
  revalidatePath("/profile/blocked");
}
