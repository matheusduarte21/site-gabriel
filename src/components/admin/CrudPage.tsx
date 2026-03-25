import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "../ui/Button";
// 👇 IMPORTAMOS O DIALOG DO SHADCN AQUI 👇
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";

export interface ColumnOption {
  value: string | number;
  label: string;
}

export interface Column {
  key: string;
  label: string;
  type?: "text" | "select"; 
  options?: ColumnOption[]; 
}

export interface CrudItem {
  id: string;
  [key: string]: any;
}

export interface CrudPageProps {
  title: string;
  subtitle: string;
  columns: Column[];
  initialData: any[];
  CustomForm?: React.FC<any>; 
  modalMaxWidth?: string; // 💡 NOVA PROP: Controla a largura do modal
}

const ITEMS_PER_PAGE = 5;

const CrudPage = ({ title, subtitle, columns, initialData, CustomForm, modalMaxWidth = "max-w-lg" }: CrudPageProps) => {
  const [items, setItems] = useState<CrudItem[]>(initialData);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [showForm, setShowForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setItems(initialData);
  }, [initialData]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const filtered = items.filter((item) =>
    columns.some((col) =>
      String(item[col.key] || "")?.toLowerCase().includes(search.toLowerCase())
    )
  );

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedItems = filtered.slice(startIndex, endIndex);

  const handleSave = () => {
    if (editingId) {
      setItems((prev) =>
        prev.map((item) => (item.id === editingId ? { ...item, ...formData } : item))
      );
    } else {
      setItems((prev) => [...prev, { id: crypto.randomUUID(), ...formData }]);
    }
    closeForm();
  };

  const handleCustomSubmit = (data: any) => {
    if (editingId) {
      setItems((prev) =>
        prev.map((item) => (item.id === editingId ? { ...item, ...data } : item))
      );
    } else {
      setItems((prev) => [...prev, { id: crypto.randomUUID(), ...data }]);
    }
    closeForm();
  };

  const handleEdit = (item: CrudItem) => {
    setEditingId(item.id);
    setFormData(item);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    if (paginatedItems.length === 1 && currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleNew = () => {
    setEditingId(null);
    setFormData({});
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({});
  };

  return (
    <div className="space-y-8">
      {/* --- CABEÇALHO --- */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      </div>

      {/* --- BARRA DE BUSCA E BOTÃO NOVO --- */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar registros..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-input bg-background py-2.5 pl-10 pr-4 text-sm text-foreground shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/20"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <Button onClick={handleNew} className="gap-2 shadow-sm">
          <Plus className="h-4 w-4" />
          Novo registro
        </Button>
      </div>

      {/* 👇 MODAL (DIALOG) SUBSTITUINDO A DIV INLINE 👇 */}
      <Dialog open={showForm} onOpenChange={(isOpen) => !isOpen && closeForm()}>
        <DialogContent className={`${modalMaxWidth} max-h-[85vh] overflow-y-auto`}>
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar" : "Novo"} registro</DialogTitle>
            <DialogDescription>
              {editingId ? "Atualize os campos abaixo" : "Preencha os campos para criar um novo registro"}
            </DialogDescription>
          </DialogHeader>

          {/* Aqui injetamos o seu form ou usamos o genérico */}
          {CustomForm ? (
            <CustomForm
              initialData={editingId ? items.find((i) => i.id === editingId) : null}
              onSubmit={handleCustomSubmit}
              onCancel={closeForm}
            />
          ) : (
            <div className="space-y-6 pt-2">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {columns.map((col) => (
                  <div key={col.key} className="space-y-1.5">
                    <label className="block text-sm font-medium text-foreground">
                      {col.label}
                    </label>
                    {col.type === "select" ? (
                      <select
                        value={formData[col.key] || ""}
                        onChange={(e) => setFormData((p) => ({ ...p, [col.key]: e.target.value }))}
                        className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm text-foreground shadow-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-ring/20 appearance-none"
                      >
                        <option value="" disabled>Selecione {col.label.toLowerCase()}...</option>
                        {col.options?.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={formData[col.key] || ""}
                        onChange={(e) => setFormData((p) => ({ ...p, [col.key]: e.target.value }))}
                        placeholder={`Digite ${col.label.toLowerCase()}...`}
                        className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm text-foreground shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/20"
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6 flex gap-3 border-t border-border pt-5">
                <Button onClick={handleSave} className="shadow-sm">
                  {editingId ? "Atualizar" : "Salvar"}
                </Button>
                <Button variant="outline" onClick={closeForm}>
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* --- TABELA E PAGINAÇÃO --- */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                  >
                    {col.label}
                  </th>
                ))}
                <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedItems.map((item) => (
                <tr key={item.id} className="transition-colors hover:bg-muted/20">
                  {columns.map((col) => (
                    <td key={col.key} className="whitespace-nowrap px-5 py-4 text-sm text-foreground">
                      {item[col.key] === null || item[col.key] === undefined || item[col.key] === ""
                        ? "---"
                        : col.type === "select"
                        ? col.options?.find(opt => String(opt.value) === String(item[col.key]))?.label || item[col.key]
                        : item[col.key]}
                    </td>
                  ))}
                  <td className="whitespace-nowrap px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleEdit(item)}
                        title="Editar"
                        className="rounded-lg p-2 text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        title="Excluir"
                        className="rounded-lg p-2 text-muted-foreground transition-all hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={columns.length + 1} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Search className="h-8 w-8 text-muted-foreground/40" />
                      <p className="text-sm font-medium text-muted-foreground">Nenhum registro encontrado</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex flex-col gap-3 border-t border-border bg-muted/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm text-muted-foreground">
              Mostrando <span className="font-medium text-foreground">{startIndex + 1}</span> a <span className="font-medium text-foreground">{Math.min(endIndex, filtered.length)}</span> de <span className="font-medium text-foreground">{filtered.length}</span> resultados
            </span>

            <div className="flex items-center gap-1.5">
              <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="h-8 w-8 p-0">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button key={page} variant={page === currentPage ? "default" : "outline"} size="sm" onClick={() => setCurrentPage(page)} className="h-8 w-8 p-0 text-xs">
                  {page}
                </Button>
              ))}
              <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="h-8 w-8 p-0">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CrudPage;