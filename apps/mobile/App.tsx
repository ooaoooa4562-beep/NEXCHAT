import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import AuthScreen from "./AuthScreen";
import { MobileUser, mobileLogin, mobileLogout, mobileRegister, mobileRestoreSession } from "./auth";
import {
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";

type Chat = { id: string; name: string; preview: string; time: string; color: string; unread?: number };

const initialChats: Chat[] = [
  { id: "1", name: "NEXCHAT Team", preview: "Welcome to your new space 👋", time: "12:42", color: "#477FF5", unread: 2 },
  { id: "2", name: "Alex Morgan", preview: "That sounds great!", time: "11:58", color: "#C98765" },
  { id: "3", name: "Design Community", preview: "Maya: shared a new concept", time: "10:24", color: "#8C72D9", unread: 4 },
  { id: "4", name: "Sam Wilson", preview: "📷 Photo", time: "Yesterday", color: "#4C9B82" },
  { id: "5", name: "Product Updates", preview: "NEXCHAT 0.1.0 is taking shape", time: "Yesterday", color: "#C17B9D" }
];

export default function App() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Chat | null>(null);
  const [chats] = useState(initialChats);
  const filtered = chats.filter((chat) => chat.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />
      {selected ? (
        <View style={styles.screen}>
          <View style={styles.chatHeader}>
            <Pressable onPress={() => setSelected(null)}><Text style={styles.back}>‹</Text></Pressable>
            <View style={[styles.avatar, { backgroundColor: selected.color }]}><Text style={styles.avatarText}>{selected.name[0]}</Text></View>
            <View style={styles.headerCopy}><Text style={styles.title}>{selected.name}</Text><Text style={styles.subtitle}>NEXCHAT preview</Text></View>
          </View>
          <View style={styles.preview}>
            <Text style={styles.previewTitle}>Your conversation starts here</Text>
            <Text style={styles.previewText}>Messages will sync across Android, iPhone, Windows and Mac when your account and messaging service are connected.</Text>
          </View>
          <View style={styles.composer}><TextInput placeholder="Write a message..." placeholderTextColor="#8290A5" style={styles.messageInput} /></View>
        </View>
      ) : (
        <View style={styles.screen}>
          <View style={styles.top}>
            <View><Text style={styles.eyebrow}>YOUR SPACE</Text><Text style={styles.title}>Messages</Text></View>
            <View style={styles.brand}><Text style={styles.brandText}>n</Text></View>
          </View>
          <TextInput value={query} onChangeText={setQuery} placeholder="Search messages" placeholderTextColor="#8290A5" style={styles.search} />
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <Pressable style={styles.chatRow} onPress={() => setSelected(item)}>
                <View style={[styles.avatar, { backgroundColor: item.color }]}><Text style={styles.avatarText}>{item.name[0]}</Text></View>
                <View style={styles.chatCopy}>
                  <View style={styles.chatLine}><Text style={styles.chatName}>{item.name}</Text><Text style={styles.time}>{item.time}</Text></View>
                  <View style={styles.chatLine}><Text numberOfLines={1} style={styles.previewLine}>{item.preview}</Text>{item.unread ? <Text style={styles.unread}>{item.unread}</Text> : null}</View>
                </View>
              </Pressable>
            )}
            ListEmptyComponent={<Text style={styles.empty}>No conversations found</Text>}
          />
          <Pressable onPress={async () => { await mobileLogout(); setUser(null); }}><Text style={styles.footer}>{user.displayName} · Sign out</Text></Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0B1220" },\n  loading: { color: "#91A0B6", textAlign: "center", marginTop: 40 },
  screen: { flex: 1, paddingHorizontal: 20, paddingTop: 18 },
  top: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 24 },
  eyebrow: { color: "#8392AA", fontSize: 10, fontWeight: "800", letterSpacing: 2, marginBottom: 7 },
  title: { color: "#F4F7FC", fontSize: 27, fontWeight: "800" },
  brand: { width: 42, height: 42, borderRadius: 15, backgroundColor: "#477FF5", alignItems: "center", justifyContent: "center" },
  brandText: { color: "white", fontSize: 27, fontWeight: "900" },
  search: { height: 48, borderRadius: 15, paddingHorizontal: 16, color: "#F4F7FC", backgroundColor: "#172235", marginBottom: 16, fontSize: 15 },
  list: { paddingBottom: 24 },
  chatRow: { flexDirection: "row", alignItems: "center", paddingVertical: 14, gap: 13 },
  avatar: { width: 52, height: 52, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  avatarText: { color: "white", fontWeight: "800", fontSize: 20 },
  chatCopy: { flex: 1, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#243147", paddingBottom: 14 },
  chatLine: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 5 },
  chatName: { color: "#F2F5FA", fontSize: 15, fontWeight: "700", flex: 1 },
  time: { color: "#8392AA", fontSize: 11 },
  previewLine: { color: "#91A0B6", fontSize: 13, flex: 1 },
  unread: { overflow: "hidden", color: "white", backgroundColor: "#477FF5", borderRadius: 10, minWidth: 20, textAlign: "center", paddingHorizontal: 6, paddingVertical: 2, fontSize: 11, fontWeight: "800" },
  footer: { textAlign: "center", color: "#687890", fontSize: 11, paddingVertical: 12 },
  empty: { color: "#91A0B6", textAlign: "center", marginTop: 40 },
  chatHeader: { flexDirection: "row", alignItems: "center", gap: 12, paddingBottom: 18, borderBottomWidth: 1, borderBottomColor: "#243147" },
  back: { color: "#8EAEFF", fontSize: 36, paddingRight: 4 },
  headerCopy: { flex: 1 },
  subtitle: { color: "#8D9BB0", fontSize: 12, marginTop: 3 },
  preview: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 24 },
  previewTitle: { color: "#F4F7FC", fontSize: 19, fontWeight: "700", textAlign: "center", marginBottom: 10 },
  previewText: { color: "#91A0B6", lineHeight: 22, textAlign: "center", fontSize: 14 },
  composer: { backgroundColor: "#172235", borderRadius: 16, paddingHorizontal: 14, paddingVertical: 4, marginBottom: 10 },
  messageInput: { color: "#F4F7FC", height: 44, fontSize: 14 }
});
