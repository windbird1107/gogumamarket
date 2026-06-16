import Link from "next/link";
import Image from "next/image";
import Avatar from "@/components/Avatar";

type Seller = { nickname: string; avatar_url: string | null } | null;

type Props = {
  id: number;
  title: string;
  price: number;
  category: string;
  createdAt: string;
  imageUrls: string[];
  seller?: Seller;
  likeCount?: number;
};

// 홈/프로필 등에서 공통으로 쓰는 판매글 목록 카드
export default function PostCard({
  id,
  title,
  price,
  category,
  createdAt,
  imageUrls,
  seller,
  likeCount,
}: Props) {
  const isFree = Number(price) === 0;
  const thumbnail = imageUrls[0];

  return (
    <Link
      href={`/posts/${id}`}
      className="flex gap-3 rounded-2xl bg-white p-4 shadow-sm transition hover:shadow-md"
    >
      {thumbnail ? (
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl">
          <Image src={thumbnail} alt={title} fill className="object-cover" sizes="80px" />
        </div>
      ) : (
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-guma-purple-light/40 text-3xl">
          🍠
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <div className="flex items-center justify-between gap-2">
          <span className="rounded-full bg-guma-purple-light px-2 py-0.5 text-xs font-bold text-guma-purple-dark">
            {category}
          </span>
          <span className="text-xs text-guma-purple-dark/50">
            {new Date(createdAt).toLocaleDateString("ko-KR")}
          </span>
        </div>
        <h3 className="mt-1 truncate font-bold text-guma-purple-dark">{title}</h3>
        <div className="mt-0.5 flex items-center gap-2">
          <p className="font-bold text-guma-purple-dark">
            {isFree ? "나눔" : `${Number(price).toLocaleString()}원`}
          </p>
          {likeCount != null && likeCount > 0 && (
            <span className="text-xs font-bold text-guma-purple">❤️ {likeCount}</span>
          )}
        </div>
        {seller && (
          <div className="mt-0.5 flex items-center gap-1.5">
            <Avatar src={seller.avatar_url} nickname={seller.nickname} size={18} />
            <span className="text-xs text-guma-purple-dark/60">{seller.nickname}</span>
          </div>
        )}
      </div>
    </Link>
  );
}
