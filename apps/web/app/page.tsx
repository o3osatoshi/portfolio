import { getPathName } from "@/utils/handle-nav";
import { redirect } from "next/navigation";

export default function Page() {
  redirect(getPathName("core-server-crud"));
}
