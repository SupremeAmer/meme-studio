import { account } from "./appwrite"; // adjust path if needed

export function loginWithGoogle() {
  // Use your frontend URL for the redirect, both local and deployed as needed
  const redirectURL = "http://localhost:3000"; // or your deployed URL
  account.createOAuth2Session(
    "google",
    redirectURL, // Success redirect
    redirectURL  // Failure redirect
  );
}
