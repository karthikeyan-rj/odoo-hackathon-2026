import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "./api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const nav = useNavigate();

  const submit = async e => {
    e.preventDefault();
    try {
      const { data } = await api.post("/api/auth/login", { email, password });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      nav("/dashboard");
    } catch (err) { setError(err.response?.data?.error || "Login failed"); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50">
      <form onSubmit={submit} className="w-80 p-6 bg-white border border-zinc-200 rounded space-y-3">
        <h2 className="text-sm font-bold text-zinc-900">AssetFlow Login</h2>
        {error && <p className="text-xs text-red-600">{error}</p>}
        <input type="email" placeholder="Email" required className="w-full p-2 text-xs border border-zinc-300 rounded" value={email} onChange={e => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" required className="w-full p-2 text-xs border border-zinc-300 rounded" value={password} onChange={e => setPassword(e.target.value)} />
        <button type="submit" className="w-full py-2 bg-blue-600 text-white text-xs font-semibold rounded hover:bg-blue-700">Sign In</button>
      </form>
    </div>
  );
}
