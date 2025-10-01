import { AlertCircle } from "lucide-react";

import { Alert, AlertTitle } from "@/components/index.server";

interface Props {
  children: React.ReactNode | undefined;
  variant?: "default" | "destructive";
}

/**
 * Helper that lifts alert styling into forms by rendering an inline {@link Alert}.
 *
 * @public
 */
export function Message({ children, variant }: Props) {
  if (children === undefined) return null;

  return (
    <Alert variant={variant}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{children}</AlertTitle>
    </Alert>
  );
}
