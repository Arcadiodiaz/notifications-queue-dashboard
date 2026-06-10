# 🚀 Notification Queue Dashboard

A notification management dashboard built with **Next.js 14**, **React 18**, and **TypeScript**.

The application allows users to create, manage, and process notification jobs through a simulated queue system with support for concurrency control, progress tracking, cancellation, retries, and bulk operations.

This project was developed as a technical challenge focused on **type safety**, **asynchronous processing**, **queue management**, and **clean architecture**.

---

# 🛠 Tech Stack

* Next.js 14 (App Router)
* React 18
* TypeScript
* Formik
* Yup
* ESLint

---

# ✨ Features

## Notification Management

* Create notifications
* Delete notifications
* Send individual notifications
* Send all queued notifications
* Real-time status updates

## Queue Processing

* Generic queue runner implementation
* Configurable concurrency limit
* Asynchronous job execution
* Bulk processing support
* Progress tracking

## Delivery Simulation

* Random execution time (1–8 seconds)
* Real-time progress updates
* 20% failure probability
* Cancellation using `AbortController`

## Optional Features Implemented

* Retry mechanism using **Exponential Backoff + Jitter**
* Notification filtering by status:

  * `queued`
  * `sending`
  * `sent`
  * `failed`
* Global queue progress tracking

## Validation Rules

* Unique notification titles per channel
* Maximum queued notifications limit
* Form validation using Formik and Yup

---

# ⚡ Getting Started

## Install dependencies

```bash
npm install
```

## Run the development server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

# 📜 Available Scripts

```bash
npm run dev
```

Starts the application in development mode.

```bash
npm run build
```

Creates a production build.

```bash
npm run start
```

Runs the production build.

```bash
npm run lint
```

Runs ESLint.

---

# 🏗 Architecture

The project follows a **feature-based architecture**, grouping related functionality together while keeping routing, business logic, and reusable utilities separated.

```text
src/
├── app/
├── features/
│   └── notifications/
├── lib/
└── ...
```

### app/

Contains Next.js routes and application entry points.

```text
app/
├── page.tsx
└── notifications/
    └── page.tsx
```

### features/notifications

Contains all notification-related functionality:

* UI components
* React hooks
* Validation schemas
* Domain types
* Utility functions

### lib/

Contains reusable application-wide utilities.

```text
lib/
└── queue/
    └── runQueue.ts
```

The queue runner is framework-agnostic and can be reused independently from React components.

---

# 🔄 Processing Flow

1. A user creates a notification through the form.
2. The notification is added to the local queue.
3. Notifications can be sent individually or through **Send All**.
4. Jobs are executed using a concurrency-controlled queue.
5. Progress is updated in real time.
6. A notification can:

   * Complete successfully
   * Fail randomly (20% probability)
   * Be cancelled by the user
7. Failed notifications can be retried using exponential backoff and jitter.

---

# 📂 Project Structure

```text
src/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   └── notifications/
│       └── page.tsx
│
├── features/
│   └── notifications/
│       ├── components/
│       │   ├── NotificationDashboard.tsx
│       │   ├── NotificationForm.tsx
│       │   ├── NotificationList.tsx
│       │   └── NotificationProgress.tsx
│       │
│       ├── hooks/
│       │   ├── useNotifications.ts
│       │   └── useNotificationQueue.ts
│       │
│       ├── types/
│       │   ├── notificationForm.ts
│       │   ├── notificationJob.ts
│       │   └── notificationRecord.ts
│       │
│       ├── utils/
│       │   └── normalizeNotifications.ts
│       │
│       └── validation/
│           └── notificationSchema.ts
│
└── lib/
    └── queue/
        └── runQueue.ts
```

---

# 🎯 Technical Highlights

## Type Safety

* Discriminated unions for notification states.
* Strong TypeScript typing throughout the application.
* Generic normalization utilities.

## Queue Engine

Generic queue implementation:

```ts
runQueue<T>(
  concurrency: number,
  jobs: (() => Promise<T>)[]
): Promise<T[]>
```

Features:

* Concurrency limiting
* Promise orchestration
* Framework-independent implementation
* Reusable across different job types

## Retry Strategy

Failed jobs can be retried using:

* Exponential Backoff
* Random Jitter
* Configurable retry attempts

This approach helps avoid retry storms and simulates production-grade retry behavior.

## User Experience

* Real-time progress indicators
* Global queue progress
* Status-based filtering
* Bulk operations
* Immediate validation feedback

---

# 📄 License

This project was created for educational and technical assessment purposes.
