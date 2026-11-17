import { useState } from "react";
import Input from "../Input";
import Button from "../Button";
import { validateChild } from "../../utils/validators";
import { PERMISSIONS } from "../../utils/permissions";

function Checkbox({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2 text-sm text-gray-200">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 accent-primary"
      />
      {label}
    </label>
  );
}

function ChildForm({ initialValues, onSubmit, onCancel, loading }) {
  const editing = Boolean(initialValues);
  const [form, setForm] = useState({
    name: initialValues?.name || "",
    email: initialValues?.email || "",
    password: "",
    permissions: initialValues?.permissions || [],
    isActive: initialValues?.isActive ?? true,
  });
  const [errors, setErrors] = useState({});

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function togglePermission(permission) {
    setForm((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter((p) => p !== permission)
        : [...prev.permissions, permission],
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const validation = validateChild(form, editing);
    setErrors(validation);
    if (Object.keys(validation).length) return;

    const data = { name: form.name, permissions: form.permissions };
    if (form.password) data.password = form.password;
    if (editing) data.isActive = form.isActive;
    else data.email = form.email;
    onSubmit(data);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Nome"
        id="name"
        name="name"
        value={form.name}
        onChange={handleChange}
        error={errors.name}
      />
      <Input
        label="E-mail"
        id="email"
        name="email"
        type="email"
        value={form.email}
        onChange={handleChange}
        error={errors.email}
        disabled={editing}
      />
      <Input
        label={editing ? "Nova senha (opcional)" : "Senha"}
        id="password"
        name="password"
        type="password"
        value={form.password}
        onChange={handleChange}
        error={errors.password}
      />

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm text-gray-300">Permissões</legend>
        {PERMISSIONS.map((p) => (
          <Checkbox
            key={p.value}
            label={p.label}
            checked={form.permissions.includes(p.value)}
            onChange={() => togglePermission(p.value)}
          />
        ))}
      </fieldset>

      {editing && (
        <Checkbox
          label="Conta ativa"
          checked={form.isActive}
          onChange={() =>
            setForm((prev) => ({ ...prev, isActive: !prev.isActive }))
          }
        />
      )}

      <div className="mt-2 flex justify-end gap-3">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" loading={loading}>
          Salvar
        </Button>
      </div>
    </form>
  );
}

export default ChildForm;
