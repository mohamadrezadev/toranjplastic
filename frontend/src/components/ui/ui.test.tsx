import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { describe, expect, it, vi } from "vitest";
import { Button, Checkbox, DirectionalData, Input, Radio, Select, Switch, Textarea } from ".";

describe("UI primitives", () => {
  it("activates an enabled button once and blocks loading or disabled actions", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const { rerender } = render(<Button onClick={onClick}>ثبت درخواست</Button>);
    await user.click(screen.getByRole("button", { name: "ثبت درخواست" }));
    expect(onClick).toHaveBeenCalledTimes(1);

    rerender(<Button onClick={onClick} isLoading loadingText="در حال ثبت">ثبت درخواست</Button>);
    expect(screen.getByRole("button", { name: "در حال ثبت" })).toBeDisabled();
    expect(screen.getByRole("button")).toHaveAttribute("aria-busy", "true");
    expect(screen.getByRole("status")).toHaveTextContent("در حال ثبت");
    await user.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("associates labels, help and Persian errors with form controls", async () => {
    const { container } = render(<>
      <Input label="نام مجموعه" helpText="نام حقوقی را وارد کنید" error="نام مجموعه الزامی است" required />
      <Textarea label="توضیحات" readOnly defaultValue="نمونه" />
      <Select label="نوع درخواست" defaultValue=""><option value="" disabled>انتخاب کنید</option></Select>
      <Checkbox label="شرایط را خوانده‌ام" />
      <Radio label="گزینه اول" name="option" />
      <Switch label="دریافت اعلان" />
    </>);

    const input = screen.getByRole("textbox", { name: /نام مجموعه/ });
    expect(input).toBeRequired();
    expect(input).toBeInvalid();
    expect(input).toHaveAccessibleDescription("نام حقوقی را وارد کنید نام مجموعه الزامی است");
    expect(screen.getByRole("switch", { name: "دریافت اعلان" })).not.toBeChecked();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("isolates technical identifiers without changing surrounding direction", () => {
    render(<p dir="rtl">کد پیگیری <DirectionalData>TRJ-2048-A</DirectionalData></p>);
    expect(screen.getByText("TRJ-2048-A")).toHaveAttribute("dir", "ltr");
    expect(screen.getByText("TRJ-2048-A")).toHaveClass("ltr-data");
  });
});
