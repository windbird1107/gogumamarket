"use client";

import { useActionState, useState } from "react";
import { CATEGORIES } from "@/lib/categories";
import { updatePost } from "../actions";

type Props = {
  postId: number;
  defaultTitle: string;
  defaultCategory: string;
  defaultPrice: number;
  defaultDescription: string;
};

export default function EditForm({
  postId,
  defaultTitle,
  defaultCategory,
  defaultPrice,
  defaultDescription,
}: Props) {
  const updatePostWithId = updatePost.bind(null, postId);
  const [state, formAction, pending] = useActionState(updatePostWithId, undefined);
  const [isFree, setIsFree] = useState(defaultPrice === 0);

  return (
    <form action={formAction} className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="title" className="text-sm font-bold text-guma-purple-dark">
          제목
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          minLength={2}
          maxLength={40}
          defaultValue={defaultTitle}
          className="rounded-xl border border-guma-purple-light bg-white px-4 py-2.5 outline-none focus:border-guma-purple"
          placeholder="예) 거의 새것 고구마 화분 팔아요"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="category" className="text-sm font-bold text-guma-purple-dark">
          카테고리
        </label>
        <select
          id="category"
          name="category"
          defaultValue={defaultCategory}
          className="rounded-xl border border-guma-purple-light bg-white px-4 py-2.5 outline-none focus:border-guma-purple"
        >
          {CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="price" className="text-sm font-bold text-guma-purple-dark">
          가격
        </label>
        <div className="flex items-center gap-2">
          <input
            id="price"
            name="price"
            type="number"
            min={0}
            step={100}
            required={!isFree}
            disabled={isFree}
            defaultValue={defaultPrice === 0 ? "" : defaultPrice}
            className="flex-1 rounded-xl border border-guma-purple-light bg-white px-4 py-2.5 outline-none focus:border-guma-purple disabled:bg-guma-purple-light/40"
            placeholder="숫자만 입력해주세요"
          />
          <span className="text-sm text-guma-purple-dark/70">원</span>
        </div>
        <label className="mt-1 flex items-center gap-2 text-sm text-guma-purple-dark/80">
          <input
            type="checkbox"
            name="isFree"
            checked={isFree}
            onChange={(e) => setIsFree(e.target.checked)}
            className="h-4 w-4 accent-guma-purple"
          />
          나눔(무료)으로 등록할게요
        </label>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="description" className="text-sm font-bold text-guma-purple-dark">
          상세 설명
        </label>
        <textarea
          id="description"
          name="description"
          required
          minLength={5}
          maxLength={1000}
          rows={6}
          defaultValue={defaultDescription}
          className="resize-none rounded-xl border border-guma-purple-light bg-white px-4 py-2.5 outline-none focus:border-guma-purple"
          placeholder="물건 상태, 거래 방법 등을 자세히 적어주세요"
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
        {pending ? "수정 중..." : "수정하기"}
      </button>
    </form>
  );
}
