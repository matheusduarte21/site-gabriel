import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight, X, Eye, FileText, Inbox } from "lucide-react";
import { Button } from "../ui/Button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { ConfirmDeleteModal } from "./ConfirmDeleteModal";

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
  id: string | number;
  [key: string]: any;
}

export type CrudPageProps = {
    title: string;
    subtitle?: string;
    columns: Column[];
    initialData: any[];
    isLoading?: boolean;
    modalMaxWidth?: string;
    onDelete?: (id: string | number) => Promise<void> | void;
    onSave?: (data: any) => Promise<void> | void;
    CustomForm?: (props: any) => JSX.Element;
}

const ITEMS_PER_PAGE = 5;

const CrudPage = ({ title, subtitle, columns, initialData, isLoading = false, CustomForm, modalMaxWidth = "max-w-lg", onDelete, onSave }: CrudPageProps) => {
  const [items, setItems] = useState<CrudItem[]>(initialData);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [showForm, setShowForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CrudItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [internalLoading, setInternalLoading] = useState(true);

  useEffect(() => {
    setItems(initialData);
  }, [initialData]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  useEffect(() => {
    if (isLoading) {
      setInternalLoading(true);
    } else {
      const timer = setTimeout(() => {
        setInternalLoading(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  const filtered = items.filter((item) =>
    columns.some((col) =>
      String(item[col.key] || "")?.toLowerCase().includes(search.toLowerCase())
    )
  );

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedItems = filtered.slice(startIndex, endIndex);

  const handleEdit = (item: CrudItem) => {
    setEditingId(item.id);
    setFormData(item);
    setShowForm(true);
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

  const handleSaveDefault = async () => {
    setIsSaving(true);
    try {
      const dataToSave = editingId ? { id: editingId, ...formData } : formData;
      if (onSave) {
        await onSave(dataToSave);
      } else {
        if (editingId) {
          setItems((prev) => prev.map((item) => (item.id === editingId ? { ...item, ...formData } : item)));
        } else {
          setItems((prev) => [...prev, { id: crypto.randomUUID(), ...formData }]);
        }
      }
      closeForm();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = (id: string | number) => {
    setItemToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      if (onDelete) await onDelete(itemToDelete);
      setItems((prev) => prev.filter((item) => item.id !== itemToDelete));
      if (paginatedItems.length === 1 && currentPage > 1) setCurrentPage((prev) => prev - 1);
    } catch (error) {
      console.error(error);
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };

  const handleViewDetails = (item: CrudItem) => {
      setSelectedItem(item);
      setShowDetailsModal(true);
  };

  const closeDetails = () => {
      setShowDetailsModal(false);
      setSelectedItem(null);
  };

  const handleOpenDocument = (url: string) => {
      window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Pesquisar por código ou descrição"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-none border border-input bg-background py-2.5 pl-10 pr-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <Button onClick={handleNew} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo registro
        </Button>
      </div>

      <Dialog open={showForm} onOpenChange={(isOpen) => !isOpen && closeForm()}>
        <DialogContent className={`${modalMaxWidth} max-h-[85vh] overflow-y-auto rounded-none`}>
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar" : "Novo"} registro</DialogTitle>
            <DialogDescription>
              {editingId ? "Atualize os campos abaixo" : "Preencha os campos para criar um novo registro"}
            </DialogDescription>
          </DialogHeader>

          {CustomForm ? (
            <CustomForm
              initialData={editingId ? items.find((i) => i.id === editingId) : null}
              onCancel={closeForm}
              onSubmit={async (data: any) => {
                  if (onSave) await onSave(data);
                  closeForm();
              }}
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
                        className="w-full rounded-none border border-input bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary appearance-none"
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
                        className="w-full rounded-none border border-input bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary"
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6 flex gap-3 border-t border-border pt-5">
                <Button onClick={handleSaveDefault} disabled={isSaving}>
                  {editingId ? "Atualizar" : "Salvar"}
                </Button>
                <Button variant="outline" onClick={closeForm} disabled={isSaving}>
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showDetailsModal} onOpenChange={(isOpen) => !isOpen && closeDetails()}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto rounded-none">
              <DialogHeader>
                  <DialogTitle>Detalhes do Registro</DialogTitle>
              </DialogHeader>
              {selectedItem && (
                  <div className="space-y-4 pt-4">
                      <div className="grid grid-cols-2 gap-4">
                          {columns.map((col) => (
                              <div key={col.key} className="space-y-1">
                                  <p className="text-sm font-semibold text-muted-foreground">{col.label}</p>
                                  <p className="text-sm font-medium text-foreground break-words">
                                    {selectedItem[col.key] === null || selectedItem[col.key] === undefined || selectedItem[col.key] === ""
                                        ? "---"
                                        : col.type === "select"
                                        ? col.options?.find(opt => String(opt.value) === String(selectedItem[col.key]))?.label || selectedItem[col.key]
                                        : selectedItem[col.key]}
                                  </p>
                              </div>
                          ))}
                      </div>
                      
                      {selectedItem.url_arquivo && (
                          <div className="mt-6 pt-4 border-t border-border">
                              <p className="text-sm font-semibold text-muted-foreground mb-3">Documento Anexado</p>
                              <Button 
                                variant="outline" 
                                className="w-full sm:w-auto gap-2"
                                onClick={() => handleOpenDocument(selectedItem.url_arquivo)}
                              >
                                  <FileText className="h-4 w-4" />
                                  Visualizar Documento
                              </Button>
                          </div>
                      )}
                  </div>
              )}
          </DialogContent>
      </Dialog>

      <div className="overflow-hidden rounded-none border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {columns.map((col) => (
                  <th key={col.key} className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {col.label}
                  </th>
                ))}
                <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {internalLoading ? (
                Array.from({ length: ITEMS_PER_PAGE }).map((_, rowIndex) => (
                  <tr key={rowIndex}>
                    {columns.map((col) => (
                      <td key={col.key} className="px-5 py-4">
                        <div className="h-4 w-3/4 animate-pulse rounded bg-muted"></div>
                      </td>
                    ))}
                    <td className="px-5 py-4">
                      <div className="ml-auto h-4 w-12 animate-pulse rounded bg-muted"></div>
                    </td>
                  </tr>
                ))
              ) : paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 1} className="px-5 py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <Inbox className="h-8 w-8 opacity-20" />
                      <p className="text-sm font-medium">Nenhum registro encontrado</p>
                      <p className="text-xs">Tente ajustar sua busca ou adicione um novo item.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item) => (
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
                        <button onClick={() => handleViewDetails(item)} title="Ver Detalhes" className="rounded-none p-2 text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleEdit(item)} title="Editar" className="rounded-none p-2 text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDeleteClick(item.id)} title="Excluir" className="rounded-none p-2 text-muted-foreground transition-all hover:bg-destructive/10 hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!internalLoading && totalPages > 1 && (
          <div className="flex flex-col gap-3 border-t border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
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

      <ConfirmDeleteModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        loading={isDeleting}
      />
    </div>
  );
};

export default CrudPage;