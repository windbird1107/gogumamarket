"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleLike } from "./social-actions";

type Props = {
  postId: number;
  initialLiked: boolean;
  initialCount: number;
  isLoggedIn: boolean;
};

export default function LikeButton({
  postId,
  initialLiked,
  initialCount,
  isLoggedIn,
}: Props) {
  const router = useRouter();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    // 화면을 먼저 바꿔서 빠른 반응 (낙관적 업데이트)
    const nextLiked = !liked;
    setLiked(nextLiked);
    setCount((c) => c + (nextLiked ? 1 : -1));

    startTransition(async () => {
      const result = await toggleLike(postId);
      // 실패하면 원래대로 되돌림
      if (result?.error) {
        setLiked(liked);
        setCount(count);
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-pressed={liked}
      className={`flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-bold transition disabled:opacity-60 ${
        liked
          ? "border-guma-purple bg-guma-purple text-white"
          : "border-guma-purple-light bg-white text-guma-purple-dark hover:bg-guma-purple-light"
      }`}
    >
      <span className="text-base leading-none">{liked ? "❤️" : "🤍"}</span>
      <span>{count}</span>
    </button>
  );
}
