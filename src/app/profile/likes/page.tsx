import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PostCard from "@/components/PostCard";

type LikedPost = {
  id: number;
  title: string;
  price: number;
  category: string;
  created_at: string;
  image_urls: string[] | null;
  profiles: { nickname: string; avatar_url: string | null } | null;
};

export default async function LikedPostsPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;

  if (!user) {
    redirect("/login");
  }

  // 내가 좋아요한 글 (좋아요 누른 순)
  const { data: likes } = await supabase
    .from("likes")
    .select("post_id, created_at, posts(id, title, price, category, created_at, image_urls, profiles(nickname, avatar_url))")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const likedPosts = (likes ?? [])
    .map((l) => l.posts as unknown as LikedPost | null)
    .filter((p): p is LikedPost => p !== null);

  return (
    <div className="flex flex-1 flex-col items-center px-4 py-10">
      <div className="w-full max-w-md">
        <Link href="/profile" className="text-sm text-guma-purple-dark/60 hover:underline">
          ← 프로필로
        </Link>
        <h1 className="mb-4 mt-2 text-2xl font-bold text-guma-purple-dark">
          관심 목록 {likedPosts.length}
        </h1>

        {likedPosts.length === 0 ? (
          <p className="rounded-2xl bg-white px-4 py-8 text-center text-sm text-guma-purple-dark/60">
            아직 좋아요한 글이 없어요. 마음에 드는 글에 ❤️를 눌러보세요!
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {likedPosts.map((post) => (
              <li key={post.id}>
                <PostCard
                  id={post.id}
                  title={post.title}
                  price={Number(post.price)}
                  category={post.category}
                  createdAt={post.created_at}
                  imageUrls={(post.image_urls as string[]) ?? []}
                  seller={post.profiles}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
