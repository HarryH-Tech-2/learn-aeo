import { getCsrfToken, signIn } from "next-auth/react";

/**
 * Google sign-in in one navigation. next-auth's signIn("google") makes three requests in a row before the
 * browser leaves the page (providers list, CSRF token, then the sign-in POST as JSON): 1–2.5 s of a dead
 * button. Here the token is fetched ahead (call prefetchGoogleSignIn when the button appears) and the click
 * submits an ordinary form POST, which next-auth answers with the redirect to Google.
 */
let csrf: Promise<string | undefined> | null = null;

export function prefetchGoogleSignIn() {
  csrf ??= getCsrfToken().catch(() => undefined);
}

export async function startGoogleSignIn(callbackUrl: string) {
  prefetchGoogleSignIn();
  const token = await csrf;
  if (!token) {
    csrf = null;
    await signIn("google", { callbackUrl });
    return;
  }
  const form = document.createElement("form");
  form.method = "POST";
  form.action = "/api/auth/signin/google";
  for (const [name, value] of [["csrfToken", token], ["callbackUrl", callbackUrl]]) {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    form.appendChild(input);
  }
  document.body.appendChild(form);
  form.submit();
}
