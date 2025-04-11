
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, X, Brain, MessageSquare, Upload, BookOpen, LayoutDashboard, Users } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { label: "Home", href: "/", icon: <Brain className="h-4 w-4" /> },
  { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: "Chat Assistant", href: "/chat", icon: <MessageSquare className="h-4 w-4" /> },
  { label: "Patients", href: "/patients", icon: <Users className="h-4 w-4" /> },
  { label: "Upload", href: "/upload", icon: <Upload className="h-4 w-4" /> },
  { label: "Resources", href: "/resources", icon: <BookOpen className="h-4 w-4" /> },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-memora-gray">
      <header className="w-full py-4 px-6 flex items-center justify-between backdrop-blur-sm bg-white/50 border-b border-slate-100 sticky top-0 z-50">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-memora-purple to-memora-purple-dark flex items-center justify-center">
            <Brain className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold text-xl text-gradient">Memora</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={`text-sm font-medium transition-colors flex items-center gap-2 ${
                location.pathname === item.href
                  ? "text-memora-purple-dark"
                  : "text-foreground/70 hover:text-foreground"
              }`}
            >
              <span className={location.pathname === item.href ? "text-memora-purple" : "text-foreground/70"}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Mobile Navigation */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu size={24} />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px]">
            <nav className="flex flex-col gap-4 mt-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setOpen(false)}
                  className={`text-lg font-medium transition-colors p-2 rounded-md flex items-center gap-3 ${
                    location.pathname === item.href
                      ? "bg-memora-purple/10 text-memora-purple-dark"
                      : "hover:bg-memora-purple/5"
                  }`}
                >
                  <span className={location.pathname === item.href ? "text-memora-purple" : "text-foreground/70"}>
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </header>

      <main className="container mx-auto px-4 py-6">{children}</main>

      <footer className="py-6 px-4 text-center text-sm text-foreground/60">
        <p>© {new Date().getFullYear()} Memora - Supporting Alzheimer's patients and caregivers</p>
      </footer>
    </div>
  );
}
