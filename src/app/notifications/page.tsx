import { NotificationDashboard } from "@/features/notifications/components/NotificationDashboard";

export default function NotificationsPage() {
  return (
    <main className="min-h-screen bg-neutral-50 p-6">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 left-[-10%] h-[520px] w-[520px] rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute top-10 right-[-15%] h-[520px] w-[520px] rounded-full bg-emerald-500/10 blur-3xl" />
      </div>
      <div className="mx-auto w-full max-w-5xl">
        <NotificationDashboard />
      </div>
    </main>
  );
}
