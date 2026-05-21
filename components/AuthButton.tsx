import { signIn, signOut } from "@/lib/auth";

export function GoogleSignInButton() {
  return (
    <form action={async () => { "use server"; await signIn("google", { redirectTo: "/dashboard" }); }}>
      <button className="stage-button w-full" type="submit">Continue with Google</button>
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
