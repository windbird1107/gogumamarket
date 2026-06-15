"use client";

export default function DeleteButton() {
  return (
    <button
      type="submit"
      onClick={(e) => {
        if (!confirm("정말 삭제하시겠어요?")) {
          e.preventDefault();
        }
      }}
      className="rounded-full border border-red-300 px-4 py-2 text-sm font-bold text-red-500 transition hover:bg-red-50"
    >
      삭제
    </button>
  );
}
