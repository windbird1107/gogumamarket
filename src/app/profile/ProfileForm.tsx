"use client";

import { useActionState, useRef, useState } from "react";
import Image from "next/image";
import { updateAvatar, removeAvatar } from "./actions";

type Props = {
  nickname: string;
  email: string;
  avatarUrl: string | null;
};

export default function ProfileForm({ nickname, email, avatarUrl }: Props) {
  const [state, formAction, pending] = useActionState(updateAvatar, undefined);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (preview) URL.revokeObjectURL(preview);
    setPreview(file ? URL.createObjectURL(file) : null);
  };

  // 미리보기 > 저장된 사진 > 기본 아바타 순으로 표시
  const shown = preview ?? avatarUrl;
  const fallbackChar = nickname?.trim()?.[0] ?? "🍠";

  return (
    <div className="flex w-full flex-col items-center gap-5">
      <span className="relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-guma-purple-light text-4xl font-bold text-guma-purple-dark">
        {shown ? (
          <Image src={shown} alt="프로필 사진" fill className="object-cover" sizes="112px" />
        ) : (
          fallbackChar
        )}
      </span>

      <div className="text-center">
        <p className="text-lg font-bold text-guma-purple-dark">{nickname}</p>
        <p className="text-sm text-guma-purple-dark/60">{email}</p>
      </div>

      <form action={formAction} className="flex w-full flex-col gap-3">
        <input
          ref={fileInputRef}
          name="avatar"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="rounded-xl border-2 border-dashed border-guma-purple-light py-3 text-sm font-bold text-guma-purple-dark transition hover:border-guma-purple"
        >
          📷 사진 선택하기
        </button>

        {state && "error" in state && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-500">{state.error}</p>
        )}
        {state && "ok" in state && state.ok && (
          <p className="rounded-lg bg-guma-leaf/20 px-3 py-2 text-sm font-bold text-guma-purple-dark">
            프로필 사진이 저장됐어요! 🍠
          </p>
        )}

        <button
          type="submit"
          disabled={pending || !preview}
          className="rounded-xl bg-guma-purple py-3 font-bold text-white transition hover:bg-guma-purple-dark disabled:opacity-60"
        >
          {pending ? "저장 중..." : "프로필 사진 저장"}
        </button>
      </form>

      {avatarUrl && (
        <form action={removeAvatar} className="w-full">
          <button
            type="submit"
            className="w-full rounded-xl border border-guma-purple-light py-2.5 text-sm font-bold text-guma-purple-dark transition hover:bg-guma-purple-light"
          >
            기본 이미지로 변경
          </button>
        </form>
      )}
    </div>
  );
}
