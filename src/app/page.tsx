import Link from "next/link";
import Hero from "@/components/Hero";
import PostCard from "@/components/PostCard";
import PostCardCompact from "@/components/PostCardCompact";
import { CATEGORIES } from "@/lib/categories";
import { createClient } from "@/lib/supabase/server";

type Seller = { nickname: string; avatar_url: string | null } | null;

type PostRow = {
  id: number;
  title: string;
  price: number;
  category: string;
  created_at: string;
  image_urls: string[] | null;
  profiles: Seller;
  likes: { count: number }[];
};

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ confirmed?: string; posted?: string }>;
}) {
  const { confirmed, posted } = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data?.user;

  const { data: rawPosts } = await supabase
    .from("posts")
    .select("id, title, price, category, created_at, image_urls, profiles(nickname, avatar_url), likes(count)")
    .order("created_at", { ascending: false });

  const posts = (rawPosts ?? []) as unknown as PostRow[];
  const likeCountOf = (p: PostRow) => p.likes?.[0]?.count ?? 0;

  // 인기 물건: 좋아요가 1개 이상인 글을 좋아요 많은 순으로 상위 4개
  const popular = [...posts]
    .filter((p) => likeCountOf(p) > 0)
    .sort((a, b) => likeCountOf(b) - likeCountOf(a))
    .slice(0, 4);

  // 카테고리별로 묶기 (글이 있는 카테고리만)
  const postsByCategory = CATEGORIES.map((category) => ({
    category,
    items: posts.filter((p) => p.category === category),
  })).filter((group) => group.items.length > 0);

  return (
    <div className="flex flex-1 flex-col items-center px-4 py-10">
      {confirmed && (
        <p className="mb-6 rounded-full bg-guma-leaf/20 px-4 py-2 text-sm font-bold text-guma-purple-dark">
          🎉 이메일 인증이 완료됐어요! 로그인해보세요.
        </p>
      )}

      {posted && (
        <p className="mb-6 rounded-full bg-guma-leaf/20 px-4 py-2 text-sm font-bold text-guma-purple-dark">
          🍠 판매글이 등록됐어요!
        </p>
      )}

      <Hero />

      {!user && (
        <div className="mt-8 flex gap-3">
          <Link
            href="/signup"
            className="rounded-full bg-guma-purple px-6 py-3 font-bold text-white transition hover:bg-guma-purple-dark"
          >
            회원가입
          </Link>
          <Link
            href="/login"
            className="rounded-full border border-guma-purple px-6 py-3 font-bold text-guma-purple-dark transition hover:bg-guma-purple-light"
          >
            로그인
          </Link>
        </div>
      )}

      {/* 지금 인기 물건 */}
      {popular.length > 0 && (
        <div className="mt-12 w-full max-w-md">
          <h2 className="mb-3 flex items-center gap-2 text-left text-lg font-bold text-guma-purple-dark">
            🔥 지금 인기 물건
          </h2>
          <ul className="flex flex-col gap-3">
            {popular.map((post) => (
              <li key={post.id}>
                <PostCard
                  id={post.id}
                  title={post.title}
                  price={Number(post.price)}
                  category={post.category}
                  createdAt={post.created_at}
                  imageUrls={(post.image_urls as string[]) ?? []}
                  seller={post.profiles}
                  likeCount={likeCountOf(post)}
                />
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 최근 등록된 판매글 */}
      <div className="mt-12 w-full max-w-md">
        <h2 className="mb-3 text-left text-lg font-bold text-guma-purple-dark">
          최근 등록된 판매글
        </h2>

        {posts.length === 0 ? (
          <p className="rounded-2xl bg-white px-4 py-8 text-center text-sm text-guma-purple-dark/60">
            아직 등록된 판매글이 없어요.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {posts.map((post) => (
              <li key={post.id}>
                <PostCard
                  id={post.id}
                  title={post.title}
                  price={Number(post.price)}
                  category={post.category}
                  createdAt={post.created_at}
                  imageUrls={(post.image_urls as string[]) ?? []}
                  seller={post.profiles}
                  likeCount={likeCountOf(post)}
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 카테고리별 판매글 (가로 스크롤) */}
      {postsByCategory.length > 0 && (
        <div className="mt-12 w-full max-w-md">
          <h2 className="mb-3 text-left text-lg font-bold text-guma-purple-dark">
            카테고리별 판매글
          </h2>
          <div className="flex flex-col gap-6">
            {postsByCategory.map((group) => (
              <section key={group.category}>
                <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-guma-purple-dark">
                  <span className="rounded-full bg-guma-purple-light px-2.5 py-0.5">
                    {group.category}
                  </span>
                  <span className="text-xs font-normal text-guma-purple-dark/50">
                    {group.items.length}개
                  </span>
                </h3>
                <ul className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
                  {group.items.map((post) => (
                    <li key={post.id}>
                      <PostCardCompact
                        id={post.id}
                        title={post.title}
                        price={Number(post.price)}
                        imageUrls={(post.image_urls as string[]) ?? []}
                        likeCount={likeCountOf(post)}
                      />
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
