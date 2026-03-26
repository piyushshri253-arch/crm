export default function LeadsTable({ leads }) {
  return (
    <table className="w-full mt-6 bg-white shadow rounded">
      <thead className="bg-gray-200">
        <tr>
          <th className="p-3">Name</th>
          <th>Destination</th>
          <th>Status</th>
        </tr>
      </thead>

      <tbody>
        {leads.map((l) => (
          <tr key={l.id} className="border-t text-center">
            <td className="p-3">{l.name}</td>
            <td>{l.destination}</td>
            <td className={
              l.status === "success"
                ? "text-green-600"
                : l.status === "pending"
                ? "text-yellow-600"
                : "text-red-600"
            }>
              {l.status}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}