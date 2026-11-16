import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import ConfirmDialog from "../../components/ConfirmDialog";
import Loading from "../../components/Loading";
import EmptyState from "../../components/EmptyState";
import ChildForm from "../../components/ChildForm";
import { childService } from "../../services/childService";
import { useToast } from "../../hooks/useToast";
import { permissionLabels } from "../../utils/permissions";

function Children() {
  const toast = useToast();
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [removing, setRemoving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setChildren(await childService.list());
    } catch (err) {
      toast.error(err.message || "Erro ao carregar filhos.");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(child) {
    setEditing(child);
    setModalOpen(true);
  }

  function closeModal() {
    if (saving) return;
    setModalOpen(false);
    setEditing(null);
  }

  async function handleSubmit(values) {
    setSaving(true);
    try {
      if (editing) {
        await childService.update(editing.id, values);
        toast.success("Conta atualizada.");
      } else {
        await childService.create(values);
        toast.success("Conta criada.");
      }
      setModalOpen(false);
      setEditing(null);
      load();
    } catch (err) {
      toast.error(err.message || "Erro ao salvar conta.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setRemoving(true);
    try {
      await childService.remove(deleting.id);
      toast.success("Conta excluída.");
      setDeleting(null);
      load();
    } catch (err) {
      toast.error(err.message || "Erro ao excluir conta.");
    } finally {
      setRemoving(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Filhos"
        subtitle="Crie contas para seus filhos e escolha o que cada um pode usar"
        action={<Button onClick={openCreate}>Nova conta</Button>}
      />

      {loading ? (
        <Loading label="Carregando filhos..." />
      ) : children.length === 0 ? (
        <EmptyState
          title="Nenhuma conta de filho"
          message="Crie uma conta para acompanhar os gastos dos seus filhos."
          action={
            <Button onClick={openCreate} className="mt-2">
              Nova conta
            </Button>
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface text-gray-400">
              <tr>
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">E-mail</th>
                <th className="px-4 py-3 font-medium">Permissões</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {children.map((child) => (
                <tr key={child.id} className="bg-surface/40 hover:bg-surface">
                  <td className="px-4 py-3 text-gray-100">{child.name}</td>
                  <td className="px-4 py-3 text-gray-400">{child.email}</td>
                  <td className="px-4 py-3 text-gray-400">
                    {permissionLabels(child.permissions)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        child.isActive
                          ? "bg-secondary/15 text-secondary"
                          : "bg-danger/15 text-danger"
                      }`}
                    >
                      {child.isActive ? "Ativa" : "Bloqueada"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link
                        to={`/children/${child.id}`}
                        className="rounded-md border border-border px-3 py-1 text-xs font-medium text-gray-200 hover:bg-surface-2"
                      >
                        Gastos
                      </Link>
                      <Button
                        variant="ghost"
                        onClick={() => openEdit(child)}
                        className="px-3 py-1 text-xs"
                      >
                        Editar
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => setDeleting(child)}
                        className="px-3 py-1 text-xs"
                      >
                        Excluir
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={modalOpen}
        title={editing ? "Editar conta" : "Nova conta de filho"}
        onClose={closeModal}
      >
        <ChildForm
          key={editing?.id || "new"}
          initialValues={editing}
          onSubmit={handleSubmit}
          onCancel={closeModal}
          loading={saving}
        />
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Excluir conta"
        message={`Tem certeza que deseja excluir a conta de "${deleting?.name}"?`}
        confirmLabel="Excluir"
        loading={removing}
        onConfirm={handleDelete}
        onCancel={() => !removing && setDeleting(null)}
      />
    </div>
  );
}

export default Children;
