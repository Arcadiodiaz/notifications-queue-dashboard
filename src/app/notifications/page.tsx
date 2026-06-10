import { NotificationDashboard } from "@/features/notifications/components/NotificationDashboard";

export default function NotificationsPage() {
  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto w-full max-w-5xl">
        <NotificationDashboard />
      </div>
    </main>
  );
}
