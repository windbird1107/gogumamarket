"use client";

import { useActionState, useEffect, useRef } from "react";
import { createComment } from "./social-actions";

type Props = {
  postId: number;
  parentId?: number | null;
  placeholder?: string;
  submitLabel?: string;
  compact?: boolean;
  autoFocus?: boolean;
  onSuccess?: () => void;
};

export default function CommentForm({
  postId,
  parentId = null,
  placeholder = "구매를 희망하시면 댓글을 남겨보세요 🍠",
  submitLabel = "댓글 달기",
  compact = false,
  autoFocus = false,
  onSuccess,
}: Props) {
  const action = createComment.bind(null, postId, parentId);
  const [state, formAction, pending] = useActionState(action, undefined);
  const formRef = useRef<HTMLFormElement>(null);
  const wasPending = useRef(false);

  // 실제 제출이 끝난 뒤(성공)에만 입력창 비우고 콜백 실행
  useEffect(() => {
    if (wasPending.current && !pending) {
      if (!state?.error) {
        formRef.current?.reset();
        onSuccess?.();
      }
    }
    wasPending.current = pending;
  }, [pending, state, onSuccess]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-2">
      <textarea
        name="content"
        required
        maxLength={500}
        rows={2}
        autoFocus={autoFocus}
        className={`resize-none rounded-xl border border-guma-purple-light bg-white px-4 py-2.5 outline-none focus:border-guma-purple ${
          compact ? "text-sm" : "text-sm"
        }`}
        placeholder={placeholder}
      />
      {state?.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-500">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className={`self-end rounded-full bg-guma-purple font-bold text-white transition hover:bg-guma-purple-dark disabled:opacity-60 ${
          compact ? "px-4 py-1.5 text-xs" : "px-5 py-2 text-sm"
        }`}
      >
        {pending ? "등록 중..." : submitLabel}
      </button>
    </form>
  );
}
