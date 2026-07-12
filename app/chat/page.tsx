import SiteHeader from "@/components/SiteHeader";
import TutorChat from "@/components/TutorChat";

export default function ChatPage() {
  return (
    <>
      <SiteHeader active="tutor" />
      <TutorChat />
    </>
  );
}
