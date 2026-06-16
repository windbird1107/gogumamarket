"use client";

import { useActionState, useEffect, useRef } from "react";
import { createComment } from "./social-actions";

export default function CommentForm({ postId }: { postId: number }) {
  const createCommentWithId = createComment.bind(null, postId);
  const [state, formAction, pending] = useActionState(createCommentWithId, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  // 등록 성공(에러 없음 + 대기 끝)하면 입력창 비우기
  useEffect(() => {
    if (!pending && !state?.error) {
      formRef.current?.reset();
    }
  }, [pending, state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-2">
      <textarea
        name="content"
        required
        maxLength={500}
        rows={2}
        className="resize-none rounded-xl border border-guma-purple-light bg-white px-4 py-2.5 text-sm outline-none focus:border-guma-purple"
        placeholder="구매를 희망하시면 댓글을 남겨보세요 🍠"
      />
      {state?.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-500">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="self-end rounded-full bg-guma-purple px-5 py-2 text-sm font-bold text-white transition hover:bg-guma-purple-dark disabled:opacity-60"
      >
        {pending ? "등록 중..." : "댓글 달기"}
      </button>
    </form>
  );
}
