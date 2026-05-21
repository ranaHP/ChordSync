import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "ChordSync",
  description: "Live group song queues, chords and synced stage scrolling."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster position="top-center" toastOptions={{ style: { background: "#151026", color: "white", border: "1px solid rgba(255,255,255,.12)" } }} />
      </body>
    </html>
  );
}
