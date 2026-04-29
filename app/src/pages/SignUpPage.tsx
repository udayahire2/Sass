import SignUp from "@/components/auth/SignUp";
import { AuthShell } from "@/components/auth/auth-shell";

export default function SignUpPage() {
    return (
        <AuthShell
            badge="New Account"
            title="Create your account"
            description="Start with the basic details and open your study space."
            highlights={[
                "Simple onboarding flow",
                "Clean form with only needed fields"
            ]}
        >
            <SignUp />
        </AuthShell>
    );
}
