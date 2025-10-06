import type { Meta, StoryObj } from "@storybook/react-vite";

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

export const Default: Story = {};

export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: "Amount disabled",
  },
};

export const TextMode: Story = {
  args: {
    placeholder: "$1,500.00",
    type: "text",
  },
};
