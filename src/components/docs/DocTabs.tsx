import Tabs from "../Tabs";

export default function DocTabs() {
  return (
    <div className="flex flex-col">
      <h2 className="text-2xl font-bold mb-4">Tabs Component</h2>
      <Tabs
        tabsList={[
          {
            label: "Overview",
          },
          {
            label: "Analytics",
          },
          {
            label: "Publishing options",
          },
        ]}
      />
    </div>
  );
}
