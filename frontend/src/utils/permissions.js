export const PERMISSIONS = [
  { value: "expenses", label: "Despesas e dashboard" },
  { value: "categories", label: "Gerenciar categorias" },
];

export function permissionLabels(permissions = []) {
  return (
    PERMISSIONS.filter((p) => permissions.includes(p.value))
      .map((p) => p.label)
      .join(", ") || "Nenhuma"
  );
}
