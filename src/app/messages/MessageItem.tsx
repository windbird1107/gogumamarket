"use client";

import { useState, useTransition } from "react";
import Avatar from "@/components/Avatar";
import { markAsRead, blockUser } from "./actions";

type Props = {
  id: number;
  senderId: string;
  senderNickname: string;
  senderAvatarUrl: string | null;
  postTitle: string | null;
  postId: number | null;
  content: string;
  createdAt: string;
  isRead: boolean;
};

export default function MessageItem({
  id,
  senderId,
  senderNickname,
  senderAvatarUrl,
  postTitle,
  content,
  createdAt,
  isRead,
}: Props) {
  const [open, setOpen] = useState(false);
  const [read, setRead] = useState(isRead);
  const [, startTransition] = useTransition();

  const handleToggle = () => {
    const next = !open;
    setOpen(next);
    // 처음 펼칠 때 안 읽은 쪽지면 읽음 처리
    if (next && !read) {
      setRead(true);
      startTransition(() => {
        markAsRead(id);
      });
    }
  };

  return (
    <li className="rounded-2xl bg-white px-4 py-3 shadow-sm">
      <button
        type="button"
        onClick={handleToggle}
        className="flex w-full items-center gap-3 text-left"
      >
        <Avatar src={senderAvatarUrl} nickname={senderNickname} size={40} />
        <div className="flex min-w-0 flex-1 flex-col">
          <span
            className={`truncate text-guma-purple-dark ${
              read ? "font-normal" : "font-bold"
            }`}
          >
            {!read && <span className="mr-1 text-guma-purple">●</span>}
            {senderNickname}님의 쪽지
          </span>
          {postTitle && (
            <span className="truncate text-xs text-guma-purple-dark/50">
              📦 {postTitle}
            </span>
          )}
        </div>
        <span className="shrink-0 text-xs text-guma-purple-dark/50">
          {new Date(createdAt).toLocaleDateString("ko-KR")}
        </span>
      </button>

      {open && (
        <div className="mt-3 border-t border-guma-purple-light pt-3">
          <p className="whitespace-pre-wrap text-sm text-guma-purple-dark/80">
            {content}
          </p>
          <form action={blockUser} className="mt-3 text-right">
            <input type="hidden" name="targetId" value={senderId} />
            <button
              type="submit"
              className="text-xs text-guma-purple-dark/50 hover:text-red-500 hover:underline"
            >
              이 사용자 차단하기
            </button>
          </form>
        </div>
      )}
    </li>
  );
}
