import Card from "../Card";

export default function DocCard() {
  return (
    <div className="flex flex-col">
      <h2 className="text-2xl font-bold mb-4">Card Component</h2>
      <h3 className="text-xl font-semibold mb-2">Normal use</h3>
      <Card title="Title" description="Description" />
      <h3 className="text-xl font-semibold mb-2">Pass Children</h3>
      <Card>
        <p>This is a child element inside the Card component.</p>
      </Card>
      <h3 className="text-xl font-semibold mb-2">Disable Animation</h3>
      <Card
        isAnimated={false}
        title="Static Card"
        description="This card does not have animation."
      />
    </div>
  );
}
