import SignUp from "@/components/auth/SignUp";
import { Logo } from "@/components/ui/logo";

export default function SignUpPage() {
    return (
        <div className="min-h-screen w-full flex bg-[#0a0a0a] text-white font-sans">
            
            {/* Left Column - Functional Sign Up Area */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 sm:p-12">
                <div className="w-full max-w-sm">
                    <SignUp />
                </div>
            </div>

            {/* Right Column - Social Proof (Identical to Login) */}
            <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-start p-16 border-l border-zinc-800 relative overflow-hidden">
                
                {/* Decorative Background Grid Lines */}
                <div className="absolute inset-0 grid grid-cols-4 opacity-20 pointer-events-none">
                    <div className="border-r border-zinc-700 border-dashed"></div>
                    <div className="border-r border-zinc-700 border-dashed"></div>
                    <div className="border-r border-zinc-700 border-dashed"></div>
                    <div></div>
                </div>

                <div className="relative z-10 max-w-lg ml-8">
                    {/* Testimonial Header */}
                    <div className="mb-10 text-2xl font-bold flex items-center gap-2">
                       <Logo/>
                    </div>
                    
                    {/* Quote */}
                    <blockquote className="text-3xl font-medium mb-10 leading-snug tracking-tight">
                        "Sharing notes with friends is now instant. Our study group productivity increased by 10x."
                    </blockquote>
                    
                    {/* Profile */}
                    <div className="flex items-center gap-4 mb-24">
                        <div className="w-12 h-12 rounded-full border border-zinc-700 bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                            <span className="text-white font-bold">SP</span>
                        </div>
                        <div>
                            <p className="font-semibold text-white">Sophia Patel</p>
                            <p className="text-zinc-400 text-sm">Student, B.Tech Mechanical Engineering</p>
                        </div>
                    </div>

                    {/* Trusted By Footer */}
                    <div className="border-t border-zinc-800 pt-8 w-full">
                        <p className="text-zinc-500 text-sm mb-6 uppercase tracking-wider">Join thousands of students</p>
                        <div className="flex gap-8 items-center text-zinc-300 font-bold text-lg">
                            <span>5000+ Users</span>
                            <span>200+ Topics</span>
                            <span>50K+ Notes</span>
                            <span>Trusted</span>
                        </div>
                    </div>
                </div>
            </div>
            
        </div>
    );
}