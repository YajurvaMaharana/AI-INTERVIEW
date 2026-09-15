import Link from "next/link";
import { FileQuestion, Home, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-6 rounded-2xl border border-border/70 bg-card/80 p-8 shadow-sm backdrop-blur-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <FileQuestion className="h-7 w-7" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-semibold tracking-wider text-primary uppercase">
            404 Error
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Page not found
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The page you are looking for doesn&apos;t exist or has been moved to another location.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            id="notfound-home-button"
            asChild
            variant="default"
            className="w-full sm:w-auto inline-flex items-center gap-2"
          >
            <Link href="/">
              <Home className="h-4 w-4" />
              Return Home
            </Link>
          </Button>

          <Button
            id="notfound-dashboard-button"
            asChild
            variant="outline"
            className="w-full sm:w-auto inline-flex items-center gap-2"
          >
            <Link href="/dashboard">
              <LayoutDashboard className="h-4 w-4" />
              Go to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
