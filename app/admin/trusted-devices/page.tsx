"use client";

import { useEffect, useState } from "react";

type TrustedDevice = {
  id: string;
  email: string;
  device_name: string | null;
  user_agent: string | null;
  ip: string | null;
  expires_at: string;
  revoked: boolean;
  created_at: string;
  last_used_at: string | null;
  is_current: boolean;
};

export default function TrustedDevicesPage() {
  const [devices, setDevices] = useState<TrustedDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function loadDevices() {
    setLoading(true);
    setMessage("");

    const res = await fetch("/api/admin/trusted-devices");
    const data = await res.json();

    setLoading(false);

    if (!res.ok) {
      setMessage(data.error || "Failed to load trusted devices.");
      return;
    }

    setDevices(data.devices || []);
  }

  async function revokeDevice(deviceId: string) {
    if (!confirm("Remove this trusted device?")) return;

    const res = await fetch("/api/admin/trusted-devices", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ deviceId }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "Failed to remove device.");
      return;
    }

    setMessage("Trusted device removed.");
    loadDevices();
  }

  async function revokeAllOthers() {
    if (!confirm("Remove all other trusted devices?")) return;

    const res = await fetch("/api/admin/trusted-devices", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ revokeAllOthers: true }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "Failed to remove other devices.");
      return;
    }

    setMessage("All other trusted devices removed.");
    loadDevices();
  }

  useEffect(() => {
    loadDevices();
  }, []);

  return (
    <main className="min-h-screen bg-[#070b14] px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm font-black uppercase tracking-[0.25em] text-cyan-300">
          Admin Security
        </p>

        <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-4xl font-black">Trusted Devices</h1>
            <p className="mt-2 text-slate-400">
              Manage devices that can skip OTP for 30 days.
            </p>
          </div>

          <button
            onClick={revokeAllOthers}
            className="rounded-2xl border border-red-400/30 px-5 py-3 font-bold text-red-300 hover:bg-red-400/10"
          >
            Remove All Other Devices
          </button>
        </div>

        {message && (
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-slate-300">
            {message}
          </div>
        )}

        <div className="mt-8 space-y-4">
          {loading ? (
            <div className="rounded-3xl border border-white/10 bg-[#101729] p-6 text-slate-400">
              Loading trusted devices...
            </div>
          ) : devices.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-[#101729] p-6 text-slate-400">
              No trusted devices yet.
            </div>
          ) : (
            devices.map((device) => (
              <div
                key={device.id}
                className={`rounded-3xl border p-6 shadow-xl ${
                  device.revoked
                    ? "border-red-400/20 bg-red-950/20 opacity-70"
                    : device.is_current
                    ? "border-cyan-400/30 bg-cyan-400/10"
                    : "border-white/10 bg-[#101729]"
                }`}
              >
                <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-xl font-black">
                        {device.device_name || "Unknown Device"}
                      </h2>

                      {device.is_current && (
                        <span className="rounded-full bg-cyan-400 px-3 py-1 text-xs font-black text-slate-950">
                          Current Device
                        </span>
                      )}

                      {device.revoked && (
                        <span className="rounded-full bg-red-400 px-3 py-1 text-xs font-black text-slate-950">
                          Revoked
                        </span>
                      )}
                    </div>

                    <p className="mt-2 text-sm text-slate-400">
                      {device.email}
                    </p>

                    <div className="mt-4 grid gap-2 text-sm text-slate-300">
                      <p>
                        <span className="font-bold text-slate-400">
                          IP:
                        </span>{" "}
                        {device.ip || "Unknown"}
                      </p>

                      <p>
                        <span className="font-bold text-slate-400">
                          Trusted until:
                        </span>{" "}
                        {new Date(device.expires_at).toLocaleString()}
                      </p>

                      <p>
                        <span className="font-bold text-slate-400">
                          Last used:
                        </span>{" "}
                        {device.last_used_at
                          ? new Date(device.last_used_at).toLocaleString()
                          : "Never"}
                      </p>

                      <p className="break-all">
                        <span className="font-bold text-slate-400">
                          Browser:
                        </span>{" "}
                        {device.user_agent || "Unknown"}
                      </p>
                    </div>
                  </div>

                  {!device.revoked && (
                    <button
                      onClick={() => revokeDevice(device.id)}
                      className="rounded-2xl border border-red-400/30 px-5 py-3 font-bold text-red-300 hover:bg-red-400/10"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}