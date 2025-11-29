import type { Metadata } from "next";
import { Tajawal, Poppins } from "next/font/google";
import "./globals.css";

// Modern Arabic font - clean and readable
const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["200", "300", "400", "500", "700", "800", "900"],
  variable: "--font-tajawal",
  display: "swap",
});

// Modern English font - stylish and clean
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "EaseShopping - Online Shopping",
  description:
    "Your one-stop shop for all your needs. Quality products at great prices.",
  keywords: ["ecommerce", "shopping", "online store", "products"],
};

// Export font variables for use in locale layout
export const fontVariables = `${tajawal.variable} ${poppins.variable}`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
