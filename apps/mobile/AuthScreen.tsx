import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

type Props = {
  onLogin: (identifier: string, password: string) => Promise<void>;
  onRegister: (input: { username: string; displayName: string; email: string; password: string }) => Promise<void>;
};

export default function AuthScreen({ onLogin, onRegister }: Props) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [identifier, setIdentifier] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    setError("");
    setBusy(true);
    try {
      if (mode === "login") await onLogin(identifier, password);
      else await onRegister({ username: identifier, displayName, email, password });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return <View style={styles.page}>
    <View style={styles.logo}><Text style={styles.logoText}>n</Text></View>
    <Text style={styles.brand}>NEXCHAT</Text>
    <Text style={styles.heading}>{mode === "login" ? "Welcome back" : "Create account"}</Text>
    <Text style={styles.sub}>{mode === "login" ? "Sign in to continue your conversations." : "One account. All your devices."}</Text>
    {mode === "register" && <>
      <TextInput style={styles.input} placeholder="Display name" placeholderTextColor="#8290A5" value={displayName} onChangeText={setDisplayName} />
      <TextInput style={styles.input} placeholder="Username" placeholderTextColor="#8290A5" autoCapitalize="none" value={identifier} onChangeText={setIdentifier} />
      <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#8290A5" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
    </>}
    {mode === "login" && <TextInput style={styles.input} placeholder="Username or email" placeholderTextColor="#8290A5" autoCapitalize="none" value={identifier} onChangeText={setIdentifier} />}
    <TextInput style={styles.input} placeholder={mode === "register" ? "Password (10+ characters)" : "Password"} placeholderTextColor="#8290A5" secureTextEntry value={password} onChangeText={setPassword} />
    {!!error && <Text style={styles.error}>{error}</Text>}
    <Pressable style={[styles.submit, busy && styles.disabled]} disabled={busy} onPress={submit}><Text style={styles.submitText}>{busy ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}</Text></Pressable>
    <Text style={styles.switchText}>{mode === "login" ? "New to NEXCHAT?" : "Already have an account?"} <Text style={styles.switchLink} onPress={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}>{mode === "login" ? "Create account" : "Sign in"}</Text></Text>
  </View>;
}

const styles = StyleSheet.create({
  page: { flex: 1, justifyContent: "center", paddingHorizontal: 26, backgroundColor: "#0B1220" },
  logo: { width: 54, height: 54, borderRadius: 18, backgroundColor: "#477FF5", alignSelf: "center", alignItems: "center", justifyContent: "center", marginBottom: 10 },
  logoText: { color: "white", fontSize: 35, fontWeight: "900" },
  brand: { color: "#C9D9EC", textAlign: "center", fontSize: 12, fontWeight: "900", letterSpacing: 3, marginBottom: 34 },
  heading: { color: "#F4F7FC", textAlign: "center", fontSize: 26, fontWeight: "800", marginBottom: 8 },
  sub: { color: "#91A0B6", textAlign: "center", fontSize: 13, marginBottom: 25 },
  input: { height: 50, borderRadius: 13, paddingHorizontal: 15, backgroundColor: "#172235", borderWidth: 1, borderColor: "#2A3B50", color: "#F4F7FC", marginBottom: 12 },
  submit: { height: 50, borderRadius: 13, backgroundColor: "#477FF5", justifyContent: "center", alignItems: "center", marginTop: 5 },
  disabled: { opacity: 0.6 },
  submitText: { color: "white", fontWeight: "800", fontSize: 14 },
  error: { color: "#FF9EAA", fontSize: 12, marginBottom: 10 },
  switchText: { color: "#91A0B6", textAlign: "center", marginTop: 23, fontSize: 12 },
  switchLink: { color: "#80B4FF", fontWeight: "800" }
});
