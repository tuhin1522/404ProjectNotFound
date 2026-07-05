import Link from "next/link";
import { GitBranch, Kanban, ImageIcon } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-background/80 mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="flex flex-col gap-3">
            <span className="text-lg font-bold text-primary">
              404<span className="text-foreground">ProjectNotFound</span>
            </span>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              A 2-in-1 web app for Kanban task management and image polygon annotation, built with Next.js and Django.
            </p>
          </div>

          {/* Features */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Features</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/tasks" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <Kanban size={14} className="text-primary" />
                  Kanban Task Board
                </Link>
              </li>
              <li>
                <Link href="/annotate" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <ImageIcon size={14} className="text-special" />
                  Image Annotation
                </Link>
              </li>
            </ul>
          </div>

          {/* Links */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Login
                </Link>
              </li>
              <li>
                <Link href="/signup" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Sign Up
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <GitBranch size={14} />
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} 404 Project Not Found. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            "Believe in the code that believes in you!" 🕶️🔥
          </p>
        </div>
      </div>
    </footer>
  );
}
