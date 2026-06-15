import { redirect } from "next/navigation";
import SweetPotatoMascot from "@/components/SweetPotatoMascot";
import { createClient } from "@/lib/supabase/server";
import SellForm from "./SellForm";

export default async function SellPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data?.user) {
    redirect("/login");
  }

  return (
    <div className="flex flex-1 flex-col items-center px-4 py-10">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-sm">
        <div className="mb-4 flex flex-col items-center gap-2">
          <SweetPotatoMascot size={80} mood="happy" />
          <h1 className="text-2xl font-bold text-guma-purple-dark">판매글 작성</h1>
          <p className="text-sm text-guma-purple-dark/70">팔고 싶은 물건을 소개해주세요</p>
        </div>
        <SellForm />
      </div>
    </div>
  );
}
