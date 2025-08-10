import { Construction } from "lucide-react";

export default async function Page() {
  return (
    <div className="flex flex-col gap-6">
      <h1>About</h1>
      <div className="flex gap-2">
        <Construction />
        <span>Under Construction</span>
      </div>
    </div>
  );
}
