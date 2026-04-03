"use client";

import { useState } from "react";

import DocCard from "@/components/docs/DocCard";
import DocTabs from "@/components/docs/DocTabs";
import Badge from "@/components/Badge";
import Card from "@/components/Card";

const components = [
  {
    name: "Card",
    component: () => <DocCard />,
  },
  {
    name: "Badge",
    component: () => <Badge>Badge Component Preview</Badge>,
  },
  {
    name: "Tabs",
    component: () => <DocTabs />,
  },
] as const;

export default function ComponentsPage() {
  const [selectedComponent, setSelectedComponent] = useState<
    (typeof components)[number]
  >(components[0]);

  return (
    <main className="min-h-screen grid grid-cols-[350px_1fr] gap-4 p-4">
      <Card className=" w-87.5" isAnimated={false}>
        <h1 className="text-4xl font-bold mb-8">Components</h1>
        <div className="flex flex-col gap-4">
          {components.map((comp) => (
            <button
              key={comp.name}
              className={`text-left p-2 rounded-lg ${
                selectedComponent.name === comp.name
                  ? "bg-white/10"
                  : "hover:bg-white/5"
              }`}
              onClick={() => setSelectedComponent(comp)}
            >
              {comp.name}
            </button>
          ))}
        </div>
      </Card>
      <Card className=" w-full" isAnimated={false}>
        <selectedComponent.component />
      </Card>
    </main>
  );
}
