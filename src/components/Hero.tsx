import SweetPotatoMascot from "@/components/SweetPotatoMascot";

type Mood = "happy" | "wink" | "sleepy";

// 여러 고구마 캐릭터가 박자를 살짝 어긋나게 춤추도록 설정
const dancers: { size: number; mood: Mood; delay: string; duration: string }[] = [
  { size: 64, mood: "wink", delay: "0s", duration: "1.05s" },
  { size: 84, mood: "happy", delay: "-0.35s", duration: "0.95s" },
  { size: 104, mood: "wink", delay: "-0.7s", duration: "1.1s" },
  { size: 84, mood: "sleepy", delay: "-0.2s", duration: "0.9s" },
  { size: 64, mood: "happy", delay: "-0.55s", duration: "1.0s" },
];

export default function Hero() {
  return (
    <section className="flex w-full max-w-2xl flex-col items-center rounded-3xl bg-gradient-to-b from-guma-purple-light via-guma-cream to-guma-yellow/40 px-6 py-10 text-center shadow-sm">
      <div className="flex items-end justify-center gap-1 sm:gap-3">
        {dancers.map((d, i) => (
          <span
            key={i}
            className="guma-dancer"
            style={{ animationDelay: d.delay, animationDuration: d.duration }}
          >
            <SweetPotatoMascot size={d.size} mood={d.mood} />
          </span>
        ))}
      </div>

      <h1 className="mt-6 text-2xl font-bold leading-snug text-guma-purple-dark sm:text-3xl">
        마치 고구마 먹은 것처럼
        <br />
        행복한 중고 거래, 고구마 마켓
      </h1>
    </section>
  );
}
