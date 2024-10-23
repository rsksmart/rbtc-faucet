import type { Metadata } from "next";
import '../styles/index.scss';

export const metadata: Metadata = {
  title: "RSK Testnet Faucet",
  description: "https://faucet.rootstock.io/",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <link href="/favico.png" rel='icon'/>
      <body className="bg-red-600">
        {children}
      </body>
    </html>
  );
}
