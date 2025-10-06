import type { Meta, StoryObj } from "@storybook/react-vite";

import { FormInput } from "./form-input";

const meta = {
  args: {
    id: "email",
    label: "Email",
    placeholder: "you@example.com",
    type: "email",
  },
  component: FormInput,
  tags: ["autodocs"],
  title: "UI/Case/FormInput",
} satisfies Meta<typeof FormInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithError: Story = {
  args: {
    errorMessage: "Please enter a valid email address.",
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    errorMessage: undefined,
    placeholder: "Disabled input",
  },
};
