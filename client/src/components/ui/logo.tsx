import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <div className={cn("flex items-center", className)}>
      <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-lg mr-2"></div>
      <span className="text-xl font-bold text-dark">DefiHub</span>
    </div>
  );
}
