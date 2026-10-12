"use client";

import { ArrowLeft } from "lucide-react";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  createStore,
} from "@/lib/store-admin-api";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StoreType } from "@/types/marketplace";

type CreateForm = {
    name: string;
    slug: string;
    type: StoreType;
    description: string;
    phone: string;
    email: string;
    address: string;
}

export default function CreateStorePage() {
  const router = useRouter();

  const [form, setForm] =
    useState<CreateForm>({
      name: "",
      slug: "",
      type: "OTHER",
      description: "",
      phone: "",
      email: "",
      address: "",
    });

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  function update(
    field: keyof typeof form,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function submit(
    event: React.FormEvent,
  ) {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      await createStore({
        name: form.name,
        slug: form.slug,
        type: form.type,
        description:
          form.description || null,
        phone: form.phone || null,
        email: form.email || null,
        address:
          form.address || null,
      });

      router.replace("/store");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to create store.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-muted/30 px-6 py-10">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/store/select"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to stores
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>
              Create store
            </CardTitle>
          </CardHeader>

          <CardContent>
            <form
              onSubmit={submit}
              className="space-y-5"
            >
              {error && (
                <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">
                  Store name
                </Label>

                <Input
                  id="name"
                  value={form.name}
                  onChange={(event) =>
                    update(
                      "name",
                      event.target.value,
                    )
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">
                  Store URL
                </Label>

                <Input
                  id="slug"
                  value={form.slug}
                  onChange={(event) =>
                    update(
                      "slug",
                      event.target.value
                        .toLowerCase()
                        .replace(
                          /\s+/g,
                          "-",
                        ),
                    )
                  }
                  placeholder="my-store"
                  required
                />

                <p className="text-xs text-muted-foreground">
                  Example: maandazi-treats
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">
                  Business type
                </Label>

                <Input
                  id="type"
                  value={form.type}
                  onChange={(event) =>
                    update(
                      "type",
                      event.target.value,
                    )
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">
                  Description
                </Label>

                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(event) =>
                    update(
                      "description",
                      event.target.value,
                    )
                  }
                />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">
                    Phone
                  </Label>

                  <Input
                    id="phone"
                    value={form.phone}
                    onChange={(event) =>
                      update(
                        "phone",
                        event.target.value,
                      )
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email
                  </Label>

                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(event) =>
                      update(
                        "email",
                        event.target.value,
                      )
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">
                  Address
                </Label>

                <Input
                  id="address"
                  value={form.address}
                  onChange={(event) =>
                    update(
                      "address",
                      event.target.value,
                    )
                  }
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full"
              >
                {loading
                  ? "Creating..."
                  : "Create store"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}