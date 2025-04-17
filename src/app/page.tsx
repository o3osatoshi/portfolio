import { redirect } from "next/navigation";
import { getPath } from "@/utils/path";

export default function Page() {
  redirect(getPath("core-crud"));
}
