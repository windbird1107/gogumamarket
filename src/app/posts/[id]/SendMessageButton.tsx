"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { sendMessage } from "@/app/messages/actions";

type Props = {
  postId: number;
  receiverId: string;
  receiverNickname: string;
};

export default function SendMessageButton({
  postId,
  receiverId,
  receiverNickname,
}: Props) {
  const action = sendMessage.bind(null, postId, receiverId);
  const [state, formAction, pending] = useActionState(action, undefined);
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // 전송 성공하면 폼 닫고 입력 비우기
  useEffect(() => {
    if (state && "ok" in state && state.ok) {
      formRef.current?.reset();
      setOpen(false);
    }
  }, [state]);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full bg-guma-purple px-3 py-1 text-xs font-bold text-white transition hover:bg-guma-purple-dark"
      >
        쪽지 보내기
      </button>
    );
  }

  return (
    <form ref={formRef} action={formAction} className="mt-2 flex flex-col gap-2">
      <textarea
        name="content"
        required
        maxLength={1000}
        rows={2}
        autoFocus
        className="resize-none rounded-xl border border-guma-purple-light bg-white px-3 py-2 text-sm outline-none focus:border-guma-purple"
        placeholder={`${receiverNickname}님에게 보낼 쪽지를 입력하세요`}
      />
      {state && "error" in state && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-500">{state.error}</p>
      )}
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-full border border-guma-purple-light px-3 py-1 text-xs font-bold text-guma-purple-dark transition hover:bg-guma-purple-light"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-guma-purple px-3 py-1 text-xs font-bold text-white transition hover:bg-guma-purple-dark disabled:opacity-60"
        >
          {pending ? "보내는 중..." : "보내기"}
        </button>
      </div>
    </form>
  );
}
