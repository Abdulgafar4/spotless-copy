// app/dashboard/payments/success/page.tsx
import { Suspense } from "react";
import PaymentSuccessPage from "./client-page";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-10">Loading...</div>}>
      <PaymentSuccessPage />
    </Suspense>
  );
}
