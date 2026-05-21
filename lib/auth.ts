import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { dbConnect } from "@/lib/mongodb";
import User from "@/lib/models/User";

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      await dbConnect();
      const email = user?.email || token.email;
      if (email) {
        const dbUser = await User.findOne({ email });
        if (dbUser) token.id = dbUser.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) session.user.id = token.id as string;
      return session;
    },
    async signIn({ user }) {
      await dbConnect();
      if (user.email) {
        await User.updateOne(
          { email: user.email.toLowerCase() },
          { $set: { name: user.name, email: user.email.toLowerCase(), image: user.image }, $setOnInsert: { createdAt: new Date() } },
          { upsert: true }
        );
      }
      return true;
    }
  }
});
