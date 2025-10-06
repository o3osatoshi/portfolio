import type { Meta, StoryObj } from "@storybook/react-vite";

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

export const Default: Story = {};

export const Invalid: Story = {
  args: {
    "aria-invalid": true,
    defaultValue: "not-a-valid-email",
    placeholder: "Email",
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: "Disabled input",
  },
};
