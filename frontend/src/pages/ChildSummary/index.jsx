import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import StatCard from "../../components/StatCard";
import Loading from "../../components/Loading";
import EmptyState from "../../components/EmptyState";
import CategoryBreakdown from "../../components/CategoryBreakdown";
import RecentExpenses from "../../components/RecentExpenses";
import { childService } from "../../services/childService";
import { useToast } from "../../hooks/useToast";
import { formatCurrency } from "../../utils/format";

const backLink = (
  <Link to="/children" className="text-sm text-primary hover:underline">
    Voltar
  </Link>
);

function ChildSummary() {
  const { id } = useParams();
  const toast = useToast();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    childService
      .summary(id)
      .then((data) => active && setSummary(data))
      .catch((err) => active && toast.error(err.message || "Erro ao carregar gastos."))
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [id, toast]);

  if (loading) return <Loading label="Carregando gastos..." />;
  if (!summary) return <EmptyState title="Conta não encontrada" action={backLink} />;

  const expenses = [...summary.expenses].sort(
    (a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt)
  );

  return (
    <div>
      <PageHeader
        title={summary.child.name}
        subtitle="Gastos registrados pelo seu filho"
        action={backLink}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard
          label="Total de gastos"
          value={formatCurrency(summary.total)}
          icon="/money.svg"
          accent="text-secondary"
        />
        <StatCard
          label="Quantidade de despesas"
          value={summary.count}
          icon="/expense.svg"
          accent="text-primary"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <CategoryBreakdown data={summary.byCategory} />
        <RecentExpenses expenses={expenses} showAllLink={false} />
      </div>
    </div>
  );
}

export default ChildSummary;
