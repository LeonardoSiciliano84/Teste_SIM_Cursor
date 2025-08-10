import React, { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Alert } from "../ui/alert";

interface PasswordResetProps {
  token?: string;
}

export const PasswordReset: React.FC<PasswordResetProps> = ({ token }) => {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(token ? 2 : 1);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/auth/request-password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Instruções enviadas para seu email.");
        setStep(2);
      } else {
        setError(data.message || "Erro ao solicitar redefinição.");
      }
    } catch (err) {
      setError("Erro de rede.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    if (newPassword !== confirmPassword) {
      setError("As senhas não coincidem.");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Senha redefinida com sucesso. Faça login.");
      } else {
        setError(data.message || "Erro ao redefinir senha.");
      }
    } catch (err) {
      setError("Erro de rede.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      {step === 1 && (
        <form onSubmit={handleRequestReset} className="space-y-4">
          <h2 className="text-xl font-bold">Recuperar Senha</h2>
          <Input
            type="email"
            placeholder="Seu email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoFocus
          />
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Enviando..." : "Enviar instruções"}
          </Button>
          {error && <Alert variant="destructive">{error}</Alert>}
          {message && <Alert variant="success">{message}</Alert>}
        </form>
      )}
      {step === 2 && (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <h2 className="text-xl font-bold">Redefinir Senha</h2>
          <Input
            type="password"
            placeholder="Nova senha"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            required
            minLength={6}
          />
          <Input
            type="password"
            placeholder="Confirme a nova senha"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
            minLength={6}
          />
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Redefinindo..." : "Redefinir Senha"}
          </Button>
          {error && <Alert variant="destructive">{error}</Alert>}
          {message && <Alert variant="success">{message}</Alert>}
        </form>
      )}
    </div>
  );
};

export default PasswordReset;
