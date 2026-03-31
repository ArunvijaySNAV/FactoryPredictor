import bcrypt from "bcryptjs";
import type { UserRole } from "@machine-health/shared";
import { insforge } from "../data/insforgeClient";
import { getDbUserByEmail, upsertAppUser } from "../data/insforgeRepository";
import { store } from "../data/store";

export async function loginWithCredentials(email: string, password: string, selectedRole: UserRole) {
  const hostedAuth = await insforge.auth.signInWithPassword({
    email,
    password
  });

  if (!hostedAuth.error && hostedAuth.data?.user) {
    const authUser = hostedAuth.data.user as { id: string; email?: string; name?: string };
    const appUser = await getDbUserByEmail(email);

    if (appUser && appUser.role !== selectedRole) {
      return null;
    }

    return upsertAppUser({
      id: authUser.id,
      name: appUser?.name ?? authUser.name ?? email.split("@")[0],
      email: authUser.email ?? email,
      role: appUser?.role ?? selectedRole,
      passwordHash: appUser?.password_hash ?? "managed-by-insforge-auth"
    });
  }

  const dbUser = await getDbUserByEmail(email);
  if (!dbUser) {
    return null;
  }

  if (!dbUser.password_hash) {
    return null;
  }

  const passwordMatches = await bcrypt.compare(password, dbUser.password_hash);
  if (!passwordMatches) {
    return null;
  }

  if (dbUser.role !== selectedRole) {
    return null;
  }

  const user = {
    id: dbUser.id,
    name: dbUser.name,
    email: dbUser.email,
    role: dbUser.role
  };

  const existing = store.users.find((entry) => entry.id === user.id);
  if (!existing) {
    store.users.push(user);
  }

  return user;
}

export async function getPublicAuthConfig() {
  const { data, error } = await insforge.auth.getPublicAuthConfig();
  if (error) {
    throw error;
  }

  return {
    oAuthProviders: data?.oAuthProviders ?? [],
    requireEmailVerification: data?.requireEmailVerification ?? true,
    passwordMinLength: data?.passwordMinLength ?? 6,
    verifyEmailMethod: (data?.verifyEmailMethod ?? "code") as "code" | "link"
  };
}

export async function signUpWithInsforge(input: {
  name: string;
  email: string;
  password: string;
}) {
  const { data, error } = await insforge.auth.signUp({
    email: input.email,
    password: input.password,
    name: input.name
  });

  if (error) {
    throw error;
  }

  return {
    requireEmailVerification: data?.requireEmailVerification ?? true
  };
}

export async function verifyEmailCode(input: {
  email: string;
  otp: string;
  role: UserRole;
  name: string;
}) {
  const { data, error } = await insforge.auth.verifyEmail({
    email: input.email,
    otp: input.otp
  });

  if (error || !data?.user) {
    throw error ?? new Error("Verification failed");
  }

  const authUser = data.user as { id: string; email?: string; name?: string };

  return upsertAppUser({
    id: authUser.id,
    name: input.name || authUser.name || input.email.split("@")[0],
    email: authUser.email ?? input.email,
    role: input.role
  });
}

export async function startOAuthFlow(provider: string, redirectTo: string) {
  const { data, error } = await insforge.auth.signInWithOAuth({
    provider,
    redirectTo,
    skipBrowserRedirect: true
  });

  if (error || !data?.url || !data?.codeVerifier) {
    throw error ?? new Error("OAuth start failed");
  }

  return {
    url: data.url,
    codeVerifier: data.codeVerifier
  };
}

export async function exchangeOAuthCode(input: {
  code: string;
  codeVerifier: string;
  role: UserRole;
}) {
  const { data, error } = await insforge.auth.exchangeOAuthCode(input.code, input.codeVerifier);
  if (error || !data?.user) {
    throw error ?? new Error("OAuth exchange failed");
  }

  const authUser = data.user as { id: string; email?: string; name?: string };
  const appUser = authUser.email ? await getDbUserByEmail(authUser.email) : null;

  if (appUser && appUser.role !== input.role) {
    throw new Error("Authenticated account does not match the selected role");
  }

  return upsertAppUser({
    id: authUser.id,
    name: appUser?.name ?? authUser.name ?? authUser.email?.split("@")[0] ?? "Factory User",
    email: authUser.email ?? `${authUser.id}@factory.local`,
    role: appUser?.role ?? input.role,
    passwordHash: appUser?.password_hash ?? "managed-by-insforge-auth"
  });
}
