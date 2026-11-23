import Icon from "../Icon";

function StatusBadge({ status }) {
  const paid = status === "PAGA";

  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-gray-300">
      <Icon
        name={paid ? "checkCircle" : "clock"}
        size={16}
        className={paid ? "text-secondary" : "text-tertiary"}
      />
      {paid ? "Paga" : "Pendente"}
    </span>
  );
}

export default StatusBadge;
