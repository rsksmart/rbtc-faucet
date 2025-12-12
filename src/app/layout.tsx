import type { Metadata } from "next";
import '../styles/index.scss';

export const metadata: Metadata = {
  title: "Rootstock Faucet - Get Free tRBTC Testnet Tokens",
  description: "Access the Rootstock Testnet Faucet to get free tRBTC tokens for testing and development on the Rootstock blockchain.",
  keywords: ["Rootstock Faucet", "tRBTC", "RBTC", "Rootstock Testnet", "blockchain", "free tokens", "Testnet Faucet", "Rootstock Testnet tokens", "crypto faucet"],
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: "Rootstock Faucet - Get Free tRBTC Testnet Tokens",
    description: "Use the Rootstock Testnet Faucet to claim free tRBTC tokens for testing and development on the Rootstock blockchain.",
    url: "https://faucet.rootstock.io",
    siteName: "Rootstock Faucet",
    images: [
      {
        url: "https://x.com/rootstock_io/photo",
        width: 467,
        height: 245,
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rootstock Faucet - Get Free tRBTC Testnet Tokens",
    description: "Claim free tRBTC tokens on the Rootstock Testnet using the Faucet for testing and development.",
    images: ["https://x.com/rootstock_io/photo"],
    site: "@rootstock_io",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
