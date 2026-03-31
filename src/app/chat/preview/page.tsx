import Header from "@/components/Header";
import ChatClient from "@/components/ChatClient";

export default function ChatPreview() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex flex-1 flex-col">
        <ChatClient
          isSubscribed={false}
          messagesUsed={1}
          messagesLimit={3}
          voiceSecondsUsed={60}
          voiceSecondsLimit={180}
          chatUrl=""
          voiceUrl=""
          userId="preview"
        />
      </main>
    </div>
  );
}
