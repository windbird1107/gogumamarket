"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signup } from "@/app/auth/actions";

export default function SignupForm() {
  const [state, formAction, pending] = useActionState(signup, undefined);

  return (
    <form action={formAction} className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="nickname" className="text-sm font-bold text-guma-purple-dark">
          닉네임
        </label>
        <input
          id="nickname"
          name="nickname"
          type="text"
          required
          minLength={2}
          maxLength={12}
          className="rounded-xl border border-guma-purple-light bg-white px-4 py-2.5 outline-none focus:border-guma-purple"
          placeholder="고구마러버"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm font-bold text-guma-purple-dark">
          이메일
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="rounded-xl border border-guma-purple-light bg-white px-4 py-2.5 outline-none focus:border-guma-purple"
          placeholder="goguma@example.com"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm font-bold text-guma-purple-dark">
          비밀번호
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          className="rounded-xl border border-guma-purple-light bg-white px-4 py-2.5 outline-none focus:border-guma-purple"
          placeholder="6자 이상 입력해주세요"
        />
      </div>

      {state?.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-500">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-xl bg-guma-purple py-3 font-bold text-white transition hover:bg-guma-purple-dark disabled:opacity-60"
      >
        {pending ? "가입 중..." : "회원가입"}
      </button>

      <p className="text-center text-sm text-guma-purple-dark/80">
        이미 계정이 있으신가요?{" "}
        <Link href="/login" className="font-bold text-guma-purple-dark underline">
          로그인
        </Link>
      </p>
    </form>
  );
}
