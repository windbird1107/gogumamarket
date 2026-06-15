import SweetPotatoMascot from "@/components/SweetPotatoMascot";
import SignupForm from "./SignupForm";

export default function SignupPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-sm">
        <div className="mb-4 flex flex-col items-center gap-2">
          <SweetPotatoMascot size={88} mood="wink" />
          <h1 className="text-2xl font-bold text-guma-purple-dark">회원가입</h1>
          <p className="text-sm text-guma-purple-dark/70">고구마마켓 식구가 되어주세요</p>
        </div>
        <SignupForm />
      </div>
    </div>
  );
}
