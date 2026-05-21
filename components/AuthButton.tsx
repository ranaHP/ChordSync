import { signIn, signOut } from "@/lib/auth";

export function GoogleSignInButton() {
  return (
    <form action={async () => { "use server"; await signIn("google", { redirectTo: "/dashboard" }); }}>
      <button className="stage-button w-full" type="submit">Continue with Google</button>
    </form>
  );
}

export function DemoSignInButton() {
  return (
    <form
      action={async (formData) => {
        "use server";
        await signIn("credentials", {
          email: String(formData.get("email") || ""),
          password: String(formData.get("password") || ""),
          redirectTo: "/dashboard"
        });
      }}
      className="space-y-3"
    >
      <input className="input" name="email" type="email" placeholder="Demo email" required />
      <input className="input" name="password" type="password" placeholder="Demo password" required />
      <button className="stage-button w-full" type="submit">Login with demo account</button>
    </form>
  );
}

export function SignOutButton() {
  return (
    <form action={async () => { "use server"; await signOut({ redirectTo: "/" }); }}>
      <button className="stage-button-secondary" type="submit">Sign out</button>
    </form>
  );
}
