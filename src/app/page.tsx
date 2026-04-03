import Link from "next/link";
import Card from "@/components/Card";
import Badge from "@/components/Badge";
import Background from "@/components/Background";

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
    <main className="min-h-screen flex flex-col items-center justify-center ">
      <Background
        className="absolute inset-0 h-full w-full"
        gap={18}
        speed={1}
        lineLength={160}
        color="rgba(167, 243, 208, 0.95)"
        trailColor="rgba(74, 222, 128, 0.04)"
      />
      <h1 className="text-4xl font-bold mb-8">CMS Scoreboard</h1>
      <div className="grid gap-6 md:grid-cols-2">
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
    </main>
  );
}
