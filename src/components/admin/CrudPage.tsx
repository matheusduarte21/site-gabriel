import { useState } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import AdminHeader from "./AdminHeader";
import { Button } from "../ui/Button";

interface CrudItem {
    id: string;
    [key: string]: string;
}

interface Column {
    key: string;
    label: string;
}

interface CrudPageProps {
    title: string;
    subtitle: string;
    columns: Column[];
    initialData: CrudItem[];
}

const CrudPage = ({ title, subtitle, columns, initialData }: CrudPageProps) => {
    const [items, setItems] = useState<CrudItem[]>(initialData);
    const [search, setSearch] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Record<string, string>>({});
    const [showForm, setShowForm] = useState(false);

    const filtered = items.filter((item) =>
        columns.some((col) =>
        item[col.key]?.toLowerCase().includes(search.toLowerCase())
        )
    );

    const handleSave = () => {
        if (editingId) {
        setItems((prev) =>
            prev.map((item) => (item.id === editingId ? { ...item, ...formData } : item))
        );
        } else {
        setItems((prev) => [...prev, { id: crypto.randomUUID(), ...formData }]);
        }
        setShowForm(false);
        setEditingId(null);
        setFormData({});
    };

    const handleEdit = (item: CrudItem) => {
        setEditingId(item.id);
        setFormData(item);
        setShowForm(true);
    };

    const handleDelete = (id: string) => {
        setItems((prev) => prev.filter((item) => item.id !== id));
    };

    const handleNew = () => {
        setEditingId(null);
        setFormData({});
        setShowForm(true);
    };

    return (
        <div className="space-y-6">
        <AdminHeader title={title} subtitle={subtitle} />

        <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 flex-1 max-w-md">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
                type="text"
                placeholder="Buscar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground w-full"
            />
            </div>
            <Button onClick={handleNew} className="gap-2">
            <Plus className="h-4 w-4" />
            Novo
            </Button>
        </div>
        {showForm && (
            <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="mb-4 text-lg font-semibold text-foreground">
                {editingId ? "Editar" : "Novo"} {title.slice(0, -1)}
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {columns.map((col) => (
                <div key={col.key}>
                    <label className="mb-1 block text-sm font-medium text-foreground">{col.label}</label>
                    <input
                    type="text"
                    value={formData[col.key] || ""}
                    onChange={(e) => setFormData((p) => ({ ...p, [col.key]: e.target.value }))}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-ring"
                    />
                </div>
                ))}
            </div>
            <div className="mt-4 flex gap-2">
                <Button onClick={handleSave}>Salvar</Button>
                <Button variant="outline" onClick={() => { setShowForm(false); setEditingId(null); }}>
                Cancelar
                </Button>
            </div>
            </div>
        )}

        <div className="overflow-hidden rounded-xl border border-border bg-card">
            <table className="w-full">
            <thead>
                <tr className="border-b border-border bg-muted/50">
                {columns.map((col) => (
                    <th key={col.key} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {col.label}
                    </th>
                ))}
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Ações
                </th>
                </tr>
            </thead>
            <tbody>
                {filtered.map((item) => (
                <tr key={item.id} className="border-b border-border last:border-0 transition-colors hover:bg-muted/30">
                    {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-sm text-foreground">
                        {item[col.key]}
                    </td>
                    ))}
                    <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                        <button
                        onClick={() => handleEdit(item)}
                        className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                        >
                        <Pencil className="h-4 w-4" />
                        </button>
                        <button
                        onClick={() => handleDelete(item.id)}
                        className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                        >
                        <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                    </td>
                </tr>
                ))}
                {filtered.length === 0 && (
                <tr>
                    <td colSpan={columns.length + 1} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    Nenhum registro encontrado.
                    </td>
                </tr>
                )}
            </tbody>
            </table>
        </div>
        </div>
    );
};

export default CrudPage;