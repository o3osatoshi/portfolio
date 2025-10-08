import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "@storybook/test";

import { AmountInput } from "./amount-input";

const meta = {
  args: {
    placeholder: "0.00",
    type: "number",
  },
  component: AmountInput,
  tags: ["autodocs"],
  title: "UI/Case/AmountInput",
} satisfies Meta<typeof AmountInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("spinbutton");

    expect(input).toHaveAttribute("placeholder", "0.00");

    await userEvent.type(input, "123");

    expect(input).toHaveValue(123);
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: "Amount disabled",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("spinbutton");

    expect(input).toBeDisabled();
    expect(input).toHaveAttribute("placeholder", "Amount disabled");
  },
};

export const TextMode: Story = {
  args: {
    placeholder: "$1,500.00",
    type: "text",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox");

    expect(input).toHaveAttribute("placeholder", "$1,500.00");

    await userEvent.type(input, "USD");

    expect(input).toHaveValue("USD");
  },
};
