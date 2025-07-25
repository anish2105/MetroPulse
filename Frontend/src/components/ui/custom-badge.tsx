import { X } from "lucide-react";
import { Badge } from "./badge";
import { cn } from "@/lib/utils";

interface CustomBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  onRemove?: () => void;
  children: React.ReactNode;
}

export function CustomBadge({ children, onRemove, className, ...props }: CustomBadgeProps) {
  return (
    <Badge 
      {...props}
      className={cn("pr-1.5 pl-3 inline-flex items-center gap-1.5", className)}
    >
      {children}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="p-0.5 hover:bg-background/20 rounded-full"
        >
          <X className="h-3 w-3" />
          <span className="sr-only">Remove</span>
        </button>
      )}
    </Badge>
  );
}