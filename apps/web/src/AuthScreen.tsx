import { FormEvent, useState } from "react";
import { ArrowRight, LockKeyhole, Mail, MessageCircle, UserRound } from "lucide-react";

type Props = {
  onLogin: (identifier: string, password: string) => Promise<void>;
  onRegister: (input: { username: string; displayName: string; email: string; password: string }) => Promise<void>;
};

export default function AuthScreen({ onLogin, onRegister }: Props) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (mode === "login") await onLogin(username, password);
      else await onRegister({ username, displayName, email, password });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return <main className="auth-shell">
    <section className="auth-card">
      <div className="auth-brand"><span className="auth-logo">n</span><span>NEXCHAT</span></div>
      <div className="auth-heading"><div className="auth-icon"><MessageCircle size={23}/></div><h1>{mode === "login" ? "Welcome back" : "Create your account"}</h1><p>{mode === "login" ? "Sign in to continue your conversations." : "Join NEXCHAT and connect across your devices."}</p></div>
      <form className="auth-form" onSubmit={submit}>
        {mode === "register" && <>
          <label>Display name<div className="auth-input"><UserRound size={17}/><input required minLength={1} maxLength={40} value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Your name"/></div></label>
          <label>Username<div className="auth-input"><span className="at">@</span><input required minLength={3} maxLength={24} pattern="[A-Za-z0-9_]+" value={username} onChange={e => setUsername(e.target.value)} placeholder="username"/></div></label>
          <label>Email<div className="auth-input"><Mail size={17}/><input required type="email" maxLength={254} value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"/></div></label>
        </>}
        {mode === "login" && <label>Username or email<div className="auth-input"><UserRound size={17}/><input required value={username} onChange={e => setUsername(e.target.value)} placeholder="Username or email"/></div></label>}
        <label>Password<div className="auth-input"><LockKeyhole size={17}/><input required type="password" minLength={mode === "register" ? 10 : 1} maxLength={128} value={password} onChange={e => setPassword(e.target.value)} placeholder={mode === "register" ? "At least 10 characters" : "Your password"}/></div></label>
        {error && <div className="auth-error" role="alert">{error}</div>}
        <button className="auth-submit" disabled={busy} type="submit">{busy ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}<ArrowRight size={17}/></button>
      </form>
      <div className="auth-switch">{mode === "login" ? "New to NEXCHAT?" : "Already have an account?"} <button onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}>{mode === "login" ? "Create account" : "Sign in"}</button></div>
      <div className="auth-foot">One account. All your devices.</div>
    </section>
  </main>;
}
