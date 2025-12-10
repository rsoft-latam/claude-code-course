import { test, expect, vi, beforeEach, afterEach } from "vitest";

// Mock server-only to prevent import errors in test environment
vi.mock("server-only", () => ({}));

// Mock next/headers
const mockSet = vi.fn();
const mockGet = vi.fn();
const mockDelete = vi.fn();

vi.mock("next/headers", () => ({
  cookies: vi.fn(() => ({
    set: mockSet,
    get: mockGet,
    delete: mockDelete,
  })),
}));

// Mock jose - need to create mock functions in the factory
vi.mock("jose", () => {
  const mockSign = vi.fn();
  const mockSetProtectedHeader = vi.fn();
  const mockSetExpirationTime = vi.fn();
  const mockSetIssuedAt = vi.fn();

  return {
    SignJWT: vi.fn((payload) => {
      // Store the payload for assertions
      (mockSign as any).lastPayload = payload;
      return {
        setProtectedHeader: mockSetProtectedHeader.mockReturnThis(),
        setExpirationTime: mockSetExpirationTime.mockReturnThis(),
        setIssuedAt: mockSetIssuedAt.mockReturnThis(),
        sign: mockSign,
      };
    }),
    jwtVerify: vi.fn(),
    // Expose mocks for testing
    __mocks: {
      mockSign,
      mockSetProtectedHeader,
      mockSetExpirationTime,
      mockSetIssuedAt,
    },
  };
});

// Import createSession after all mocks are defined
import { createSession } from "../auth";
import * as jose from "jose";

// Access the mock functions
const getMocks = () => (jose as any).__mocks;

beforeEach(() => {
  vi.clearAllMocks();
  const mocks = getMocks();
  mocks.mockSign.mockResolvedValue("mock-jwt-token");

  // Mock Date.now() to return a fixed timestamp for consistent testing
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2025-01-01T00:00:00.000Z"));
});

afterEach(() => {
  vi.useRealTimers();
});

test("createSession creates a JWT token with correct payload", async () => {
  const userId = "user-123";
  const email = "test@example.com";

  await createSession(userId, email);

  // Verify SignJWT was called
  expect(jose.SignJWT).toHaveBeenCalledWith(
    expect.objectContaining({
      userId: "user-123",
      email: "test@example.com",
      expiresAt: expect.any(Date),
    })
  );
});

test("createSession sets JWT expiration to 7 days", async () => {
  await createSession("user-123", "test@example.com");

  const mocks = getMocks();
  expect(mocks.mockSetProtectedHeader).toHaveBeenCalledWith({ alg: "HS256" });
  expect(mocks.mockSetExpirationTime).toHaveBeenCalledWith("7d");
  expect(mocks.mockSetIssuedAt).toHaveBeenCalled();
  expect(mocks.mockSign).toHaveBeenCalled();
});

test("createSession sets cookie with correct options", async () => {
  const originalEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = "development";

  await createSession("user-123", "test@example.com");

  // Calculate expected expiration (7 days from mocked time)
  const expectedExpiration = new Date("2025-01-08T00:00:00.000Z");

  expect(mockSet).toHaveBeenCalledWith("auth-token", "mock-jwt-token", {
    httpOnly: true,
    secure: false, // development mode
    sameSite: "lax",
    expires: expectedExpiration,
    path: "/",
  });

  process.env.NODE_ENV = originalEnv;
});

test("createSession sets secure cookie in production", async () => {
  const originalEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = "production";

  await createSession("user-123", "test@example.com");

  expect(mockSet).toHaveBeenCalledWith(
    "auth-token",
    "mock-jwt-token",
    expect.objectContaining({
      secure: true, // production mode
    })
  );

  process.env.NODE_ENV = originalEnv;
});

test("createSession calculates expiration date 7 days from now", async () => {
  // Current time is mocked to 2025-01-01T00:00:00.000Z
  const expectedExpiration = new Date("2025-01-08T00:00:00.000Z");

  await createSession("user-123", "test@example.com");

  // Check the SignJWT was called with correct expiration
  const callArgs = (jose.SignJWT as any).mock.calls[0][0];
  expect(callArgs.expiresAt).toEqual(expectedExpiration);
});

test("createSession sets httpOnly flag for security", async () => {
  await createSession("user-123", "test@example.com");

  expect(mockSet).toHaveBeenCalledWith(
    "auth-token",
    "mock-jwt-token",
    expect.objectContaining({
      httpOnly: true,
    })
  );
});

test("createSession sets sameSite to lax", async () => {
  await createSession("user-123", "test@example.com");

  expect(mockSet).toHaveBeenCalledWith(
    "auth-token",
    "mock-jwt-token",
    expect.objectContaining({
      sameSite: "lax",
    })
  );
});

test("createSession sets cookie path to root", async () => {
  await createSession("user-123", "test@example.com");

  expect(mockSet).toHaveBeenCalledWith(
    "auth-token",
    "mock-jwt-token",
    expect.objectContaining({
      path: "/",
    })
  );
});

test("createSession handles different user IDs and emails", async () => {
  const testCases = [
    { userId: "admin-456", email: "admin@example.com" },
    { userId: "guest-789", email: "guest@test.com" },
    { userId: "user-with-long-id-12345", email: "longname@domain.co.uk" },
  ];

  for (const { userId, email } of testCases) {
    vi.clearAllMocks();
    await createSession(userId, email);

    expect(jose.SignJWT).toHaveBeenCalledWith(
      expect.objectContaining({
        userId,
        email,
      })
    );
  }
});

test("createSession includes expiresAt in JWT payload", async () => {
  await createSession("user-123", "test@example.com");

  const callArgs = (jose.SignJWT as any).mock.calls[0][0];
  expect(callArgs).toHaveProperty("expiresAt");
  expect(callArgs.expiresAt).toBeInstanceOf(Date);
});
