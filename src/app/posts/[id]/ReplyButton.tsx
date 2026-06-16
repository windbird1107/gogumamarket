"use client";

import { useState } from "react";
import CommentForm from "./CommentForm";

type Props = {
  postId: number;
  parentId: number;
  authorNickname: string;
};

export default function ReplyButton({ postId, parentId, authorNickname }: Props) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs font-bold text-guma-purple-dark/60 hover:text-guma-purple hover:underline"
      >
        답글
      </button>
    );
  }

  return (
    <div className="mt-2">
      <CommentForm
        postId={postId}
        parentId={parentId}
        placeholder={`${authorNickname}님에게 답글을 남겨보세요`}
        submitLabel="답글 달기"
        compact
        autoFocus
        onSuccess={() => setOpen(false)}
      />
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="mt-1 text-xs text-guma-purple-dark/50 hover:underline"
      >
        취소
      </button>
    </div>
  );
}
