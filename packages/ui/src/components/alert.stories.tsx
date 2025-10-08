import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "@storybook/test";
import { AlertCircle } from "lucide-react";
import type * as React from "react";

import { Alert, AlertDescription, AlertTitle } from "./alert";

const meta = {
  args: {
    variant: "default",
  },
  component: Alert,
  tags: ["autodocs"],
  title: "UI/Alert",
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

const renderAlert = (args: React.ComponentProps<typeof Alert>) => (
  <Alert {...args}>
    <AlertCircle className="size-4" />
    <AlertTitle>Heads up!</AlertTitle>
    <AlertDescription>
      You can add components to your layout to build interactive product UI.
    </AlertDescription>
  </Alert>
);

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const alert = canvas.getByRole("alert");

    expect(alert).toBeVisible();
    expect(canvas.getByText("Heads up!")).toBeVisible();
    expect(
      canvas.getByText(
        "You can add components to your layout to build interactive product UI.",
      ),
    ).toBeVisible();
  },
  render: renderAlert,
};

export const Destructive: Story = {
  args: {
    variant: "destructive",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const alert = canvas.getByRole("alert");

    expect(alert).toBeVisible();
    expect(
      canvas.getByText(
        "You can add components to your layout to build interactive product UI.",
      ),
    ).toBeVisible();
  },
  render: renderAlert,
};
