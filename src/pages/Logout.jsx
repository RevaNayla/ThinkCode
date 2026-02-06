import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";


export default function LogoutPage({
  logoutEndpoint = "/api/auth/logout", 
  redirectTo = "/login",
  autoLogout = false, 
  storageKeys = ["token", "authToken", "user", "userId"],
}) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);

  function clearLocalAuth() {
    try {
      storageKeys.forEach((k) => localStorage.removeItem(k));
      storageKeys.forEach((k) => sessionStorage.removeItem(k));

      document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
      document.cookie = "auth=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
    } catch (e) {
      // ignore
    }
  }

  async function performLogout() {
    setLoading(true);
    setError(null);

    const token = localStorage.getItem("token") || sessionStorage.getItem("token");

    try {
      if (logoutEndpoint) {
        await axios.post(
          logoutEndpoint,
          {},
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            withCredentials: true, 
          }
        );
      }
    } catch (err) {
      console.warn("Server logout failed:", err?.response || err?.message || err);
      setError("Gagal logout di server. Anda tetap akan dikeluarkan di sisi klien.");
    } finally {

      clearLocalAuth();
      setLoading(false);
      setDone(true);

      navigate(redirectTo, { replace: true });
    }
  }


  useEffect(() => {
    if (autoLogout) performLogout();

  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-6">
        <h1 className="text-2xl font-semibold mb-2">Keluar / Logout</h1>
        <p className="text-sm text-slate-600 mb-4">
          Tekan tombol "Logout" untuk mengakhiri sesi Anda. Setelah logout, Anda akan
          diarahkan ke halaman login.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded">{error}</div>
        )}

        {loading ? (
          <div className="flex items-center gap-3">
            <svg
              className="animate-spin h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
              ></path>
            </svg>
            <span>Proses logout...</span>
          </div>
        ) : done ? (
          <div className="mb-2 p-3 bg-green-50 text-green-700 rounded">Anda berhasil logout.</div>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={performLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Logout Sekarang
            </button>

            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 border rounded-lg hover:bg-slate-50 transition"
            >
              Batal
            </button>
          </div>
        )}

        <hr className="my-4" />
        <p className="text-xs text-slate-500">Catatan: Jika aplikasi Anda memakai HttpOnly cookie, hapus token di server.</p>
      </div>
    </div>
  );
}

