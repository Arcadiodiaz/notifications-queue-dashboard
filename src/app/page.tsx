import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <header className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <Image src="/next.svg" alt="Next.js" width={96} height={20} priority />
            <div className="text-sm text-neutral-600">Technical Test</div>
          </div>
          <h1 className="text-2xl font-semibold">Notifications Queue Dashboard</h1>
          <p className="text-sm text-neutral-600">
            Go to the notifications page to manage jobs and simulate sending.
          </p>
        </header>

        <div>
          <Link
            href="/notifications"
            className="inline-flex items-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white"
          >
            Open Notifications
          </Link>
        </div>
      </div>
    </main>
  );
}
