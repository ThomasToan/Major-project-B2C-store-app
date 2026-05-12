import { test as setup } from "@playwright/test";

setup(
  "authenticate assignment 3",
  { tag: "@a3" },
  async ({ playwright }) => {
    const authFile = ".auth/user.json"; // stores login cookie here (save browser session)

    const apiContext = await playwright.request.newContext({
      baseURL: "http://localhost:3002",
    }); // Creates fake browser request client

    const response = await apiContext.post("/api/auth", {
      data: JSON.stringify({ password: "123" }), // sends password: 123 to your login API
      headers: {
        "Content-Type": "application/json",
      },
    });// login request

    if (!response.ok()) { // if login breaks, tests stops immediately 
      const responseBody = await response.text();
      console.error("Authentication failed response body:", responseBody);
      throw new Error(
        `Authentication failed with status ${response.status()}: ${responseBody}`,
      );
    }

    await apiContext.storageState({ path: authFile }); // save login state(this saves cookie: auth_token into .auth/user.json)
  },
);
