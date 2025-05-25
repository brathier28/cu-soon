import { expect, test } from "@playwright/test";
import { clearUser } from "../../src/utils/api";
import { setupClerkTestingToken, clerk } from "@clerk/testing/playwright";
import { clerkSetup } from "@clerk/testing/playwright"

import dotenv from "dotenv"; 

dotenv.config();

const SPOOF_UID = "mock-user-id";

test.beforeEach(async ({ context, page }) => {
  await context.addCookies([
    {
      name: "uid",
      value: SPOOF_UID,
      url: "http://localhost:8000",
    },
  ]);
  await clearUser(SPOOF_UID);

  await clerkSetup({
    frontendApiUrl: process.env.VITE_CLERK_FRONTEND_API,
  });
  
  setupClerkTestingToken({ page });
  await page.goto("http://localhost:8000/");
  await clerk.loaded({ page });

  // maybe extra
  const loginButton = page.getByRole("button", { name: "sign in" });
  await expect(loginButton).toBeVisible;

  await clerk.signIn({
    page,
    signInParams: {
      strategy: "password",
      password: process.env.E2E_CLERK_USER_PASSWORD!,
      identifier: process.env.E2E_CLERK_USER_USERNAME!,
    },
  });
  await expect(page.getByLabel("Mapview Title")).toBeVisible();
});

test("on page load, I see a welcome message", async ({ page }) => {
  await expect(page.getByRole("heading", { name: "Welcome to CU soon" })).toBeVisible();
});

test("on page load, I see a dashboard and about button", async ({ page }) => {
  await expect(
    page.getByRole("heading", { name: "Welcome to CU soon" })
  ).toBeVisible();


  await page.getByRole("button", { name: "Sign in" }).click();
  await page.getByRole("textbox", { name: "Email address" }).click();
  await page.getByRole("textbox", { name: "Email address" }).fill("cusoontest@gmail.com");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("textbox", { name: "Password" }).fill("cusoontest");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("heading", { name: "CU Soon" }).click();
  await expect(page.getByText("A smarter way to schedule")).toBeVisible()
  await expect(page.getByRole("button", { name: "Go to Dashboard" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Go to About" })).toBeVisible();
  await page.getByRole("button", { name: "Go to Dashboard" }).click();
  await expect(page.getByText("Welcome to your dashboard.")).toBeVisible;
});

test("on create event, can see participant get added ", async ({ page }) => {
  await expect(page.getByText("A smarter way to schedule")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Go to Dashboard" })
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Go to About" })).toBeVisible();
  await page.getByRole("button", { name: "Go to Dashboard" }).click();
  await expect(page.getByText("Welcome to your dashboard.")).toBeVisible;

  await expect(page.getByRole("button", { name: "+ Create New Event" })).toBeVisible();
  await page.getByRole("button", { name: "+ Create New Event" }).click();
  await page.locator('input[type="text"]').click();
  await page.locator('input[type="text"]').fill("test");
  await page.getByRole("textbox", { name: "Participant Email" }).click();
  await page
    .getByRole("textbox", { name: "Participant Email" })
    .fill("msmithstern@gmail.com");
  await page.getByRole("combobox").selectOption("3");
  await page.getByRole("button", { name: "Add Participant" }).click();
  await expect(page.getByText("msmithstern@gmail.com (")).toBeVisible();
});

test("on create event, cannnot add days in past", async ({ page }) => {
  await expect(page.getByText("A smarter way to schedule")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Go to Dashboard" })
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Go to About" })).toBeVisible();
  await page.getByRole("button", { name: "Go to Dashboard" }).click();
  await expect(page.getByText("Welcome to your dashboard.")).toBeVisible;

  await expect(
    page.getByRole("button", { name: "+ Create New Event" })
  ).toBeVisible();
  await page.getByRole("button", { name: "+ Create New Event" }).click();
  await page.locator('input[type="text"]').click();
  await page.locator('input[type="text"]').fill("test");
  await page.getByRole("textbox", { name: "Participant Email" }).click();
  await page
    .getByRole("textbox", { name: "Participant Email" })
    .fill("msmithstern@gmail.com");
  await page.getByRole("combobox").selectOption("3");
  await page.getByRole("button", { name: "Add Participant" }).click();
  await expect(page.getByText("msmithstern@gmail.com (")).toBeVisible();

  await page.getByRole("button", { name: "Next: Set Date and Time" }).click();
  await page.getByRole("button", { name: "May 15," }).click();
  await page.getByRole("button", { name: "May 23," }).click();
  await page.getByRole("button", { name: "May 24," }).click();
});
  
test("on create event, can add days in the future ", async ({ page }) => {
  await expect(page.getByText("A smarter way to schedule")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Go to Dashboard" })
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Go to About" })).toBeVisible();
  await page.getByRole("button", { name: "Go to Dashboard" }).click();
  await expect(page.getByText("Welcome to your dashboard.")).toBeVisible;

  await expect(
    page.getByRole("button", { name: "+ Create New Event" })
  ).toBeVisible();
  await page.getByRole("button", { name: "+ Create New Event" }).click();
  await page.locator('input[type="text"]').click();
  await page.locator('input[type="text"]').fill("test");
  await page.getByRole("textbox", { name: "Participant Email" }).click();
  await page
    .getByRole("textbox", { name: "Participant Email" })
    .fill("msmithstern@gmail.com");
  await page.getByRole("combobox").selectOption("3");
  await page.getByRole("button", { name: "Add Participant" }).click();
  await expect(page.getByText("msmithstern@gmail.com (")).toBeVisible();

  await page.getByRole("button", { name: "Next: Set Date and Time" }).click();
  await page.getByRole("button", { name: "May 15," }).click();
  await page.getByRole("button", { name: "May 23," }).click();
  await page.getByRole("button", { name: "May 24," }).click();
});


test("once event is created organizer has availability entered", async ({ page }) => {

  await expect(page.getByText("A smarter way to schedule")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Go to Dashboard" })
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Go to About" })).toBeVisible();
  await page.getByRole("button", { name: "Go to Dashboard" }).click();
  await expect(page.getByText("Welcome to your dashboard.")).toBeVisible;

  await expect(
    page.getByRole("button", { name: "+ Create New Event" })
  ).toBeVisible();
  await page.getByRole("button", { name: "+ Create New Event" }).click();
  await page.locator('input[type="text"]').click();
  await page.locator('input[type="text"]').fill("test");
  await page.getByRole("textbox", { name: "Participant Email" }).click();
  await page
    .getByRole("textbox", { name: "Participant Email" })
    .fill("msmithstern@gmail.com");
  await page.getByRole("combobox").selectOption("3");
  await page.getByRole("button", { name: "Add Participant" }).click();
  await expect(page.getByText("msmithstern@gmail.com (")).toBeVisible();

  await page.getByRole("button", { name: "Next: Set Date and Time" }).click();
  await page.getByRole("button", { name: "May 15," }).click();
  await page.getByRole("button", { name: "May 23," }).click();
  await page.getByRole("button", { name: "May 24," }).click();
 
  await page.getByRole("button", { name: "Create event and continue" }).click();
  await expect(page.getByRole("button", { name: "Create event and continue" })).toBeVisible();

  await expect(page.getByRole("heading", { name: "Enter Your Availability" })).toBeVisible();
  await page.getByText("Use the form below to enter").click();
  await page.getByRole("textbox").first().click();
  await page.getByRole("textbox").first().fill("10:00");
  await page.getByRole("textbox").nth(1).click();
  await page.getByRole("textbox").nth(1).fill("11:00");
  await page
    .locator("div")
    .filter({ hasText: /^PreferredAvailableOnly if necessaryAdd Time$/ })
    .getByRole("combobox")
    .selectOption("5");
  await page.getByRole("button", { name: "Add Time" }).click();
  await page.getByText(":00 – 11:00 (Preferred)").click();
  await expect(page.getByRole("paragraph").filter({ hasText: "-05-15" })).toBeVisible();
});

test("once event is created and availability filled out I can see the calendar with opimize option ", async ({
  page,
}) => {
  await expect(page.getByText("A smarter way to schedule")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Go to Dashboard" })
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Go to About" })).toBeVisible();
  await page.getByRole("button", { name: "Go to Dashboard" }).click();
  await expect(page.getByText("Welcome to your dashboard.")).toBeVisible;

  await expect(
    page.getByRole("button", { name: "+ Create New Event" })
  ).toBeVisible();
  await page.getByRole("button", { name: "+ Create New Event" }).click();
  await page.locator('input[type="text"]').click();
  await page.locator('input[type="text"]').fill("test");
  await page.getByRole("textbox", { name: "Participant Email" }).click();
  await page
    .getByRole("textbox", { name: "Participant Email" })
    .fill("msmithstern@gmail.com");
  await page.getByRole("combobox").selectOption("3");
  await page.getByRole("button", { name: "Add Participant" }).click();
  await expect(page.getByText("msmithstern@gmail.com (")).toBeVisible();

  await page.getByRole("button", { name: "Next: Set Date and Time" }).click();
  await page.getByRole("button", { name: "May 15," }).click();
  await page.getByRole("button", { name: "May 23," }).click();
  await page.getByRole("button", { name: "May 24," }).click();

  await page.getByRole("button", { name: "Create event and continue" }).click();
  await expect(
    page.getByRole("button", { name: "Create event and continue" })
  ).toBeVisible();

  await expect(
    page.getByRole("heading", { name: "Enter Your Availability" })
  ).toBeVisible();
  await page.getByText("Use the form below to enter").click();
  await page.getByRole("textbox").first().click();
  await page.getByRole("textbox").first().fill("10:00");
  await page.getByRole("textbox").nth(1).click();
  await page.getByRole("textbox").nth(1).fill("11:00");
  await page
    .locator("div")
    .filter({ hasText: /^PreferredAvailableOnly if necessaryAdd Time$/ })
    .getByRole("combobox")
    .selectOption("5");
  await page.getByRole("button", { name: "Add Time" }).click();
  await page.getByText(":00 – 11:00 (Preferred)").click();
  await expect(
    page.getByRole("paragraph").filter({ hasText: "-05-15" })
  ).toBeVisible();

  await page.getByRole("button", { name: "Submit Availability" }).click();
  await expect (page.getByRole("heading", { name: "Participants:" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "test" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Availability Calendar" })).toBeVisible();
  await page.getByRole("button", { name: "Optimize" }).click();
  await expect (page.getByRole("heading", { name: "Ranking: 1" })).toBeVisible();
  await expect(page.getByText("Time: Thu, May 15, 2025, 10:00 AM – 10:15 AM")).toBeVisible();
  await expect(page.getByText("Score:").first()).toBeVisible();
});

test("once event is optimized i can do to dashboard and return to event", async ({
  page,
}) => {
  await expect(page.getByText("A smarter way to schedule")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Go to Dashboard" })
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Go to About" })).toBeVisible();
  await page.getByRole("button", { name: "Go to Dashboard" }).click();
  await expect(page.getByText("Welcome to your dashboard.")).toBeVisible;

  await expect(
    page.getByRole("button", { name: "+ Create New Event" })
  ).toBeVisible();
  await page.getByRole("button", { name: "+ Create New Event" }).click();
  await page.locator('input[type="text"]').click();
  await page.locator('input[type="text"]').fill("test");
  await page.getByRole("textbox", { name: "Participant Email" }).click();
  await page
    .getByRole("textbox", { name: "Participant Email" })
    .fill("msmithstern@gmail.com");
  await page.getByRole("combobox").selectOption("3");
  await page.getByRole("button", { name: "Add Participant" }).click();
  await expect(page.getByText("msmithstern@gmail.com (")).toBeVisible();

  await page.getByRole("button", { name: "Next: Set Date and Time" }).click();
  await page.getByRole("button", { name: "May 15," }).click();
  await page.getByRole("button", { name: "May 23," }).click();
  await page.getByRole("button", { name: "May 24," }).click();

  await page.getByRole("button", { name: "Create event and continue" }).click();
  await expect(
    page.getByRole("button", { name: "Create event and continue" })
  ).toBeVisible();

  await expect(
    page.getByRole("heading", { name: "Enter Your Availability" })
  ).toBeVisible();
  await page.getByText("Use the form below to enter").click();
  await page.getByRole("textbox").first().click();
  await page.getByRole("textbox").first().fill("10:00");
  await page.getByRole("textbox").nth(1).click();
  await page.getByRole("textbox").nth(1).fill("11:00");
  await page
    .locator("div")
    .filter({ hasText: /^PreferredAvailableOnly if necessaryAdd Time$/ })
    .getByRole("combobox")
    .selectOption("5");
  await page.getByRole("button", { name: "Add Time" }).click();
  await page.getByText(":00 – 11:00 (Preferred)").click();
  await expect(
    page.getByRole("paragraph").filter({ hasText: "-05-15" })
  ).toBeVisible();

  await page.getByRole("button", { name: "Submit Availability" }).click();
  await expect(
    page.getByRole("heading", { name: "Participants:" })
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "test" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Availability Calendar" })
  ).toBeVisible();
  await page.getByRole("button", { name: "Optimize" }).click();
  await expect(page.getByRole("heading", { name: "Ranking: 1" })).toBeVisible();
  await expect(
    page.getByText("Time: Thu, May 15, 2025, 10:00 AM – 10:15 AM")
  ).toBeVisible();
  await expect(page.getByText("Score:").first()).toBeVisible();
  await page.getByRole("button", { name: "Back to Dashboard" }).click();
  await page.getByText("testDelete Event").click();
  await expect(
    page.getByRole("heading", { name: "Participants:" })
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "test" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Availability Calendar" })
  ).toBeVisible();
});



//_________________ ERROR CHECKING BELOW ___________________

test("error check on create event , cannot create event not in 15 min increments", async ({ page }) => {
  await expect(page.getByText("A smarter way to schedule")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Go to Dashboard" })
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Go to About" })).toBeVisible();
  await page.getByRole("button", { name: "Go to Dashboard" }).click();
  await expect(page.getByText("Welcome to your dashboard.")).toBeVisible;

  await expect(
    page.getByRole("button", { name: "+ Create New Event" })
  ).toBeVisible();
  await page.getByRole("button", { name: "+ Create New Event" }).click();
  await page.locator('input[type="text"]').click();
  await page.locator('input[type="text"]').fill("test");
  await page.getByRole("textbox", { name: "Participant Email" }).click();
  await page
    .getByRole("textbox", { name: "Participant Email" })
    .fill("msmithstern@gmail.com");
  await page.getByRole("combobox").selectOption("3");
  await page.getByRole("button", { name: "Add Participant" }).click();
  await expect(page.getByText("msmithstern@gmail.com (")).toBeVisible();

  await page.getByRole("button", { name: "Next: Set Date and Time" }).click();
  await page.getByRole("button", { name: "May 15," }).click();
  await page.getByRole("button", { name: "May 23," }).click();
  await page.getByRole("button", { name: "May 24," }).click();
  await page
    .getByRole("textbox", { name: "Start of availability range" })
    .click();
  await page
    .getByRole("textbox", { name: "Start of availability range" })
    .click();
  await page
    .getByRole("textbox", { name: "Start of availability range" })
    .fill("09:05");
  await page
    .getByRole("textbox", { name: "Start of availability range" })
    .press("Enter");
  await page.getByRole("button", { name: "Create event and continue" }).click();
  await expect(page.getByText("Time must be in 15-minute")).toBeVisible();
});

test("on entering availability I cannot add times not in 15 min increments", async ({
  page,
}) => {
  await expect(page.getByText("A smarter way to schedule")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Go to Dashboard" })
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Go to About" })).toBeVisible();
  await page.getByRole("button", { name: "Go to Dashboard" }).click();
  await expect(page.getByText("Welcome to your dashboard.")).toBeVisible;

  await expect(
    page.getByRole("button", { name: "+ Create New Event" })
  ).toBeVisible();
  await page.getByRole("button", { name: "+ Create New Event" }).click();
  await page.locator('input[type="text"]').click();
  await page.locator('input[type="text"]').fill("test");
  await page.getByRole("textbox", { name: "Participant Email" }).click();
  await page
    .getByRole("textbox", { name: "Participant Email" })
    .fill("msmithstern@gmail.com");
  await page.getByRole("combobox").selectOption("3");
  await page.getByRole("button", { name: "Add Participant" }).click();
  await expect(page.getByText("msmithstern@gmail.com (")).toBeVisible();

  await page.getByRole("button", { name: "Next: Set Date and Time" }).click();
  await page.getByRole("button", { name: "May 15," }).click();
  await page.getByRole("button", { name: "May 23," }).click();
  await page.getByRole("button", { name: "May 24," }).click();

  await page.getByRole("button", { name: "Create event and continue" }).click();
  await expect(
    page.getByRole("button", { name: "Create event and continue" })
  ).toBeVisible();

  await expect(
    page.getByRole("heading", { name: "Enter Your Availability" })
  ).toBeVisible();
  await page.getByText("Use the form below to enter").click();
  await page.getByRole("textbox").first().click();
  await page.getByRole("textbox").first().fill("10:00");
  await page.getByRole("textbox").nth(1).click();
  await page.getByRole("textbox").nth(1).fill("11:00");
  await page
    .locator("div")
    .filter({ hasText: /^PreferredAvailableOnly if necessaryAdd Time$/ })
    .getByRole("combobox")
    .selectOption("5");
  await page.getByRole("button", { name: "Add Time" }).click();
  await page.getByText(":00 – 11:00 (Preferred)").click();
  await expect(
    page.getByRole("paragraph").filter({ hasText: "-05-15" })
  ).toBeVisible();

  await page.goto(
    "http://localhost:8000/event/AXTm1stGRdkUrQRcPSp7/input-availability"
  );
  await page.getByRole("textbox").first().click();
  await page.getByRole("textbox").first().fill("19:09");
  await page.getByRole("textbox").nth(1).click();
  await page.getByRole("textbox").nth(1).press("Tab");
  await page.getByRole("textbox").nth(1).fill("22:00");
  await page
    .locator("div")
    .filter({ hasText: /^PreferredAvailableOnly if necessaryAdd Time$/ })
    .getByRole("combobox")
    .selectOption("5");
  await page.getByRole("button", { name: "Add Time" }).click();
  await expect (page.getByText("Time must be between 09:00")).toBeVisible();
});


