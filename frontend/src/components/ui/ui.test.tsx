import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { describe, expect, it, vi } from "vitest";
import { Button, Checkbox, DirectionalData, Input, Radio, Select, StatusBadge, Switch, Textarea } from ".";
import buttonStyles from "./Button.module.css";

describe("UI primitives", () => {
  it("activates an enabled button once and blocks loading or disabled actions", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const { rerender } = render(<Button onClick={onClick}>ثبت درخواست</Button>);
    screen.getByRole("button", { name: "ثبت درخواست" }).focus();
    await user.keyboard("{Enter}");
    expect(onClick).toHaveBeenCalledTimes(1);

    rerender(<Button onClick={onClick} isLoading loadingText="در حال ثبت">ثبت درخواست</Button>);
    expect(screen.getByRole("button", { name: "در حال ثبت" })).toBeDisabled();
    expect(screen.getByRole("button")).toHaveAttribute("aria-busy", "true");
    await user.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("maps Toranj action variants and link actions to public Astryx behavior", () => {
    render(<>
      <Button variant="danger">حذف</Button>
      <Button href="/inquiry" variant="secondary">ثبت استعلام</Button>
    </>);
    expect(screen.getByRole("button", { name: "حذف" })).toHaveAttribute("data-variant", "destructive");
    expect(screen.getByRole("link", { name: "ثبت استعلام" })).toHaveAttribute("href", "/inquiry");
  });

  it("lets a long action label wrap only when asked, keeping the caller's class and name", () => {
    render(<>
      <Button href="/inquiry/injection" wrapLabel className="callerAction">ثبت استعلام تزریق با قالب مشتری</Button>
      <Button href="/inquiry">ثبت استعلام</Button>
    </>);
    const wrapping = screen.getByRole("link", { name: "ثبت استعلام تزریق با قالب مشتری" });
    expect(wrapping).toHaveClass(buttonStyles.wrapLabel, "callerAction");
    // The prop is consumed by the adapter, never forwarded to the DOM.
    expect(wrapping).not.toHaveAttribute("wraplabel");
    expect(screen.getByRole("link", { name: "ثبت استعلام" })).not.toHaveClass(buttonStyles.wrapLabel);
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

  it("preserves native form names, values and change events through Astryx adapters", async () => {
    const user = userEvent.setup();
    const inputChange = vi.fn();
    const choiceChange = vi.fn();
    const { container } = render(<form>
      <Input label="نام" name="name" defaultValue="ترنج" onChange={inputChange} required />
      <Textarea label="پیام" name="message" defaultValue="سلام" maxLength={12} />
      <Checkbox label="تأیید" name="accepted" onChange={choiceChange} required />
      <Switch label="اعلان" name="notification" />
      <Input label="فایل" name="attachment" type="file" />
    </form>);

    const input = screen.getByRole("textbox", { name: /^نام/ });
    await user.clear(input);
    await user.type(input, "پارس");
    await user.type(screen.getByRole("textbox", { name: "پیام" }), " دنیا");
    await user.click(screen.getByRole("checkbox", { name: /^تأیید/ }));
    await user.click(screen.getByRole("switch", { name: "اعلان" }));

    expect(inputChange).toHaveBeenCalled();
    expect(inputChange.mock.lastCall?.[0].target.value).toBe("پارس");
    expect(choiceChange.mock.lastCall?.[0].target.checked).toBe(true);
    expect(screen.getByRole("checkbox", { name: /^تأیید/ })).toBeRequired();
    expect(screen.getByLabelText("فایل")).toHaveAttribute("type", "file");

    const data = new FormData(container.querySelector("form")!);
    expect(data.get("name")).toBe("پارس");
    expect(data.get("message")).toBe("سلام دنیا");
    expect(data.get("accepted")).toBe("on");
    expect(data.get("notification")).toBe("on");
  });

  it("isolates technical identifiers without changing surrounding direction", () => {
    render(<p dir="rtl">کد پیگیری <DirectionalData>TRJ-2048-A</DirectionalData></p>);
    expect(screen.getByText("TRJ-2048-A")).toHaveAttribute("dir", "ltr");
    expect(screen.getByText("TRJ-2048-A")).toHaveClass("ltr-data");
  });

  it("renders a read-only status badge with domain-selected emphasis", () => {
    render(<StatusBadge label="نیازمند بررسی" tone="warning" />);
    const badge = screen.getByText("نیازمند بررسی").closest("[data-variant]");
    expect(badge).not.toBeNull();
    expect(badge).toHaveAttribute("data-variant", "warning");
    expect(badge).not.toHaveAttribute("role", "button");
  });
});
