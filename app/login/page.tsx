import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { DemoSignInButton, GoogleSignInButton } from "@/components/AuthButton";

export default async function LoginPage() {
  const session = await auth();
  if (session) redirect("/dashboard");
  const googleEnabled = Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);
  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-6">
      <div className="stage-card w-full space-y-5 p-8">
        <p className="text-neon-blue">Welcome to ChordSync</p>
        <h1 className="mt-2 text-4xl font-black">Sign in to sync the stage.</h1>
        <p className="text-white/60">Use demo login now, and enable Google later by setting Google OAuth env variables.</p>
        <DemoSignInButton />
        {googleEnabled && <GoogleSignInButton />}
      </div>
    </main>
  );
}
