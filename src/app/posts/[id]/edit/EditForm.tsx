"use client";

import { useActionState, useState, useRef } from "react";
import Image from "next/image";
import { CATEGORIES } from "@/lib/categories";
import { updatePost } from "../actions";

const MAX_IMAGES = 5;

type Props = {
  postId: number;
  defaultTitle: string;
  defaultCategory: string;
  defaultPrice: number;
  defaultDescription: string;
  defaultImageUrls: string[];
};

export default function EditForm({
  postId,
  defaultTitle,
  defaultCategory,
  defaultPrice,
  defaultDescription,
  defaultImageUrls,
}: Props) {
  const updatePostWithId = updatePost.bind(null, postId);
  const [state, formAction, pending] = useActionState(updatePostWithId, undefined);
  const [isFree, setIsFree] = useState(defaultPrice === 0);
  const [keepUrls, setKeepUrls] = useState<string[]>(defaultImageUrls);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalCount = keepUrls.length + newFiles.length;

  const removeExisting = (url: string) => {
    setKeepUrls((prev) => prev.filter((u) => u !== url));
  };

  const handleNewFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    const combined = [...newFiles, ...selected].slice(0, MAX_IMAGES - keepUrls.length);
    newPreviews.forEach((url) => URL.revokeObjectURL(url));
    setNewFiles(combined);
    setNewPreviews(combined.map((f) => URL.createObjectURL(f)));
    const dt = new DataTransfer();
    combined.forEach((f) => dt.items.add(f));
    if (fileInputRef.current) fileInputRef.current.files = dt.files;
  };

  const removeNew = (index: number) => {
    URL.revokeObjectURL(newPreviews[index]);
    const updatedFiles = newFiles.filter((_, i) => i !== index);
    const updatedPreviews = newPreviews.filter((_, i) => i !== index);
    setNewFiles(updatedFiles);
    setNewPreviews(updatedPreviews);
    const dt = new DataTransfer();
    updatedFiles.forEach((f) => dt.items.add(f));
    if (fileInputRef.current) fileInputRef.current.files = dt.files;
  };

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

      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold text-guma-purple-dark">
            사진 <span className="font-normal text-guma-purple-dark/60">(최대 {MAX_IMAGES}장)</span>
          </label>
          <span className="text-xs text-guma-purple-dark/50">{totalCount}/{MAX_IMAGES}</span>
        </div>

        {/* 기존 이미지를 유지하기 위한 hidden input */}
        {keepUrls.map((url) => (
          <input key={url} type="hidden" name="keepImageUrl" value={url} />
        ))}

        {/* 새 이미지 파일 input */}
        <input
          ref={fileInputRef}
          name="newImages"
          type="file"
          accept="image/*"
          multiple
          onChange={handleNewFiles}
          className="hidden"
        />

        <div className="flex flex-wrap gap-2">
          {/* 기존 이미지 */}
          {keepUrls.map((url, i) => (
            <div key={url} className="relative h-20 w-20 shrink-0">
              <Image
                src={url}
                alt={`기존 사진 ${i + 1}`}
                fill
                className="rounded-xl object-cover"
              />
              <button
                type="button"
                onClick={() => removeExisting(url)}
                className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-guma-purple-dark text-white text-xs leading-none"
              >
                ×
              </button>
            </div>
          ))}

          {/* 새로 추가한 이미지 */}
          {newPreviews.map((url, i) => (
            <div key={url} className="relative h-20 w-20 shrink-0">
              <Image
                src={url}
                alt={`새 사진 ${i + 1}`}
                fill
                className="rounded-xl object-cover"
              />
              <button
                type="button"
                onClick={() => removeNew(i)}
                className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-guma-purple-dark text-white text-xs leading-none"
              >
                ×
              </button>
            </div>
          ))}

          {totalCount < MAX_IMAGES && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex h-20 w-20 shrink-0 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-guma-purple-light text-guma-purple-dark/50 transition hover:border-guma-purple hover:text-guma-purple"
            >
              <span className="text-2xl leading-none">+</span>
              <span className="text-xs">사진 추가</span>
            </button>
          )}
        </div>
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
