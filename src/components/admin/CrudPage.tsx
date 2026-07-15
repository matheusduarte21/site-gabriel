import {
    type ReactNode,
    useEffect,
    useMemo,
    useState,
} from "react";
import {
    ChevronLeft,
    ChevronRight,
    ClipboardList,
    Eye,
    FileText,
    Inbox,
    Info,
    Loader2,
    Pencil,
    Plus,
    Save,
    Search,
    Trash2,
    X,
} from "lucide-react";
import { Button } from "../ui/Button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "../ui/dialog";
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
    topContent?: ReactNode;
    onDelete?: (
        id: string | number
    ) => Promise<void> | void;
    onSave?: (
        data: any
    ) => Promise<void> | void;
    CustomForm?: (
        props: any
    ) => ReactNode;
};

const ITEMS_PER_PAGE = 5;

const obterValorSelect = (
    column: Column,
    value: unknown
): ReactNode => {
    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return "---";
    }

    if (column.type === "select") {
        const option =
            column.options?.find(
                (item) =>
                    String(item.value) ===
                    String(value)
            );

        return (
            option?.label ??
            String(value)
        );
    }

    return value as ReactNode;
};

const obterValorPesquisa = (
    item: CrudItem,
    column: Column
): string => {
    const value = item[column.key];

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return "";
    }

    if (column.type === "select") {
        const option =
            column.options?.find(
                (itemOption) =>
                    String(
                        itemOption.value
                    ) === String(value)
            );

        return (
            option?.label ??
            String(value)
        );
    }

    if (
        typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean"
    ) {
        return String(value);
    }

    return "";
};

const obterEstiloDetalhe = (
    key: string
): string => {
    const campo = key.toLowerCase();

    if (campo.includes("lucro")) {
        return "border-emerald-200 bg-emerald-50/70";
    }

    if (
        campo.includes(
            "valor_tecnico"
        ) ||
        campo.includes(
            "tecnico_formatado"
        ) ||
        campo.includes("pago")
    ) {
        return "border-amber-200 bg-amber-50/70";
    }

    if (
        campo.includes(
            "valor_cliente"
        ) ||
        campo.includes(
            "cliente_formatado"
        ) ||
        campo.includes("faturado")
    ) {
        return "border-indigo-200 bg-indigo-50/70";
    }

    if (campo.includes("status")) {
        return "border-blue-200 bg-blue-50/60";
    }

    return "border-border bg-background";
};

const obterEstiloValor = (
    key: string
): string => {
    const campo = key.toLowerCase();

    if (campo.includes("lucro")) {
        return "text-emerald-700";
    }

    if (
        campo.includes(
            "valor_tecnico"
        ) ||
        campo.includes(
            "tecnico_formatado"
        ) ||
        campo.includes("pago")
    ) {
        return "text-amber-700";
    }

    if (
        campo.includes(
            "valor_cliente"
        ) ||
        campo.includes(
            "cliente_formatado"
        ) ||
        campo.includes("faturado")
    ) {
        return "text-indigo-700";
    }

    if (campo.includes("status")) {
        return "text-blue-700";
    }

    return "text-foreground";
};

const CrudPage = ({
    title,
    subtitle,
    columns,
    initialData,
    isLoading = false,
    CustomForm,
    modalMaxWidth = "max-w-lg",
    topContent,
    onDelete,
    onSave,
}: CrudPageProps) => {
    const [items, setItems] =
        useState<CrudItem[]>(
            initialData
        );

    const [search, setSearch] =
        useState("");

    const [
        editingId,
        setEditingId,
    ] = useState<
        string | number | null
    >(null);

    const [
        formData,
        setFormData,
    ] = useState<
        Record<string, any>
    >({});

    const [
        showForm,
        setShowForm,
    ] = useState(false);

    const [
        currentPage,
        setCurrentPage,
    ] = useState(1);

    const [
        isDeleteModalOpen,
        setIsDeleteModalOpen,
    ] = useState(false);

    const [
        itemToDelete,
        setItemToDelete,
    ] = useState<
        string | number | null
    >(null);

    const [
        isDeleting,
        setIsDeleting,
    ] = useState(false);

    const [
        showDetailsModal,
        setShowDetailsModal,
    ] = useState(false);

    const [
        selectedItem,
        setSelectedItem,
    ] = useState<CrudItem | null>(
        null
    );

    const [
        isSaving,
        setIsSaving,
    ] = useState(false);

    const [
        internalLoading,
        setInternalLoading,
    ] = useState(true);

    useEffect(() => {
        setItems(initialData);
        setCurrentPage(1);
    }, [initialData]);

    useEffect(() => {
        setCurrentPage(1);
    }, [search]);

    useEffect(() => {
        if (isLoading) {
            setInternalLoading(true);
            return;
        }

        const timer =
            window.setTimeout(() => {
                setInternalLoading(false);
            }, 500);

        return () => {
            window.clearTimeout(timer);
        };
    }, [isLoading]);

    const filtered = useMemo(() => {
        const pesquisaNormalizada =
            search
                .trim()
                .toLowerCase();

        if (!pesquisaNormalizada) {
            return items;
        }

        return items.filter((item) =>
            columns.some((column) =>
                obterValorPesquisa(
                    item,
                    column
                )
                    .toLowerCase()
                    .includes(
                        pesquisaNormalizada
                    )
            )
        );
    }, [items, columns, search]);

    const totalPages = Math.ceil(
        filtered.length /
            ITEMS_PER_PAGE
    );

    const paginaAtualValida =
        totalPages > 0
            ? Math.min(
                  currentPage,
                  totalPages
              )
            : 1;

    const startIndex =
        (paginaAtualValida - 1) *
        ITEMS_PER_PAGE;

    const endIndex =
        startIndex +
        ITEMS_PER_PAGE;

    const paginatedItems =
        filtered.slice(
            startIndex,
            endIndex
        );

    useEffect(() => {
        if (
            totalPages > 0 &&
            currentPage > totalPages
        ) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    const handleEdit = (
        item: CrudItem
    ) => {
        setEditingId(item.id);
        setFormData({ ...item });
        setShowForm(true);
    };

    const handleNew = () => {
        setEditingId(null);
        setFormData({});
        setShowForm(true);
    };

    const closeForm = () => {
        if (isSaving) {
            return;
        }

        setShowForm(false);
        setEditingId(null);
        setFormData({});
    };

    const handleSaveDefault =
        async () => {
            try {
                setIsSaving(true);

                const dataToSave =
                    editingId !== null
                        ? {
                              id: editingId,
                              ...formData,
                          }
                        : formData;

                if (onSave) {
                    await onSave(
                        dataToSave
                    );
                } else if (
                    editingId !== null
                ) {
                    setItems(
                        (
                            currentItems
                        ) =>
                            currentItems.map(
                                (item) =>
                                    item.id ===
                                    editingId
                                        ? {
                                              ...item,
                                              ...formData,
                                          }
                                        : item
                            )
                    );
                } else {
                    setItems(
                        (
                            currentItems
                        ) => [
                            ...currentItems,
                            {
                                id: crypto.randomUUID(),
                                ...formData,
                            },
                        ]
                    );
                }

                setShowForm(false);
                setEditingId(null);
                setFormData({});
            } catch (error) {
                console.error(
                    "Erro ao salvar registro:",
                    error
                );
            } finally {
                setIsSaving(false);
            }
        };

    const handleDeleteClick = (
        id: string | number
    ) => {
        setItemToDelete(id);
        setIsDeleteModalOpen(
            true
        );
    };

    const confirmDelete =
        async () => {
            if (
                itemToDelete === null
            ) {
                return;
            }

            try {
                setIsDeleting(true);

                if (onDelete) {
                    await onDelete(
                        itemToDelete
                    );
                }

                setItems(
                    (
                        currentItems
                    ) =>
                        currentItems.filter(
                            (item) =>
                                item.id !==
                                itemToDelete
                        )
                );

                if (
                    paginatedItems.length ===
                        1 &&
                    currentPage > 1
                ) {
                    setCurrentPage(
                        (
                            currentPageValue
                        ) =>
                            currentPageValue -
                            1
                    );
                }
            } catch (error) {
                console.error(
                    "Erro ao excluir registro:",
                    error
                );
            } finally {
                setIsDeleting(false);
                setIsDeleteModalOpen(
                    false
                );
                setItemToDelete(null);
            }
        };

    const handleViewDetails = (
        item: CrudItem
    ) => {
        setSelectedItem(item);
        setShowDetailsModal(true);
    };

    const closeDetails = () => {
        setShowDetailsModal(false);
        setSelectedItem(null);
    };

    const handleOpenDocument = (
        url: string
    ) => {
        window.open(
            url,
            "_blank",
            "noopener,noreferrer"
        );
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    {title}
                </h1>

                {subtitle && (
                    <p className="mt-1 text-sm text-muted-foreground">
                        {subtitle}
                    </p>
                )}
            </div>

            {topContent}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative max-w-sm flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                    <input
                        type="text"
                        placeholder="Pesquisar registros"
                        value={search}
                        onChange={(
                            event
                        ) =>
                            setSearch(
                                event
                                    .target
                                    .value
                            )
                        }
                        className="w-full rounded-xl border border-input bg-card py-2.5 pl-10 pr-10 text-sm text-foreground shadow-sm outline-none transition-all placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/10"
                    />

                    {search && (
                        <button
                            type="button"
                            onClick={() =>
                                setSearch("")
                            }
                            aria-label="Limpar pesquisa"
                            className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    )}
                </div>

                <Button
                    type="button"
                    onClick={handleNew}
                    className="gap-2 rounded-lg shadow-sm"
                >
                    <Plus className="h-4 w-4" />
                    Novo registro
                </Button>
            </div>

            <Dialog
                open={showForm}
                onOpenChange={(
                    open
                ) => {
                    if (
                        !open &&
                        !isSaving
                    ) {
                        closeForm();
                    }
                }}
            >
                <DialogContent
                    className={`${modalMaxWidth} max-h-[92vh] overflow-hidden rounded-xl border border-border bg-card p-0 shadow-2xl`}
                >
                    <div className="flex max-h-[92vh] flex-col">
                        <DialogHeader className="border-b border-border bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-5 pr-12 dark:from-blue-950/40 dark:to-indigo-950/40">
                            <div className="flex items-start gap-3">
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-200 bg-blue-100 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300">
                                    {editingId !==
                                    null ? (
                                        <Pencil className="h-5 w-5" />
                                    ) : (
                                        <Plus className="h-5 w-5" />
                                    )}
                                </span>

                                <div>
                                    <DialogTitle className="text-lg font-bold text-foreground">
                                        {editingId !==
                                        null
                                            ? "Editar registro"
                                            : "Novo registro"}
                                    </DialogTitle>

                                    <DialogDescription className="mt-1 text-sm leading-5 text-muted-foreground">
                                        {editingId !==
                                        null
                                            ? "Atualize as informações necessárias e confirme as alterações."
                                            : "Preencha os campos abaixo para cadastrar um novo registro."}
                                    </DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>

                        <div className="min-h-0 flex-1 overflow-y-auto bg-muted/10 px-6 py-5">
                            {CustomForm ? (
                                <CustomForm
                                    initialData={
                                        editingId !==
                                        null
                                            ? items.find(
                                                  (
                                                      item
                                                  ) =>
                                                      item.id ===
                                                      editingId
                                              ) ??
                                              null
                                            : null
                                    }
                                    onCancel={
                                        closeForm
                                    }
                                    onSubmit={async (
                                        data: any
                                    ) => {
                                        try {
                                            setIsSaving(
                                                true
                                            );

                                            if (
                                                onSave
                                            ) {
                                                await onSave(
                                                    data
                                                );
                                            }

                                            setShowForm(
                                                false
                                            );
                                            setEditingId(
                                                null
                                            );
                                            setFormData(
                                                {}
                                            );
                                        } finally {
                                            setIsSaving(
                                                false
                                            );
                                        }
                                    }}
                                />
                            ) : (
                                <div className="space-y-6">
                                    <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
                                        <div className="mb-5 flex items-start gap-3 border-b border-border pb-4">
                                            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300">
                                                <ClipboardList className="h-4 w-4" />
                                            </span>

                                            <div>
                                                <h3 className="text-sm font-bold text-foreground">
                                                    Informações
                                                    do
                                                    registro
                                                </h3>

                                                <p className="mt-0.5 text-xs text-muted-foreground">
                                                    Preencha
                                                    os campos
                                                    necessários.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                            {columns.map(
                                                (
                                                    column
                                                ) => (
                                                    <div
                                                        key={
                                                            column.key
                                                        }
                                                        className="space-y-1.5"
                                                    >
                                                        <label
                                                            htmlFor={`crud-${column.key}`}
                                                            className="block text-sm font-medium text-foreground"
                                                        >
                                                            {
                                                                column.label
                                                            }
                                                        </label>

                                                        {column.type ===
                                                        "select" ? (
                                                            <select
                                                                id={`crud-${column.key}`}
                                                                value={
                                                                    formData[
                                                                        column
                                                                            .key
                                                                    ] ??
                                                                    ""
                                                                }
                                                                onChange={(
                                                                    event
                                                                ) =>
                                                                    setFormData(
                                                                        (
                                                                            currentForm
                                                                        ) => ({
                                                                            ...currentForm,
                                                                            [column.key]:
                                                                                event
                                                                                    .target
                                                                                    .value,
                                                                        })
                                                                    )
                                                                }
                                                                className="h-10 w-full appearance-none rounded-lg border border-input bg-background px-3.5 text-sm text-foreground shadow-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
                                                            >
                                                                <option
                                                                    value=""
                                                                    disabled
                                                                >
                                                                    Selecione{" "}
                                                                    {column.label.toLowerCase()}
                                                                </option>

                                                                {column.options?.map(
                                                                    (
                                                                        option
                                                                    ) => (
                                                                        <option
                                                                            key={
                                                                                option.value
                                                                            }
                                                                            value={
                                                                                option.value
                                                                            }
                                                                        >
                                                                            {
                                                                                option.label
                                                                            }
                                                                        </option>
                                                                    )
                                                                )}
                                                            </select>
                                                        ) : (
                                                            <input
                                                                id={`crud-${column.key}`}
                                                                type="text"
                                                                value={
                                                                    formData[
                                                                        column
                                                                            .key
                                                                    ] ??
                                                                    ""
                                                                }
                                                                onChange={(
                                                                    event
                                                                ) =>
                                                                    setFormData(
                                                                        (
                                                                            currentForm
                                                                        ) => ({
                                                                            ...currentForm,
                                                                            [column.key]:
                                                                                event
                                                                                    .target
                                                                                    .value,
                                                                        })
                                                                    )
                                                                }
                                                                placeholder={`Digite ${column.label.toLowerCase()}`}
                                                                className="h-10 w-full rounded-lg border border-input bg-background px-3.5 text-sm text-foreground shadow-sm outline-none transition-all placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/10"
                                                            />
                                                        )}
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </section>

                                    <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={
                                                closeForm
                                            }
                                            disabled={
                                                isSaving
                                            }
                                            className="sm:min-w-[110px]"
                                        >
                                            Cancelar
                                        </Button>

                                        <Button
                                            type="button"
                                            onClick={
                                                handleSaveDefault
                                            }
                                            disabled={
                                                isSaving
                                            }
                                            className="gap-2 shadow-sm sm:min-w-[140px]"
                                        >
                                            {isSaving ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    Salvando...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="h-4 w-4" />

                                                    {editingId !==
                                                    null
                                                        ? "Atualizar"
                                                        : "Salvar"}
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog
                open={
                    showDetailsModal
                }
                onOpenChange={(
                    open
                ) => {
                    if (!open) {
                        closeDetails();
                    }
                }}
            >
                <DialogContent className="max-h-[90vh] max-w-3xl overflow-hidden rounded-xl border border-border bg-card p-0 shadow-2xl">
                    <div className="flex max-h-[90vh] flex-col">
                        <DialogHeader className="border-b border-border bg-gradient-to-r from-slate-50 to-blue-50 px-6 py-5 pr-12 dark:from-slate-950/40 dark:to-blue-950/40">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-start gap-3">
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-200 bg-blue-100 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300">
                                        <Info className="h-5 w-5" />
                                    </span>

                                    <div>
                                        <DialogTitle className="text-lg font-bold text-foreground">
                                            Detalhes
                                            do
                                            registro
                                        </DialogTitle>

                                        <DialogDescription className="mt-1 text-sm leading-5 text-muted-foreground">
                                            Consulte as
                                            informações
                                            completas do
                                            item
                                            selecionado.
                                        </DialogDescription>
                                    </div>
                                </div>

                                {selectedItem && (
                                    <span className="hidden max-w-[180px] truncate rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300 sm:block">
                                        ID:{" "}
                                        {String(
                                            selectedItem.id
                                        )}
                                    </span>
                                )}
                            </div>
                        </DialogHeader>

                        {selectedItem && (
                            <div className="min-h-0 flex-1 overflow-y-auto bg-muted/10 px-6 py-5">
                                <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
                                    <div className="mb-5 flex items-center gap-2 border-b border-border pb-4">
                                        <ClipboardList className="h-5 w-5 text-blue-600" />

                                        <h3 className="text-sm font-bold text-foreground">
                                            Informações
                                            cadastradas
                                        </h3>
                                    </div>

                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                        {columns.map(
                                            (
                                                column
                                            ) => {
                                                const value =
                                                    obterValorSelect(
                                                        column,
                                                        selectedItem[
                                                            column
                                                                .key
                                                        ]
                                                    );

                                                return (
                                                    <div
                                                        key={
                                                            column.key
                                                        }
                                                        className={`rounded-lg border p-4 ${obterEstiloDetalhe(
                                                            column.key
                                                        )}`}
                                                    >
                                                        <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                                                            {
                                                                column.label
                                                            }
                                                        </p>

                                                        <div
                                                            className={`mt-1.5 break-words text-sm font-semibold ${obterEstiloValor(
                                                                column.key
                                                            )}`}
                                                        >
                                                            {
                                                                value
                                                            }
                                                        </div>
                                                    </div>
                                                );
                                            }
                                        )}
                                    </div>
                                </section>

                                {selectedItem.url_arquivo && (
                                    <section className="mt-4 rounded-xl border border-blue-200 bg-blue-50/50 p-5 shadow-sm dark:border-blue-900 dark:bg-blue-950/30">
                                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                            <div className="flex items-start gap-3">
                                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                                                    <FileText className="h-5 w-5" />
                                                </span>

                                                <div>
                                                    <p className="text-sm font-bold text-blue-700 dark:text-blue-300">
                                                        Documento
                                                        anexado
                                                    </p>

                                                    <p className="mt-1 text-xs text-blue-700/80 dark:text-blue-300/80">
                                                        Existe
                                                        um
                                                        arquivo
                                                        associado
                                                        a este
                                                        registro.
                                                    </p>
                                                </div>
                                            </div>

                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="gap-2 border-blue-200 bg-white text-blue-700 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300"
                                                onClick={() =>
                                                    handleOpenDocument(
                                                        selectedItem.url_arquivo
                                                    )
                                                }
                                            >
                                                <FileText className="h-4 w-4" />
                                                Visualizar
                                                documento
                                            </Button>
                                        </div>
                                    </section>
                                )}

                                <div className="mt-5 flex justify-end border-t border-border pt-5">
                                    <Button
                                        type="button"
                                        onClick={
                                            closeDetails
                                        }
                                        className="min-w-[110px]"
                                    >
                                        Fechar
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-muted/30">
                            <tr className="border-b border-border">
                                {columns.map(
                                    (column) => (
                                        <th
                                            key={
                                                column.key
                                            }
                                            className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                                        >
                                            {
                                                column.label
                                            }
                                        </th>
                                    )
                                )}

                                <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Ações
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-border">
                            {internalLoading ? (
                                Array.from({
                                    length: ITEMS_PER_PAGE,
                                }).map(
                                    (
                                        _,
                                        rowIndex
                                    ) => (
                                        <tr
                                            key={
                                                rowIndex
                                            }
                                        >
                                            {columns.map(
                                                (
                                                    column
                                                ) => (
                                                    <td
                                                        key={
                                                            column.key
                                                        }
                                                        className="px-5 py-4"
                                                    >
                                                        <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                                                    </td>
                                                )
                                            )}

                                            <td className="px-5 py-4">
                                                <div className="ml-auto h-8 w-24 animate-pulse rounded-lg bg-muted" />
                                            </td>
                                        </tr>
                                    )
                                )
                            ) : paginatedItems.length ===
                              0 ? (
                                <tr>
                                    <td
                                        colSpan={
                                            columns.length +
                                            1
                                        }
                                        className="px-5 py-14 text-center"
                                    >
                                        <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                                            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                                                <Inbox className="h-6 w-6 opacity-40" />
                                            </span>

                                            <p className="mt-1 text-sm font-semibold text-foreground">
                                                Nenhum
                                                registro
                                                encontrado
                                            </p>

                                            <p className="text-xs">
                                                Ajuste
                                                sua
                                                pesquisa,
                                                o período
                                                selecionado
                                                ou
                                                adicione
                                                um novo
                                                registro.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedItems.map(
                                    (item) => (
                                        <tr
                                            key={
                                                item.id
                                            }
                                            className="transition-colors hover:bg-muted/30"
                                        >
                                            {columns.map(
                                                (
                                                    column
                                                ) => (
                                                    <td
                                                        key={
                                                            column.key
                                                        }
                                                        className="whitespace-nowrap px-5 py-4 text-sm text-foreground"
                                                    >
                                                        {obterValorSelect(
                                                            column,
                                                            item[
                                                                column
                                                                    .key
                                                            ]
                                                        )}
                                                    </td>
                                                )
                                            )}

                                            <td className="whitespace-nowrap px-5 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleViewDetails(
                                                                item
                                                            )
                                                        }
                                                        title="Ver detalhes"
                                                        aria-label="Ver detalhes"
                                                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-600 transition-all hover:bg-blue-600 hover:text-white dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleEdit(
                                                                item
                                                            )
                                                        }
                                                        title="Editar"
                                                        aria-label="Editar"
                                                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-amber-200 bg-amber-50 text-amber-600 transition-all hover:bg-amber-500 hover:text-white dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleDeleteClick(
                                                                item.id
                                                            )
                                                        }
                                                        title="Excluir"
                                                        aria-label="Excluir"
                                                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600 transition-all hover:bg-red-600 hover:text-white dark:border-red-900 dark:bg-red-950 dark:text-red-300"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                )
                            )}
                        </tbody>
                    </table>
                </div>

                {!internalLoading &&
                    filtered.length > 0 && (
                        <div className="flex flex-col gap-3 border-t border-border bg-card/50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                            <span className="text-sm text-muted-foreground">
                                Mostrando{" "}
                                <span className="font-medium text-foreground">
                                    {startIndex +
                                        1}
                                </span>{" "}
                                a{" "}
                                <span className="font-medium text-foreground">
                                    {Math.min(
                                        endIndex,
                                        filtered.length
                                    )}
                                </span>{" "}
                                de{" "}
                                <span className="font-medium text-foreground">
                                    {
                                        filtered.length
                                    }
                                </span>{" "}
                                resultados
                            </span>

                            {totalPages > 1 && (
                                <div className="flex items-center gap-1.5">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            setCurrentPage(
                                                (
                                                    current
                                                ) =>
                                                    Math.max(
                                                        1,
                                                        current -
                                                            1
                                                    )
                                            )
                                        }
                                        disabled={
                                            paginaAtualValida ===
                                            1
                                        }
                                        className="h-8 w-8 rounded-lg p-0"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>

                                    {Array.from(
                                        {
                                            length: totalPages,
                                        },
                                        (
                                            _,
                                            index
                                        ) =>
                                            index +
                                            1
                                    ).map(
                                        (page) => (
                                            <Button
                                                key={
                                                    page
                                                }
                                                type="button"
                                                variant={
                                                    page ===
                                                    paginaAtualValida
                                                        ? "default"
                                                        : "outline"
                                                }
                                                size="sm"
                                                onClick={() =>
                                                    setCurrentPage(
                                                        page
                                                    )
                                                }
                                                className="h-8 w-8 rounded-lg p-0 text-xs"
                                            >
                                                {
                                                    page
                                                }
                                            </Button>
                                        )
                                    )}

                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            setCurrentPage(
                                                (
                                                    current
                                                ) =>
                                                    Math.min(
                                                        totalPages,
                                                        current +
                                                            1
                                                    )
                                            )
                                        }
                                        disabled={
                                            paginaAtualValida ===
                                            totalPages
                                        }
                                        className="h-8 w-8 rounded-lg p-0"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
            </div>

            <ConfirmDeleteModal
                isOpen={
                    isDeleteModalOpen
                }
                onClose={() => {
                    if (!isDeleting) {
                        setIsDeleteModalOpen(
                            false
                        );
                        setItemToDelete(
                            null
                        );
                    }
                }}
                onConfirm={
                    confirmDelete
                }
                loading={isDeleting}
            />
        </div>
    );
};

export default CrudPage;