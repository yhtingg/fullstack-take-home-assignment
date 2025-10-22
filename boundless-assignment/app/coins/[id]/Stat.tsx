export default function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex-1 min-w-[120px] flex flex-col items-center sm:items-start">
      <span className="text-sm font-medium text-gray-500">{label}</span>
      <span className="text-gray-900">{value}</span>
    </div>
  );
}
