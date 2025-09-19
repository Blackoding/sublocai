import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Lexend_Deca } from "next/font/google";
import { useAuthInit } from "@/hooks/useAuthInit";

const lexendDeca = Lexend_Deca({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function App({ Component, pageProps }: AppProps) {
  // Inicializar o estado de autenticação
  useAuthInit();

  return (
    <div className={`${lexendDeca.className} bg-white`}>
      <Header />
      <Component {...pageProps} />
      <Footer />
    </div>
  );
}
