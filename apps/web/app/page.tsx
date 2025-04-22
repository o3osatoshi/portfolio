import { Button } from "@repo/ui/button";

export default function Home() {
  return (
    <>
      <main>
        <div className="w-full flex flex-col items-center p-3">
          <ol>
            <li>
              Get started by editing <code>apps/web/app/page.tsx</code>
            </li>
            <li>Save and see your changes instantly.</li>
          </ol>
          <Button appName="web">Open alert</Button>
        </div>
      </main>
      <footer>
        <div className="w-full flex flex-col items-center p-3">footer</div>
      </footer>
    </>
  );
}
