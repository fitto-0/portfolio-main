import GradientBlur from "./GradientBlur";
import MainMenu from "./MainMenu";
import SocialMenu from "./SocialMenu";
import SoundControl from "./SoundControl";
import ThemeControl from "./ThemeControl";
import dynamic from "next/dynamic";

const ChatToggle = dynamic(() => import("../AIChat/ChatToggle"), {
  ssr: false,
});

export default function Navigation() {
  return (
    <>
      <nav className="fixed bottom-8 lg:top-8 left-1/2 -translate-x-1/2 h-fit w-auto max-w-screen-lg z-50 flex justify-center items-center gap-2 md:gap-4 flex-nowrap">
        <MainMenu />
        <SocialMenu />
        <SoundControl />
        <ThemeControl />
        <div className="md:hidden bg-neutral-200 dark:bg-neutral-800 p-px rounded-full relative shadow-sm shadow-neutral-400 dark:shadow-black z-50 shrink-0">
          <ChatToggle />
        </div>
        <GradientBlur />
      </nav>
      
      {/* Desktop Chat Toggle (hidden on mobile) */}
      <div className="hidden md:block fixed bottom-8 right-8 z-50">
        <ChatToggle />
      </div>
    </>
  );
}
