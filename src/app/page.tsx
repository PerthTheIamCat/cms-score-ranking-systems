import Link from "next/link";
import Card from "@/components/Card";
import Badge from "@/components/Badge";
import Background from "@/components/Background";
import NavSidebar from "@/components/NavSidebar"; // Import the component
import { LayoutDashboard, Settings, Home as HomeiCon } from "lucide-react";

const routes = [
  {
    href: "/client",
    label: "Open Client",
    description: "Connects to SSE and shows the live boolean flag.",
  },
  {
    href: "/admin",
    label: "Open Admin",
    description: "Sends true/false values to all connected clients.",
  },
] as const;

export default function Home() {
  return (
    <main className="min-h-screen flex"> {/* Added flex here to house the sidebar */} 
    <NavSidebar 
      menu={{ title: "Menu", icon: <LayoutDashboard size={24} /> }}
      bgColor="#1a1a1a"
      classname="fixed left-0 top-0 h-screen ml-3" 
    >
      {/* Dashboard Item */}
      <Link href="/dashboard" className="flex items-center group/item cursor-pointer h-12">
        <div className="w-12 flex items-center justify-center shrink-0">
          <HomeiCon className="text-white/60 group-hover/item:text-white transition-colors" size={22} />
        </div>
        <span className="ml-4 text-sm font-medium text-white/60 group-hover/item:text-white opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap">
          Dashboard
        </span>
      </Link>

      {/* Settings Item */}
      <Link href="/settings" className="flex items-center group/item cursor-pointer h-12">
        <div className="w-12 flex items-center justify-center shrink-0">
          <Settings className="text-white/60 group-hover/item:text-white transition-colors" size={22} />
        </div>
        <span className="ml-4 text-sm font-medium text-white/60 group-hover/item:text-white opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap">
          Settings
        </span>
      </Link>
    </NavSidebar>
      <div className="relative flex-1 flex flex-col items-center justify-center">
        <Background
          className="absolute inset-0 h-full w-full"
          gap={18}
          speed={1}
          lineLength={160}
          color="rgba(167, 243, 208, 0.95)"
          trailColor="rgba(74, 222, 128, 0.04)"
        />
        <h1 className="relative z-10 text-4xl font-bold mb-8">CMS Scoreboard</h1>
        <div className="relative z-10 grid gap-6 md:grid-cols-2">
          {routes.map(({ href, label, description }) => (
            <Link key={href} href={href} className="w-full">
              <Card title={label} description={description}>
                <p className="text-sm">
                  Click to open the {label.toLowerCase()} page.
                </p>
              </Card>
            </Link>
          ))}
          <Badge label="test" color="dark_green" />
          <Badge label="test" color="light_green" />
          <Badge label="test" color="default" />
          <Badge label="test" color="red" />
          <Badge label="test" color="yellow" />
        </div>
      </div>
    </main>
  );
}