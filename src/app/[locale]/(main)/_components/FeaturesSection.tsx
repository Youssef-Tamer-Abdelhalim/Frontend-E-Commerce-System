"use client";

import { useTranslations } from "next-intl";
import { Truck, Shield, RefreshCcw, Headphones } from "lucide-react";

export function FeaturesSection() {
  const t = useTranslations("home");

  const features = [
    {
      icon: Truck,
      title: t("features.freeShipping"),
      description: t("features.freeShippingDesc"),
    },
    {
      icon: Shield,
      title: t("features.securePayment"),
      description: t("features.securePaymentDesc"),
    },
    {
      icon: RefreshCcw,
      title: t("features.easyReturns"),
      description: t("features.easyReturnsDesc"),
    },
    {
      icon: Headphones,
      title: t("features.support"),
      description: t("features.supportDesc"),
    },
  ];

  return (
    <section className="py-12 md:py-16 border-t border-border">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 text-primary mb-4">
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
