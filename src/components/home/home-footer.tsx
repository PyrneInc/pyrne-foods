import Link from "next/link";

export function HomeFooter() {
  return (
    <footer className="border-t bg-background">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 md:flex-row md:items-center md:justify-between">
        <div>
          <Link
            href="/"
            className="font-bold tracking-tight"
          >
            Pyrne Foods
          </Link>

          <p className="mt-1 text-sm text-muted-foreground">
            Maandazi Treats
          </p>
        </div>

        <div className="flex gap-5 text-sm text-muted-foreground">
          <Link
            href="/stores"
            className="transition-colors hover:text-foreground"
          >
            Vendors
          </Link>

          <Link
            href="/store"
            className="transition-colors hover:text-foreground"
          >
            Sell with us
          </Link>

          <Link
            href="/cart"
            className="transition-colors hover:text-foreground"
          >
            Cart
          </Link>
        </div>

        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Pyrne Foods
        </p>
      </div>
    </footer>
  );
}