import { Camera, Upload, LayoutDashboard, FileText, Settings } from "lucide-react";
import { NavLink } from "@/components/NavLink";

const Navbar = () => {
  const navItems = [
    { name: "Home", path: "/", icon: LayoutDashboard },
    { name: "Live Detection", path: "/live", icon: Camera },
    { name: "Upload Media", path: "/upload", icon: Upload },
    { name: "Dashboard Logs", path: "/logs", icon: FileText },
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  return (
    <nav className="bg-card border-b border-border">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Camera className="w-7 h-7 text-primary" />
            <span className="text-lg font-semibold text-foreground">Smart Campus LPR</span>
          </div>
          
          <div className="flex gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                activeClassName="bg-primary/10 text-primary hover:bg-primary/15"
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
