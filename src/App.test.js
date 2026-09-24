import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "./App";

function renderAt(path) {
  window.localStorage.clear();
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>
  );
}

test("renders the redesigned home route", () => {
  renderAt("/");
  expect(screen.getByRole("heading", { name: /필요한 책을 쉽고 빠르게 찾아보세요/ })).toBeTruthy();
  expect(screen.getByRole("navigation", { name: "주요 메뉴" })).toBeTruthy();
});

test("renders the login route", () => {
  renderAt("/LoginPage");
  expect(screen.getByRole("heading", { name: "로그인" })).toBeTruthy();
  expect(screen.getByRole("button", { name: "로그인" })).toBeTruthy();
});

test("renders the loan choice route", () => {
  renderAt("/LoanChoice");
  expect(screen.getByRole("heading", { name: "무엇을 하시겠어요?" })).toBeTruthy();
  expect(screen.getByRole("link", { name: /대출하기/ })).toBeTruthy();
  expect(screen.getByRole("link", { name: /반납하기/ })).toBeTruthy();
});

test("renders the guide route", () => {
  renderAt("/GuidePage");
  expect(screen.getByRole("heading", { name: "문중문고 이용안내" })).toBeTruthy();
  expect(screen.getByRole("tab", { name: "이용안내" })).toBeTruthy();
});
