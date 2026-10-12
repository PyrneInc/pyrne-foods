"use client";

import {
  FormEvent,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import Link from "next/link";

import {
  register,
} from "@/lib/auth-api";

export default function RegisterPage() {
  const router = useRouter();

  const [
    name,
    setName,
  ] = useState("");

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    phone,
    setPhone,
  ] = useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  async function handleSubmit(
    event: FormEvent,
  ) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      await register(
        name,
        email,
        phone,
        password,
      );

      router.push("/store");
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Registration failed.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <p className="text-sm font-medium">
            Pyrne Foods
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Create account
          </h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <input
            required
            placeholder="Name"
            value={name}
            onChange={(event) =>
              setName(
                event.target.value,
              )
            }
            className="w-full rounded-lg border px-3 py-2"
          />

          <input
            required
            type="email"
            placeholder="Email"
            value={email}
            onChange={(event) =>
              setEmail(
                event.target.value,
              )
            }
            className="w-full rounded-lg border px-3 py-2"
          />

          <input
            placeholder="Phone"
            value={phone}
            onChange={(event) =>
              setPhone(
                event.target.value,
              )
            }
            className="w-full rounded-lg border px-3 py-2"
          />

          <input
            required
            minLength={8}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) =>
              setPassword(
                event.target.value,
              )
            }
            className="w-full rounded-lg border px-3 py-2"
          />

          {error && (
            <p className="text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            disabled={loading}
            className="w-full rounded-lg bg-black px-4 py-2 text-white disabled:opacity-50"
          >
            {loading
              ? "Creating..."
              : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium"
          >
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}