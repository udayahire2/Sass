import type { ReactNode } from "react";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface AuthCardProps {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthCard({ title, description, children, footer }: AuthCardProps) {
  return (
    <Card className="w-full rounded-md border-border/40 bg-background">
      <CardHeader className="space-y-2 pb-4 text-center">
        <CardTitle className="text-2xl font-semibold">{title}</CardTitle>
        <p className="text-sm leading-6 text-muted-foreground">{description}</p>
      </CardHeader>

      <CardContent className="pt-2">{children}</CardContent>

      {footer ? <CardFooter className="justify-center pt-4">{footer}</CardFooter> : null}
    </Card>
  );
}

interface AuthFormProps {
  children: ReactNode;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

export function AuthForm({ children, onSubmit }: AuthFormProps) {
  return <form onSubmit={onSubmit} className="space-y-4">{children}</form>;
}

interface AuthFieldProps {
  id: string;
  label: string;
  children: ReactNode;
  className?: string;
}

export function AuthField({ id, label, children, className }: AuthFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}

export function AuthInput(props: React.ComponentProps<typeof Input>) {
  return <Input {...props} className={cn("h-11 rounded-md border-border/40 bg-transparent", props.className)} />;
}

interface AuthGridProps {
  children: ReactNode;
}

export function AuthGrid({ children }: AuthGridProps) {
  return <div className="grid gap-4 sm:grid-cols-2">{children}</div>;
}
