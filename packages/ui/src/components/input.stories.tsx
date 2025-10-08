import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "@storybook/test";

import { Input } from "./input";

const meta = {
  args: {
    placeholder: "Enter your email",
    type: "email",
  },
  component: Input,
  tags: ["autodocs"],
  title: "UI/Input",
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText("Enter your email");

    await userEvent.type(input, "hello@example.com");

    expect(input).toHaveValue("hello@example.com");
  },
};

export const Invalid: Story = {
  args: {
    "aria-invalid": true,
    defaultValue: "not-a-valid-email",
    placeholder: "Email",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText("Email");

    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveValue("not-a-valid-email");
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: "Disabled input",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText("Disabled input");

    expect(input).toBeDisabled();
  },
};
