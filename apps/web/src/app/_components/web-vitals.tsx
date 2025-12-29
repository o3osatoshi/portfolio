"use client";

import { getWebBrowserLogger } from "@/lib/logging/browser";
import { createWebVitalsComponent } from "@o3osatoshi/logging/nextjs/client";

const WebVitalsComponent = createWebVitalsComponent(getWebBrowserLogger());

export default function WebVitals() {
  return <WebVitalsComponent />;
}
