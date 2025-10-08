import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "@storybook/test";

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

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText("Email");

    await userEvent.type(input, "demo@example.com");

    expect(input).toHaveValue("demo@example.com");
  },
};

export const WithError: Story = {
  args: {
    errorMessage: "Please enter a valid email address.",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      canvas.getByText("Please enter a valid email address."),
    ).toBeVisible();
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    errorMessage: undefined,
    placeholder: "Disabled input",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText("Email");

    expect(input).toBeDisabled();
    expect(input).toHaveAttribute("placeholder", "Disabled input");
    expect(
      canvas.queryByText("Please enter a valid email address."),
    ).toBeNull();
  },
};
