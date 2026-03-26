export default function StatsCard({ title, value, color }) {
  return (
    <div className={`p-5 rounded shadow text-white ${color}`}>
      <h3 className="text-lg">{title}</h3>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}