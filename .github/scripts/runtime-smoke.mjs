import { mkdir } from "node:fs/promises";
import puppeteer from "puppeteer";

const LONG_BOOK_TITLE = "반응형 테스트를 위한 아주 긴 도서 제목이 두 줄 이상이어도 레이아웃이 무너지지 않아야 합니다";

const cases = [
  { name: "home-390", path: "/", viewport: { width: 390, height: 844 }, expectedText: "필요한 책을 쉽고 빠르게 찾아보세요.", navigation: "bottom" },
  { name: "home-768", path: "/", viewport: { width: 768, height: 1024 }, expectedText: "필요한 책을 쉽고 빠르게 찾아보세요.", navigation: "bottom" },
  { name: "home-820", path: "/", viewport: { width: 820, height: 1180 }, expectedText: "필요한 책을 쉽고 빠르게 찾아보세요.", navigation: "bottom" },
  { name: "home-1024", path: "/", viewport: { width: 1024, height: 768 }, expectedText: "필요한 책을 쉽고 빠르게 찾아보세요.", navigation: "bottom" },
  { name: "home-1200", path: "/", viewport: { width: 1200, height: 900 }, expectedText: "필요한 책을 쉽고 빠르게 찾아보세요.", navigation: "bottom" },
  { name: "home-1366", path: "/", viewport: { width: 1366, height: 768 }, expectedText: "필요한 책을 쉽고 빠르게 찾아보세요.", navigation: "bottom" },
  { name: "home-1440", path: "/", viewport: { width: 1440, height: 900 }, expectedText: "필요한 책을 쉽고 빠르게 찾아보세요.", navigation: "bottom" },

  { name: "search-filter-390", path: "/search", viewport: { width: 390, height: 844 }, expectedText: "검색어를 입력해주세요.", navigation: "bottom", filter: true },
  { name: "search-filter-1024", path: "/search", viewport: { width: 1024, height: 768 }, expectedText: "검색어를 입력해주세요.", navigation: "bottom", filter: true },
  { name: "search-data-390", path: "/search?query=qa", viewport: { width: 390, height: 844 }, expectedText: LONG_BOOK_TITLE, navigation: "bottom", filter: true, mockSearch: true },
  { name: "search-data-1024", path: "/search?query=qa", viewport: { width: 1024, height: 768 }, expectedText: LONG_BOOK_TITLE, navigation: "bottom", filter: true, mockSearch: true },

  { name: "book-data-390", path: "/BookPage/1", viewport: { width: 390, height: 844 }, expectedText: LONG_BOOK_TITLE, navigation: "bottom", mockBook: true },
  { name: "book-data-820", path: "/BookPage/1", viewport: { width: 820, height: 1180 }, expectedText: LONG_BOOK_TITLE, navigation: "bottom", mockBook: true },
  { name: "book-data-1024", path: "/BookPage/1", viewport: { width: 1024, height: 768 }, expectedText: LONG_BOOK_TITLE, navigation: "bottom", mockBook: true },

  { name: "my-data-390", path: "/MyPage", viewport: { width: 390, height: 844 }, expectedText: "테스트 사용자", navigation: "bottom", mockMyPage: true, expectedWithdrawal: true },
  { name: "my-data-820", path: "/MyPage", viewport: { width: 820, height: 1180 }, expectedText: "테스트 사용자", navigation: "bottom", mockMyPage: true, expectedWithdrawal: true },
  { name: "my-data-1024", path: "/MyPage", viewport: { width: 1024, height: 768 }, expectedText: "테스트 사용자", navigation: "bottom", mockMyPage: true, expectedWithdrawal: true },

  { name: "loan-choice-1024", path: "/LoanChoice", viewport: { width: 1024, height: 768 }, expectedText: "무엇을 하시겠어요?", navigation: "bottom" },
  { name: "borrow-empty-820", path: "/CurrentBorrow", viewport: { width: 820, height: 1180 }, expectedText: "대출 중인 도서가 없어요.", navigation: "bottom" },
  { name: "reserve-empty-1024", path: "/CurrentReserve", viewport: { width: 1024, height: 768 }, expectedText: "현재 예약 중인 도서가 없어요.", navigation: "bottom" },
  { name: "overdue-empty-1366", path: "/CurrentOverdue", viewport: { width: 1366, height: 768 }, expectedText: "연체 중인 도서가 없어요.", navigation: "bottom" },
  { name: "overdue-from-home-820", path: "/CurrentOverdue", viewport: { width: 820, height: 1180 }, expectedText: "연체 중인 도서가 없어요.", navigation: "bottom", entryFrom: "/", expectedBackTo: "/", expectedActiveNav: "홈" },
  { name: "overdue-from-my-820", path: "/CurrentOverdue", viewport: { width: 820, height: 1180 }, expectedText: "연체 중인 도서가 없어요.", navigation: "bottom", entryFrom: "/MyPage", expectedBackTo: "/MyPage", expectedActiveNav: "마이" },
  { name: "guide-1440", path: "/GuidePage", viewport: { width: 1440, height: 900 }, expectedText: "문중문고 이용안내", navigation: "bottom" },
  { name: "curation-1024", path: "/CurationPage", viewport: { width: 1024, height: 768 }, expectedText: "수업과 관심사에 맞는 도서를 둘러보세요.", navigation: "bottom" },

  { name: "login-390", path: "/LoginPage", viewport: { width: 390, height: 844 }, expectedText: "문중문고의 대출·예약 서비스를 이용하려면 로그인해주세요." },
  { name: "signup-390", path: "/SignUp", viewport: { width: 390, height: 844 }, expectedText: "문중문고 이용을 위한 기본 정보를 입력해주세요." },
  { name: "find-id-390", path: "/FindId", viewport: { width: 390, height: 844 }, expectedText: "가입할 때 입력한 이름과 전화번호를 확인해주세요." },
  { name: "reset-password-390", path: "/ResetPassword", viewport: { width: 390, height: 844 }, expectedText: "현재 비밀번호 변경 기능은 관리자 확인을 통해 진행돼요." },
];

const mockSearchBooks = [
  {
    id: 1,
    title: LONG_BOOK_TITLE,
    author: "테스트 저자 이름이 길어져도 안전하게 표시됩니다",
    publisher: "테스트 출판사",
    book_code: "MJ123456",
    image_url: "",
    liked: false,
    book_status: "AVAILABLE",
    popularity: 90,
    location: "문중문고 테스트 서가 A-01",
  },
  {
    id: 2,
    title: "대출 중인 테스트 도서",
    author: "두 번째 저자",
    publisher: "테스트 출판사",
    book_code: "MJ123457",
    image_url: "",
    liked: true,
    book_status: "RENTED",
    popularity: 80,
    location: "문중문고 테스트 서가 A-02",
  },
  {
    id: 3,
    title: "현재 대출이 불가능한 테스트 도서",
    author: "세 번째 저자",
    publisher: "테스트 출판사",
    book_code: "MJ123458",
    image_url: "",
    liked: false,
    book_status: "UNAVAILABLE",
    popularity: 70,
    location: "문중문고 테스트 서가 A-03",
  },
];

const mockBookDetail = {
  id: 1,
  title: LONG_BOOK_TITLE,
  author: "테스트 저자 이름이 길어져도 안전하게 표시됩니다",
  publisher: "테스트 출판사",
  edition: "제2판",
  physical: "320 p. ; 23 cm",
  call_number: "020.123-테57ㅂ",
  status: "AVAILABLE",
  series: "문중문고 반응형 QA 시리즈",
  details: "태블릿과 노트북에서도 상세 정보가 읽기 좋은 폭과 간격으로 표시되는지 확인하기 위한 설명입니다.",
  notes: "QA mock data",
  image_url: "",
  book_code: "MJ123456",
  liked: false,
};

const mockReviews = [
  {
    id: 1,
    user_username: "테스터",
    created_at: "2026-09-24T12:00:00Z",
    content: "긴 화면에서도 리뷰 영역의 읽기 폭과 간격이 유지되는지 확인합니다.",
  },
];

const mockMyPage = {
  id: 1,
  username: "qa_user",
  user_type: "재학생",
  name: "테스트 사용자",
  phone: "01012345678",
};

function jsonResponse(request, body) {
  return request.respond({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify(body),
  });
}

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

    page.on("pageerror", (error) => runtimeErrors.push(`pageerror: ${error.message}`));
    page.on("console", (message) => {
      if (message.type() === "error") {
        const messageText = message.text();
        if (!messageText.includes("Failed to load resource")) {
          runtimeErrors.push(`console.error: ${messageText}`);
        }
      }
    });

    if (testCase.mockSearch || testCase.mockBook || testCase.mockMyPage) {
      await page.setRequestInterception(true);
      page.on("request", async (request) => {
        const url = request.url();

        if (testCase.mockSearch && url.includes("/books/") && url.includes("search=qa")) {
          await jsonResponse(request, mockSearchBooks);
          return;
        }

        if (testCase.mockBook && url.endsWith("/books/1/")) {
          await jsonResponse(request, mockBookDetail);
          return;
        }

        if (testCase.mockBook && url.includes("/reviews/?bookId=1")) {
          await jsonResponse(request, mockReviews);
          return;
        }

        if (testCase.mockMyPage && url.includes("/users/mypage/")) {
          await jsonResponse(request, mockMyPage);
          return;
        }

        await request.continue();
      });
    }

    await page.setViewport(testCase.viewport);

    if (testCase.entryFrom || testCase.mockMyPage) {
      await page.evaluateOnNewDocument((entryFrom, seedMyPage) => {
        if (entryFrom) {
          window.history.replaceState({ usr: { from: entryFrom }, key: "qa-entry", idx: 0 }, "", window.location.href);
        }
        if (seedMyPage) {
          window.localStorage.setItem("accessToken", "qa-access-token");
          window.localStorage.setItem("userID", "테스트 사용자");
          window.localStorage.setItem("borrowCount", "2");
          window.localStorage.setItem("reserveCount", "1");
          window.localStorage.setItem("overdueCount", "1");
        }
      }, testCase.entryFrom || null, Boolean(testCase.mockMyPage));
    }

    const response = await page.goto(`http://127.0.0.1:4173${testCase.path}`, {
      waitUntil: "domcontentloaded",
      timeout: 15000,
    });

    if (!response || response.status() >= 400) {
      failures.push(
        `${testCase.name}: HTTP response failed with status ${response?.status() ?? "unknown"}`
      );
    }

    try {
      await page.waitForFunction(
        (expected) => document.body?.innerText?.includes(expected),
        { timeout: 7000 },
        testCase.expectedText
      );
    } catch {
      failures.push(`${testCase.name}: expected text not rendered: ${testCase.expectedText}`);
    }

    if (testCase.expectedBackTo) {
      const backHref = await page.$eval(".app-header .ui-icon-button", (node) => node.getAttribute("href")).catch(() => null);
      if (backHref !== testCase.expectedBackTo) {
        failures.push(`${testCase.name}: back link expected ${testCase.expectedBackTo} but got ${backHref}`);
      }
    }

    if (testCase.expectedActiveNav) {
      const activeNav = await page.$eval('.app-bottom-nav__item[aria-current="page"] span', (node) => node.textContent.trim()).catch(() => null);
      if (activeNav !== testCase.expectedActiveNav) {
        failures.push(`${testCase.name}: active navigation expected ${testCase.expectedActiveNav} but got ${activeNav}`);
      }
    }

    if (testCase.expectedWithdrawal) {
      const withdrawal = await page.evaluate(() => {
        const anchor = [...document.querySelectorAll("a")].find((node) => node.textContent.includes("회원 탈퇴 문의"));
        return anchor ? { text: anchor.textContent.trim(), href: anchor.href } : null;
      });
      if (!withdrawal || !withdrawal.href.includes("pf.kakao.com")) {
        failures.push(`${testCase.name}: withdrawal inquiry entry is missing or points to the wrong channel`);
      }
    }

    if (testCase.filter) {
      try {
        await page.click(".ui-filter-select__trigger");
        await page.waitForSelector('.ui-filter-select__menu[role="listbox"]', { visible: true, timeout: 3000 });
        const filterState = await page.evaluate(() => ({
          optionLabels: [...document.querySelectorAll(".ui-filter-select__option")].map((node) => node.textContent.trim()),
          selected: document.querySelector('.ui-filter-select__option[aria-selected="true"]')?.textContent.trim() || null,
        }));
        if (!filterState.optionLabels.some((label) => label.includes("제목순")) ||
            !filterState.optionLabels.some((label) => label.includes("인기순"))) {
          failures.push(`${testCase.name}: filter choices are incomplete`);
        }
        if (!filterState.selected?.includes("제목순")) {
          failures.push(`${testCase.name}: selected filter choice is not clearly represented`);
        }
      } catch (error) {
        failures.push(`${testCase.name}: filter interaction failed: ${error.message}`);
      }
    }

    const metrics = await page.evaluate(() => {
      const root = document.documentElement;
      const bottomNav = document.querySelector(".app-bottom-nav");
      const bottomInner = document.querySelector(".app-bottom-nav__inner");
      const navRect = bottomNav?.getBoundingClientRect();
      const innerRect = bottomInner?.getBoundingClientRect();
      return {
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
        scrollWidth: root.scrollWidth,
        bottomNavDisplay: bottomNav ? getComputedStyle(bottomNav).display : null,
        bottomNavPosition: bottomNav ? getComputedStyle(bottomNav).position : null,
        navBottom: navRect?.bottom ?? null,
        innerNavWidth: innerRect?.width ?? null,
        innerNavLeft: innerRect?.left ?? null,
        innerNavRight: innerRect ? window.innerWidth - innerRect.right : null,
        staleDesktopNavCount: document.querySelectorAll(".app-header__desktop-nav").length,
      };
    });

    if (metrics.scrollWidth > metrics.innerWidth + 1) {
      failures.push(
        `${testCase.name}: horizontal overflow ${metrics.scrollWidth}px > ${metrics.innerWidth}px`
      );
    }

    if (testCase.navigation === "bottom") {
      if (!metrics.bottomNavDisplay || metrics.bottomNavDisplay === "none") {
        failures.push(`${testCase.name}: bottom navigation is not visible`);
      }
      if (metrics.bottomNavPosition !== "fixed") {
        failures.push(`${testCase.name}: bottom navigation is not fixed`);
      }
      if (metrics.navBottom !== null && Math.abs(metrics.navBottom - metrics.innerHeight) > 1) {
        failures.push(
          `${testCase.name}: bottom navigation is not anchored to viewport bottom (${metrics.navBottom} vs ${metrics.innerHeight})`
        );
      }
      if (metrics.innerNavWidth !== null && metrics.innerNavWidth > 521) {
        failures.push(`${testCase.name}: wide-screen navigation group exceeds 520px cap`);
      }
      if (metrics.innerWidth >= 768 && metrics.innerNavLeft !== null && metrics.innerNavRight !== null &&
          Math.abs(metrics.innerNavLeft - metrics.innerNavRight) > 2) {
        failures.push(`${testCase.name}: wide-screen navigation group is not centered`);
      }
      if (metrics.staleDesktopNavCount > 0) {
        failures.push(`${testCase.name}: stale desktop header navigation is still rendered`);
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
      `PASS candidate: ${testCase.name} (${metrics.innerWidth}px / scroll ${metrics.scrollWidth}px / nav ${metrics.bottomNavPosition || "none"})`
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

console.log("\nAll responsive browser smoke checks passed.");
