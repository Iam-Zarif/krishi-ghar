const ProducerProductsSummaryCard = ({ icon: Icon, title, value, accentClass }) => (
  <div className="rounded-2xl border border-white/70 bg-white p-4 shadow-sm">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="mt-2 text-2xl font-bold text-gray-800">{value}</p>
      </div>
      <div className={`rounded-2xl p-3 ${accentClass}`}>
        <Icon className="text-xl" />
      </div>
    </div>
  </div>
);

export default ProducerProductsSummaryCard;
