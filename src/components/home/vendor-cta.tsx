import Link from "next/link";
import { ArrowRight, Store } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function VendorCta() {
  return (
    <section className="px-4 pb-16">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-primary text-primary-foreground">
        <div className="flex flex-col items-start justify-between gap-8 px-6 py-10 md:flex-row md:items-center md:px-10 md:py-12">
          <div className="max-w-xl">
            <Badge
              variant="secondary"
              className="border-0 bg-primary-foreground/15 text-primary-foreground"
            >
              Sell with Pyrne Foods
            </Badge>

            <h2 className="mt-4 text-2xl font-bold tracking-tight md:text-3xl">
              Have something delicious to sell?
            </h2>

            <p className="mt-3 text-sm leading-6 text-primary-foreground/75 md:text-base">
              Join Pyrne Foods and connect your food business
              with customers looking for their next favourite treat.
            </p>

            <Button
              variant="secondary"
              className="mt-6 rounded-full"
              render={<Link href="/store" />}
            >
              Become a vendor
              <ArrowRight />
            </Button>
          </div>

          <div className="hidden size-32 items-center justify-center rounded-full bg-primary-foreground/10 md:flex">
            <Store className="size-14" />
          </div>
        </div>
      </div>
    </section>
  );
}