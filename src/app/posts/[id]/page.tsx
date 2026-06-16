import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { deletePost } from "./actions";
import DeleteButton from "./DeleteButton";

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;

  const { data: post } = await supabase
    .from("posts")
    .select("id, title, description, price, category, status, created_at, user_id, image_urls, profiles(nickname)")
    .eq("id", id)
    .single();

  if (!post) {
    notFound();
  }

  const isFree = Number(post.price) === 0;
  const seller = post.profiles as unknown as { nickname: string } | null;
  const isOwner = user?.id === post.user_id;
  const imageUrls: string[] = (post.image_urls as string[]) ?? [];

  return (
    <div className="flex flex-1 flex-col items-center px-4 py-10">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-sm">
        <Link href="/" className="text-sm text-guma-purple-dark/60 hover:underline">
          ← 목록으로
        </Link>

        {/* 이미지 갤러리 */}
        {imageUrls.length > 0 && (
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {imageUrls.map((url, i) => (
              <div key={i} className="relative h-52 w-52 shrink-0 overflow-hidden rounded-2xl">
                <Image
                  src={url}
                  alt={`상품 사진 ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="208px"
                />
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 flex items-center gap-2">
          <span className="rounded-full bg-guma-purple-light px-2 py-0.5 text-xs font-bold text-guma-purple-dark">
            {post.category}
          </span>
          <span className="rounded-full bg-guma-yellow/30 px-2 py-0.5 text-xs font-bold text-guma-purple-dark">
            {post.status}
          </span>
        </div>

        <h1 className="mt-3 text-2xl font-bold text-guma-purple-dark">{post.title}</h1>

        <p className="mt-1 text-xl font-bold text-guma-purple-dark">
          {isFree ? "나눔" : `${Number(post.price).toLocaleString()}원`}
        </p>

        <p className="mt-1 text-sm text-guma-purple-dark/60">
          {seller?.nickname ?? "알 수 없음"} ·{" "}
          {new Date(post.created_at).toLocaleDateString("ko-KR")}
        </p>

        <p className="mt-4 whitespace-pre-wrap text-guma-purple-dark/80">
          {post.description}
        </p>

        {isOwner && (
          <div className="mt-6 flex gap-2">
            <Link
              href={`/posts/${post.id}/edit`}
              className="rounded-full border border-guma-purple px-4 py-2 text-sm font-bold text-guma-purple-dark transition hover:bg-guma-purple-light"
            >
              수정
            </Link>
            <form action={deletePost}>
              <input type="hidden" name="id" value={post.id} />
              <DeleteButton />
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
