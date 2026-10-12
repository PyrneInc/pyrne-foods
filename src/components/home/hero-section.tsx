import { ArrowRight, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function HeroSection() {
  return (
    <section className="overflow-hidden border-b bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 md:py-20 lg:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_0.8fr] lg:gap-16">
          <div className="max-w-2xl">
            <Badge
              variant="secondary"
              className="mb-5 rounded-full px-3 py-1"
            >
              Freshly made for you
            </Badge>

            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Your cravings,
              <br />
              <span className="text-primary">
                made delicious.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground md:text-lg">
              Discover fresh maandazi, snacks and
              treats from local vendors. Order your
              favourites and enjoy them wherever you are.
            </p>

            <div className="mt-8 flex max-w-xl flex-col gap-2 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  placeholder="What are you craving?"
                  className="h-12 rounded-full border-0 bg-muted pl-10 shadow-none"
                />
              </div>

              <Button
                size="lg"
                className="h-12 rounded-full px-6"
              >
                Search
                <ArrowRight />
              </Button>
            </div>

            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <span>Freshly prepared</span>
              <span>•</span>
              <span>Local vendors</span>
              <span>•</span>
              <span>Easy ordering</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-lg">
            <div className="absolute -inset-4 rounded-[3rem] bg-primary/10 blur-3xl" />

            <div className="relative aspect-square overflow-hidden rounded-[2.5rem] bg-muted">
              <div className="flex h-full flex-col items-center justify-center gap-4">
                <span className="text-8xl md:text-9xl">
                  🥯
                </span>

                <div className="text-center">
                  <p className="text-xl font-bold">
                    Fresh Maandazi
                  </p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Made fresh. Made delicious.
                  </p>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-4 -left-3 rounded-2xl bg-background px-4 py-3 shadow-lg">
              <p className="text-xs text-muted-foreground">
                Starting from
              </p>

              <p className="font-bold">
                KSh 10
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}