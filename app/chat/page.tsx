import SiteHeader from "@/components/SiteHeader";
import TutorChat from "@/components/TutorChat";

export default function ChatPage() {
  return (
    <>
      <SiteHeader
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "자유 질문 · Free questions" }]}
      />
      <TutorChat />
    </>
  );
}
