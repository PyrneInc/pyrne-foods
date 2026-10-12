import type {
  AuthStore,
  AuthUser,
} from "@/types/auth";

async function request<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const response =
    await fetch(path, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type":
          "application/json",
        ...options?.headers,
      },
    });

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data.error ||
        "Request failed.",
    );
  }

  return data;
}

export async function login(
  email: string,
  password: string,
) {
  return request<{
    data: {
      user: AuthUser;
    };
  }>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
    }),
  });
}

export async function register(
  name: string,
  email: string,
  phone: string,
  password: string,
) {
  return request<{
    data: {
      user: AuthUser;
    };
  }>("/api/v1/auth/register", {
    method: "POST",
    body: JSON.stringify({
      name,
      email,
      phone,
      password,
    }),
  });
}

export async function getCurrentUser() {
  return request<{
    data: {
      user: AuthUser;
    };
  }>("/api/v1/auth/me");
}

export async function getUserStores() {
  return request<{
    data: AuthStore[];
  }>("/api/v1/auth/stores");
}

export async function logout() {
  return request<{
    data: {
      success: boolean;
    };
  }>("/api/v1/auth/logout", {
    method: "POST",
  });
}