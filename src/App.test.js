import { render, screen } from "@testing-library/react";
import Button from "./Components/ui/Button";
import StatusBadge from "./Components/ui/StatusBadge";
import TextField from "./Components/ui/TextField";

test("renders primary action component", () => {
  render(<Button>대출하기</Button>);
  expect(screen.getByRole("button", { name: "대출하기" })).toBeTruthy();
});

test("renders semantic status badge", () => {
  render(<StatusBadge tone="danger">3일 연체</StatusBadge>);
  expect(screen.getByText("3일 연체")).toBeTruthy();
});

test("associates text field label and input", () => {
  render(<TextField label="아이디" value="" onChange={() => {}} />);
  expect(screen.getByLabelText("아이디")).toBeTruthy();
});
