import { StoreAuthGuard } from "@/components/store/store-auth-guard";
import { StoreNav } from "@/components/store/store-nav";
import { StoreHeader } from "@/components/store/store-header";
import { StoreProvider } from "@/components/store/store-provider";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StoreProvider>
      <StoreAuthGuard>
        <div className="flex min-h-screen bg-muted/20">
          <StoreNav />

          <div className="flex min-w-0 flex-1 flex-col">
            <StoreHeader />

            <main className="min-w-0 flex-1">
              {children}
            </main>
          </div>
        </div>
      </StoreAuthGuard>
    </StoreProvider>
  );
}