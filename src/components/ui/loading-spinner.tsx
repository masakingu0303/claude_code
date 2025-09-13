import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "small" | "medium" | "large";
  className?: string;
}

const sizeClasses = {
  small: "h-4 w-4",
  medium: "h-6 w-6", 
  large: "h-8 w-8"
};

export default function LoadingSpinner({ 
  size = "medium", 
  className 
}: LoadingSpinnerProps) {
  return (
    <div className={cn("animate-spin rounded-full border-2 border-gray-300 border-t-indigo-600", sizeClasses[size], className)} />
  );
}