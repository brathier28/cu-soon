import { clerkSetup } from "@clerk/testing/playwright";
import { test as setup } from "@playwright/test";
import dotenv from "dotenv";

dotenv.config();

setup("global setup", async () => {
  await clerkSetup({
    frontendApiUrl: process.env.VITE_CLERK_FRONTEND_API_URL, 
  });
});