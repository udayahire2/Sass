import Login from "@/components/auth/Login";
import { Logo } from "@/components/ui/logo";
import { ScrollArea } from "@/components/ui/scroll-area";
import backgroundImage from "@/assets/images/loginpage.png";

export default function LoginPage() {
  return (
    <ScrollArea className="h-screen w-screen">
      <div className="min-h-screen w-full flex bg-background text-foreground font-sans">
        {/* Left Column - Background Image (60%) */}
        <div
          className="hidden lg:flex lg:w-[60%] flex-col justify-center items-start p-8 border-r border-[#434343]/20 relative overflow-hidden"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          {/* Overlay for better text contrast */}
          <div className="absolute inset-0 bg-black/30" />
          
          {/* Logo - Top Left Corner */}
          <div className="absolute top-6 left-6 z-10">
            <Logo />
          </div>
        </div>

        {/* Right Column - Login Form (40%) */}
        <div className="w-full lg:w-[40%] flex flex-col justify-center items-center p-8 sm:p-12">
          <div className="absolute top-6 left-6 lg:hidden">
            <Logo />
          </div>
          <div className="w-full max-w-sm">
            <Login />
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}