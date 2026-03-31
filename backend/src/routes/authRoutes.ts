import { Router } from "express";
import type { UserRole } from "@machine-health/shared";
import {
  exchangeOAuthCode,
  getPublicAuthConfig,
  loginWithCredentials,
  signUpWithInsforge,
  startOAuthFlow,
  verifyEmailCode
} from "../services/authService.js";

export const authRoutes = Router();

authRoutes.get("/config", async (_request, response) => {
  try {
    const config = await getPublicAuthConfig();
    response.json(config);
  } catch (error) {
    console.error(error);
    response.status(500).json({ message: "Failed to load auth configuration" });
  }
});

authRoutes.post("/login", async (request, response) => {
  try {
    const { email, password, role } = request.body as { email?: string; password?: string; role?: UserRole };

    if (!email || !password || !role) {
      response.status(400).json({ message: "Email, password, and role are required" });
      return;
    }

    if (role !== "operator" && role !== "boss") {
      response.status(400).json({ message: "Invalid role selection" });
      return;
    }

    const user = await loginWithCredentials(email, password, role);
    if (!user) {
      response.status(401).json({ message: "Invalid credentials or role mismatch" });
      return;
    }

    response.json({ user });
  } catch (error) {
    console.error(error);
    response.status(500).json({ message: "Login failed" });
  }
});

authRoutes.post("/signup", async (request, response) => {
  try {
    const { name, email, password, role } = request.body as {
      name?: string;
      email?: string;
      password?: string;
      role?: UserRole;
    };

    if (!name || !email || !password || !role) {
      response.status(400).json({ message: "Name, email, password, and role are required" });
      return;
    }

    const result = await signUpWithInsforge({ name, email, password });
    response.status(201).json(result);
  } catch (error) {
    console.error(error);
    response.status(500).json({ message: "Sign up failed" });
  }
});

authRoutes.post("/verify-email", async (request, response) => {
  try {
    const { email, otp, role, name } = request.body as {
      email?: string;
      otp?: string;
      role?: UserRole;
      name?: string;
    };

    if (!email || !otp || !role || !name) {
      response.status(400).json({ message: "Email, verification code, name, and role are required" });
      return;
    }

    const user = await verifyEmailCode({ email, otp, role, name });
    response.json({ user });
  } catch (error) {
    console.error(error);
    response.status(500).json({ message: "Email verification failed" });
  }
});

authRoutes.post("/oauth/start", async (request, response) => {
  try {
    const { provider, redirectTo } = request.body as { provider?: string; redirectTo?: string };

    if (!provider || !redirectTo) {
      response.status(400).json({ message: "Provider and redirectTo are required" });
      return;
    }

    const result = await startOAuthFlow(provider, redirectTo);
    response.json(result);
  } catch (error) {
    console.error(error);
    response.status(500).json({ message: "OAuth start failed" });
  }
});

authRoutes.post("/oauth/exchange", async (request, response) => {
  try {
    const { code, codeVerifier, role } = request.body as {
      code?: string;
      codeVerifier?: string;
      role?: UserRole;
    };

    if (!code || !codeVerifier || !role) {
      response.status(400).json({ message: "Code, codeVerifier, and role are required" });
      return;
    }

    const user = await exchangeOAuthCode({ code, codeVerifier, role });
    response.json({ user });
  } catch (error) {
    console.error(error);
    response.status(500).json({ message: "OAuth exchange failed" });
  }
});
