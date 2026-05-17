import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { GoogleSignInButton } from "@/components/AuthButton";

export default async function LoginPage() {
  const session = await auth();
  if (session) redirect("/dashboard");
  return <main className="mx-auto flex min-h-screen max-w-md items-center px-6"><div className="stage-card w-full p-8"><p className="text-neon-blue">Welcome to ChordSync</p><h1 className="mt-2 text-4xl font-black">Sign in to sync the stage.</h1><p className="my-6 text-white/60">Use Google to create your profile and join live groups.</p><GoogleSignInButton /></div></main>;
}
