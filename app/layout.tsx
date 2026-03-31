// app/layout.tsx
import "./globals.css";
import { AuthProvider } from "./providers";
import Navbar from "@/components/Navbar";
import SWRegister from "@/components/SWRegister";

export const metadata = {
  title: "DualTrack",
  description: "Track your growth with your partner",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0b0f19" />
      </head>
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <Navbar />
          <SWRegister /> 
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}