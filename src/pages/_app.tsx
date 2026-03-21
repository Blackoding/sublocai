import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GlobalToast from "@/components/GlobalToast";
import { Lexend_Deca } from "next/font/google";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuthStore } from "@/stores/authStore";

const lexendDeca = Lexend_Deca({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    const validateSubscription = async () => {
      if (!isAuthenticated || !user?.id || user.userType !== "company") {
        return;
      }

      if (user.planEmpresa !== "basic" && user.planEmpresa !== "pro") {
        return;
      }

      const response = await fetch("/api/subscription/status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user.id }),
      });

      const json = (await response.json()) as {
        data?: {
          showWarning: boolean;
          paymentPlan: "basic" | "pro";
        };
      };

      if (!response.ok || !json.data) {
        if (router.pathname !== "/assinatura") {
          router.replace(`/assinatura?plan=${user.planEmpresa}`);
        }
        return;
      }

      if (json.data.showWarning) {
        if (router.pathname !== "/assinatura") {
          router.replace(`/assinatura?plan=${json.data.paymentPlan}`);
        }
        return;
      }
    };

    validateSubscription().catch(() => {
      if (router.pathname !== "/assinatura" && user?.planEmpresa) {
        router.replace(`/assinatura?plan=${user.planEmpresa}`);
      }
    });
  }, [isAuthenticated, router, router.pathname, user]);

  return (
    <div className={`${lexendDeca.className} bg-white`}>
      <GlobalToast />
      <Header />
      <Component {...pageProps} />
      <Footer />
    </div>
  );
}
