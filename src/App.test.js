import { fireEvent, render, screen } from "@testing-library/react";
import Button from "./Components/ui/Button";
import FilterSelect from "./Components/ui/FilterSelect";
import IconButton from "./Components/ui/IconButton";
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

test("opens filter choices and changes the selected value", () => {
  const onChange = jest.fn();
  const { rerender } = render(
    <FilterSelect
      label="정렬"
      value="title"
      options={[
        { value: "title", label: "제목순" },
        { value: "popular", label: "인기순" }
      ]}
      onChange={onChange}
    />
  );

  fireEvent.click(screen.getByRole("button", { name: /정렬 제목순/ }));
  fireEvent.click(screen.getByRole("option", { name: "인기순" }));
  expect(onChange).toHaveBeenCalledWith("popular");

  rerender(
    <FilterSelect
      label="정렬"
      value="popular"
      options={[
        { value: "title", label: "제목순" },
        { value: "popular", label: "인기순" }
      ]}
      onChange={onChange}
    />
  );
  expect(screen.getByRole("button", { name: /정렬 인기순/ })).toBeTruthy();
});

test("disables filter interaction when disabled", () => {
  render(
    <FilterSelect
      label="정렬"
      value="title"
      options={[{ value: "title", label: "제목순" }]}
      onChange={() => {}}
      disabled
    />
  );
  expect(screen.getByRole("button", { name: /정렬 제목순/ }).disabled).toBe(true);
});


test("renders selected favorite icon button state", () => {
  render(<IconButton icon="heart-filled" label="관심도서 취소" selected />);
  const button = screen.getByRole("button", { name: "관심도서 취소" });
  expect(button.getAttribute("aria-pressed")).toBe("true");
  expect(button.className.includes("ui-icon-button--selected")).toBe(true);
});
