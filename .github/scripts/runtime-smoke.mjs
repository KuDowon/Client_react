import { mkdir } from "node:fs/promises";
import puppeteer from "puppeteer";

const cases = [
  {
    name: "home-mobile",
    path: "/",
    viewport: { width: 390, height: 844 },
    expectedText: "필요한 책을 쉽고 빠르게 찾아보세요.",
    navigation: "mobile",
  },
  {
    name: "home-tablet",
    path: "/",
    viewport: { width: 768, height: 1024 },
    expectedText: "필요한 책을 쉽고 빠르게 찾아보세요.",
    navigation: "desktop",
  },
  {
    name: "home-desktop",
    path: "/",
    viewport: { width: 1200, height: 900 },
    expectedText: "필요한 책을 쉽고 빠르게 찾아보세요.",
    navigation: "desktop",
  },
  {
    name: "login-mobile",
    path: "/LoginPage",
    viewport: { width: 390, height: 844 },
    expectedText: "문중문고의 대출·예약 서비스를 이용하려면 로그인해주세요.",
  },
  {
    name: "loan-choice-mobile",
    path: "/LoanChoice",
    viewport: { width: 390, height: 844 },
    expectedText: "무엇을 하시겠어요?",
    navigation: "mobile",
  },
  {
    name: "guide-mobile",
    path: "/GuidePage",
    viewport: { width: 390, height: 844 },
    expectedText: "문중문고 이용안내",
    navigation: "mobile",
  },
];

await mkdir("smoke-artifacts", { recursive: true });

const browser = await puppeteer.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
});

const failures = [];

try {
  for (const testCase of cases) {
    const page = await browser.newPage();
    const runtimeErrors = [];

    page.on("pageerror", (error) => {
      runtimeErrors.push(`pageerror: ${error.message}`);
    });

    page.on("console", (message) => {
      if (message.type() === "error") {
        const text = message.text();
        if (!text.includes("Failed to load resource")) {
          runtimeErrors.push(`console.error: ${text}`);
        }
      }
    });

    await page.setViewport(testCase.viewport);
    const response = await page.goto(`http://127.0.0.1:4173${testCase.path}`, {
      waitUntil: "domcontentloaded",
      timeout: 15000,
    });

    if (!response || !response.ok()) {
      failures.push(`${testCase.name}: HTTP response was not OK`);
    }

    try {
      await page.waitForFunction(
        (expected) => document.body?.innerText?.includes(expected),
        { timeout: 7000 },
        testCase.expectedText
      );
    } catch {
      failures.push(
        `${testCase.name}: expected text not rendered: ${testCase.expectedText}`
      );
    }

    const metrics = await page.evaluate(() => {
      const root = document.documentElement;
      const bottomNav = document.querySelector(".app-bottom-nav");
      const desktopNav = document.querySelector(".app-header__desktop-nav");
      return {
        innerWidth: window.innerWidth,
        scrollWidth: root.scrollWidth,
        bottomNavDisplay: bottomNav ? getComputedStyle(bottomNav).display : null,
        desktopNavDisplay: desktopNav ? getComputedStyle(desktopNav).display : null,
      };
    });

    if (metrics.scrollWidth > metrics.innerWidth + 1) {
      failures.push(
        `${testCase.name}: horizontal overflow ${metrics.scrollWidth}px > ${metrics.innerWidth}px`
      );
    }

    if (testCase.navigation === "mobile") {
      if (!metrics.bottomNavDisplay || metrics.bottomNavDisplay === "none") {
        failures.push(`${testCase.name}: mobile bottom navigation is not visible`);
      }
      if (metrics.desktopNavDisplay && metrics.desktopNavDisplay !== "none") {
        failures.push(`${testCase.name}: desktop navigation is visible on mobile`);
      }
    }

    if (testCase.navigation === "desktop") {
      if (metrics.bottomNavDisplay && metrics.bottomNavDisplay !== "none") {
        failures.push(`${testCase.name}: mobile bottom navigation is visible on desktop/tablet`);
      }
      if (!metrics.desktopNavDisplay || metrics.desktopNavDisplay === "none") {
        failures.push(`${testCase.name}: desktop navigation is not visible`);
      }
    }

    if (runtimeErrors.length) {
      failures.push(`${testCase.name}: ${runtimeErrors.join(" | ")}`);
    }

    await page.screenshot({
      path: `smoke-artifacts/${testCase.name}.png`,
      fullPage: true,
    });

    console.log(
      `PASS candidate: ${testCase.name} (${metrics.innerWidth}px / scroll ${metrics.scrollWidth}px)`
    );
    await page.close();
  }
} finally {
  await browser.close();
}

if (failures.length) {
  console.error("\nRuntime smoke failures:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("\nAll browser runtime smoke checks passed.");
