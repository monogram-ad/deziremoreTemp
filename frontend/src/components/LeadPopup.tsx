"use client";

import { useEffect, useState } from "react";
import { apiPost } from "@/lib/api";
import { LEAD_POPUP_STORAGE_KEY } from "@/lib/constants";

export default function LeadPopup() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const submitted = localStorage.getItem(LEAD_POPUP_STORAGE_KEY);

    if (!submitted) {
      const timer = setTimeout(() => setOpen(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSubmit = async () => {
    setError(null);

    if (!email && !phone) {
      setError("Please enter an email or phone number.");
      return;
    }

    try {
      setSubmitting(true);
      await apiPost("/api/leads", { email, phone });
      localStorage.setItem(LEAD_POPUP_STORAGE_KEY, "true");
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit, please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-5">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-3xl font-heading text-center">Get Latest Updates</h2>

        <p className="text-center text-gray-500 mt-2">
          Exclusive launches, offers and new arrivals.
        </p>

        {error && <p className="text-red-600 text-sm text-center mt-4">{error}</p>}

        <div className="mt-6 space-y-4">
          <input
            type="email"
            placeholder="Email Address"
            className="w-full border rounded-xl p-3"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="tel"
            placeholder="Phone Number"
            className="w-full border rounded-xl p-3"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <button onClick={handleSubmit} disabled={submitting} className="btn-primary w-full mt-5">
          {submitting ? "Submitting..." : "Notify Me"}
        </button>

        <button onClick={() => setOpen(false)} className="w-full mt-3 text-gray-500">
          Close
        </button>
      </div>
    </div>
  );
}
