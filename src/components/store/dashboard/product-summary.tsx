import Link from "next/link";
import { ArrowRight, Package } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

type ProductSummaryProps = {
  total: number;
  available: number;
};

export function ProductSummary({
  total,
  available,
}: ProductSummaryProps) {
  const percentage =
    total > 0 ? Math.round((available / total) * 100) : 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-base">
            Product availability
          </CardTitle>

          <p className="mt-1 text-xs text-muted-foreground">
            Current catalogue status
          </p>
        </div>

        <Package className="size-4 text-muted-foreground" />
      </CardHeader>

      <CardContent>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-3xl font-semibold">
              {available}
            </p>

            <p className="text-xs text-muted-foreground">
              of {total} products available
            </p>
          </div>

          <p className="text-sm font-medium">
            {percentage}%
          </p>
        </div>

        <Progress
          value={percentage}
          className="mt-4"
        />

        <Button
          variant="outline"
          size="sm"
          className="mt-5 w-full"
          render={(
            <Link href="/store/products">
              Manage products
              <ArrowRight className="ml-2 size-3.5" />
            </Link>
          )}
        />
      </CardContent>
    </Card>
  );
}