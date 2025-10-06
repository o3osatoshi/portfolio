import type { Meta, StoryObj } from "@storybook/react-vite";
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
  render: renderAlert,
};

export const Destructive: Story = {
  args: {
    variant: "destructive",
  },
  render: renderAlert,
};
