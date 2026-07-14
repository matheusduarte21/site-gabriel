import {
    type ReactNode,
    useEffect,
    useMemo,
    useState,
} from "react";
import {
    Building2,
    Calendar,
    CheckCircle,
    ClipboardList,
    Clock,
    DollarSign,
    Loader2,
    MapPin,
    TrendingUp,
    Upload, 
    Wallet,
} from "lucide-react";
import {
    Chamado,
    emptyChamado,
} from "../../types/chamado.type";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select";
import { Checkbox } from "../ui/checkbox";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/Button";
import { uploadDocumento } from "../../services/Chamados/uplodate-chamados.service";
import { showError } from "../../lib/Utils/toast";

export type SelectOption = {
    value: string | number;
    label: string;
};

type ChamadoFormProps = {
    initialData?: Chamado | null;
    onSubmit: (
        chamado: Chamado
    ) => void | Promise<void>;
    onCancel: () => void;
    tecnicosOptions?: SelectOption[];
    clientesOptions?: SelectOption[];
    statusOptions?: SelectOption[];
};

interface SecaoProps {
    titulo: string;
    descricao?: string;
    icone: ReactNode;
    children: ReactNode;
    className?: string;
}

interface CampoMoedaProps {
    id: string;
    label: string;
    value: number | string | null | undefined;
    onChange: (value: string) => void;
    tipo: "cliente" | "tecnico";
}

interface CardResumoProps {
    titulo: string;
    valor: string;
    icone: ReactNode;
    tipo: "cliente" | "tecnico" | "lucro" | "prejuizo";
}

const formatadorMoeda = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
});

const converterNumero = (
    valor: number | string | null | undefined
): number => {
    if (
        valor === null ||
        valor === undefined ||
        valor === ""
    ) {
        return 0;
    }

    if (typeof valor === "number") {
        return Number.isFinite(valor) ? valor : 0;
    }

    const valorNormalizado = valor
        .trim()
        .replace(/\s/g, "")
        .replace(/\.(?=\d{3}(?:\D|$))/g, "")
        .replace(",", ".");

    const numero = Number(valorNormalizado);

    return Number.isFinite(numero) ? numero : 0;
};

const formatarMoeda = (valor: number): string => {
    return formatadorMoeda.format(valor);
};

const Secao = ({
    titulo,
    descricao,
    icone,
    children,
    className = "",
}: SecaoProps) => {
    return (
        <section
            className={`rounded-xl border border-border bg-card p-5 shadow-sm ${className}`}
        >
            <div className="mb-5 flex items-start gap-3 border-b border-border pb-4">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    {icone}
                </span>

                <div>
                    <h3 className="text-sm font-bold text-foreground">
                        {titulo}
                    </h3>

                    {descricao && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                            {descricao}
                        </p>
                    )}
                </div>
            </div>

            {children}
        </section>
    );
};

const CampoMoeda = ({
    id,
    label,
    value,
    onChange,
    tipo,
}: CampoMoedaProps) => {
    const classes =
        tipo === "cliente"
            ? "focus-visible:ring-indigo-500"
            : "focus-visible:ring-amber-500";

    const prefixo =
        tipo === "cliente"
            ? "text-indigo-600"
            : "text-amber-600";

    return (
        <div className="space-y-1.5">
            <Label htmlFor={id}>{label}</Label>

            <div className="relative">
                <span
                    className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold ${prefixo}`}
                >
                    R$
                </span>

                <Input
                    id={id}
                    type="number"
                    min="0"
                    step="0.01"
                    inputMode="decimal"
                    value={value ?? ""}
                    onChange={(event) =>
                        onChange(event.target.value)
                    }
                    placeholder="0,00"
                    className={`pl-10 ${classes}`}
                />
            </div>
        </div>
    );
};

const CardResumo = ({
    titulo,
    valor,
    icone,
    tipo,
}: CardResumoProps) => {
    const classes = {
        cliente:
            "border-indigo-200 bg-indigo-50 text-indigo-700",
        tecnico:
            "border-amber-200 bg-amber-50 text-amber-700",
        lucro:
            "border-emerald-200 bg-emerald-50 text-emerald-700",
        prejuizo:
            "border-red-200 bg-red-50 text-red-700",
    };

    return (
        <div
            className={`rounded-xl border p-4 ${classes[tipo]}`}
        >
            <div className="flex items-center gap-2">
                {icone}

                <p className="text-xs font-bold uppercase tracking-wide">
                    {titulo}
                </p>
            </div>

            <p className="mt-2 text-xl font-bold">
                {valor}
            </p>
        </div>
    );
};

const ChamadoForm = ({
    initialData,
    onSubmit,
    onCancel,
    tecnicosOptions = [],
    clientesOptions = [],
    statusOptions = [],
}: ChamadoFormProps) => {
    const [form, setForm] = useState<Chamado>(() => ({
        ...(initialData ?? emptyChamado),
    }));

    const [isUploading, setIsUploading] =
        useState(false);

    const [isSubmitting, setIsSubmitting] =
        useState(false);

    useEffect(() => {
        setForm({
            ...(initialData ?? emptyChamado),
        });
    }, [initialData]);

    const totalCliente = useMemo(() => {
        return (
            converterNumero(
                form.valor_chamado_cliente
            ) +
            converterNumero(
                form.hora_extra_cliente
            ) +
            converterNumero(
                form.deslocamento_cliente
            ) +
            converterNumero(
                form.reembolso_cliente
            )
        );
    }, [
        form.valor_chamado_cliente,
        form.hora_extra_cliente,
        form.deslocamento_cliente,
        form.reembolso_cliente,
    ]);

    const totalTecnico = useMemo(() => {
        return (
            converterNumero(
                form.valor_chamado_tecnico
            ) +
            converterNumero(
                form.hora_extra_tecnico
            ) +
            converterNumero(
                form.deslocamento_tecnico
            ) +
            converterNumero(
                form.reembolso_tecnico
            )
        );
    }, [
        form.valor_chamado_tecnico,
        form.hora_extra_tecnico,
        form.deslocamento_tecnico,
        form.reembolso_tecnico,
    ]);

    const lucro = totalCliente - totalTecnico;

    const handleChange = (
        field: keyof Chamado,
        value: string | boolean | number | null
    ) => {
        setForm((estadoAtual) => ({
            ...estadoAtual,
            [field]: value,
        }));
    };

    const handleFileChange = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        try {
            setIsUploading(true);

            const fileUrl =
                await uploadDocumento(file);

            handleChange("url_arquivo", fileUrl);
        } catch (error) {
            console.error(error);

            showError(
                "Erro ao fazer upload do arquivo."
            );
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (
        event: React.FormEvent
    ) => {
        event.preventDefault();

        if (!form.hora_agendamento) {
            showError(
                "A hora do agendamento é obrigatória!"
            );

            return;
        }

        const dadosLimpos: Chamado = {
            ...form,
            hora_total: form.hora_total || null,
            hora_extra: form.hora_extra || null,
            valor_total_cliente: totalCliente,
            valor_total_tecnico: totalTecnico,
        };

        try {
            setIsSubmitting(true);

            await onSubmit(dadosLimpos);
        } finally {
            setIsSubmitting(false);
        }
    };

    const bloqueado =
        isUploading || isSubmitting;

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-6 pt-2"
        >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <CardResumo
                    titulo="Valor faturado"
                    valor={formatarMoeda(totalCliente)}
                    icone={
                        <DollarSign className="h-4 w-4" />
                    }
                    tipo="cliente"
                />

                <CardResumo
                    titulo="Valor pago"
                    valor={formatarMoeda(totalTecnico)}
                    icone={
                        <Wallet className="h-4 w-4" />
                    }
                    tipo="tecnico"
                />

                <CardResumo
                    titulo={
                        lucro >= 0
                            ? "Lucro da operação"
                            : "Prejuízo da operação"
                    }
                    valor={formatarMoeda(lucro)}
                    icone={
                        <TrendingUp className="h-4 w-4" />
                    }
                    tipo={
                        lucro >= 0
                            ? "lucro"
                            : "prejuizo"
                    }
                />
            </div>

            <Secao
                titulo="Informações principais"
                descricao="Identificação, empresa e responsáveis pelo chamado"
                icone={
                    <ClipboardList className="h-5 w-5" />
                }
            >
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="space-y-1.5">
                        <Label htmlFor="numero_chamado">
                            Número do chamado
                        </Label>

                        <Input
                            id="numero_chamado"
                            value={
                                form.numero_chamado ?? ""
                            }
                            onChange={(event) =>
                                handleChange(
                                    "numero_chamado",
                                    event.target.value
                                )
                            }
                            placeholder="Ex.: CH-001"
                            required
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="empresa">
                            Empresa
                        </Label>

                        <div className="relative">
                            <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                            <Input
                                id="empresa"
                                value={form.empresa ?? ""}
                                onChange={(event) =>
                                    handleChange(
                                        "empresa",
                                        event.target.value
                                    )
                                }
                                placeholder="Nome da empresa"
                                className="pl-10"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="status_id">
                            Status
                        </Label>

                        <Select
                            value={
                                form.status_id
                                    ? String(
                                          form.status_id
                                      )
                                    : ""
                            }
                            onValueChange={(value) =>
                                handleChange(
                                    "status_id",
                                    value
                                )
                            }
                        >
                            <SelectTrigger id="status_id">
                                <SelectValue placeholder="Selecione o status" />
                            </SelectTrigger>

                            <SelectContent>
                                {statusOptions.map(
                                    (status) => (
                                        <SelectItem
                                            key={
                                                status.value
                                            }
                                            value={String(
                                                status.value
                                            )}
                                        >
                                            {status.label}
                                        </SelectItem>
                                    )
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="tecnico_id">
                            Técnico
                        </Label>

                        <Select
                            value={
                                form.tecnico_id
                                    ? String(
                                          form.tecnico_id
                                      )
                                    : ""
                            }
                            onValueChange={(value) =>
                                handleChange(
                                    "tecnico_id",
                                    value
                                )
                            }
                        >
                            <SelectTrigger id="tecnico_id">
                                <SelectValue placeholder="Selecione um técnico" />
                            </SelectTrigger>

                            <SelectContent>
                                {tecnicosOptions.map(
                                    (tecnico) => (
                                        <SelectItem
                                            key={
                                                tecnico.value
                                            }
                                            value={String(
                                                tecnico.value
                                            )}
                                        >
                                            {tecnico.label}
                                        </SelectItem>
                                    )
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="cliente_id">
                            Cliente
                        </Label>

                        <Select
                            value={
                                form.cliente_id
                                    ? String(
                                          form.cliente_id
                                      )
                                    : ""
                            }
                            onValueChange={(value) =>
                                handleChange(
                                    "cliente_id",
                                    value
                                )
                            }
                        >
                            <SelectTrigger id="cliente_id">
                                <SelectValue placeholder="Selecione um cliente" />
                            </SelectTrigger>

                            <SelectContent>
                                {clientesOptions.map(
                                    (cliente) => (
                                        <SelectItem
                                            key={
                                                cliente.value
                                            }
                                            value={String(
                                                cliente.value
                                            )}
                                        >
                                            {cliente.label}
                                        </SelectItem>
                                    )
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1.5">
                        <Label>
                            Tipo de atendimento
                        </Label>

                        <div className="flex h-10 items-center gap-3 rounded-md border border-input bg-background px-3">
                            <Checkbox
                                id="retorno"
                                checked={
                                    form.retorno ?? false
                                }
                                onCheckedChange={(
                                    checked
                                ) =>
                                    handleChange(
                                        "retorno",
                                        checked === true
                                    )
                                }
                            />

                            <Label
                                htmlFor="retorno"
                                className="cursor-pointer font-normal"
                            >
                                Chamado de retorno
                            </Label>
                        </div>
                    </div>
                </div>
            </Secao>

            <Secao
                titulo="Localização e documentos"
                descricao="Endereço, observações e arquivos relacionados"
                icone={
                    <MapPin className="h-5 w-5" />
                }
            >
                <div className="space-y-5">
                    <div className="space-y-1.5">
                        <Label htmlFor="endereco">
                            Endereço
                        </Label>

                        <div className="relative">
                            <MapPin className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

                            <Input
                                id="endereco"
                                value={
                                    form.endereco ?? ""
                                }
                                onChange={(event) =>
                                    handleChange(
                                        "endereco",
                                        event.target.value
                                    )
                                }
                                placeholder="Endereço completo do atendimento"
                                className="pl-10"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="observacoes">
                            Observações
                        </Label>

                        <Textarea
                            id="observacoes"
                            value={
                                form.observacoes ?? ""
                            }
                            onChange={(event) =>
                                handleChange(
                                    "observacoes",
                                    event.target.value
                                )
                            }
                            placeholder="Informações adicionais sobre o chamado"
                            rows={4}
                            className="resize-none"
                        />
                    </div>

                    <div className="rounded-lg border border-dashed border-border bg-muted/20 p-4">
                        <div className="flex items-start gap-3">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                <Upload className="h-4 w-4" />
                            </span>

                            <div className="min-w-0 flex-1">
                                <Label htmlFor="arquivo_upload">
                                    Documento ou comprovante
                                </Label>

                                <p className="mb-3 mt-0.5 text-xs text-muted-foreground">
                                    Selecione um arquivo relacionado ao chamado.
                                </p>

                                <Input
                                    id="arquivo_upload"
                                    type="file"
                                    onChange={
                                        handleFileChange
                                    }
                                    disabled={
                                        isUploading
                                    }
                                    className="cursor-pointer file:mr-3 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-blue-700"
                                />

                                {isUploading && (
                                    <div className="mt-3 flex items-center gap-2 text-sm font-medium text-blue-600">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Enviando arquivo...
                                    </div>
                                )}

                                {!isUploading &&
                                    form.url_arquivo && (
                                        <div className="mt-3 flex items-center gap-2 text-sm font-medium text-emerald-600">
                                            <CheckCircle className="h-4 w-4" />
                                            Arquivo anexado com sucesso
                                        </div>
                                    )}
                            </div>
                        </div>
                    </div>
                </div>
            </Secao>

            <Secao
                titulo="Agendamento e horários"
                descricao="Data e controle do período de atendimento"
                icone={
                    <Calendar className="h-5 w-5" />
                }
            >
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="space-y-1.5">
                        <Label htmlFor="data_agendamento">
                            Data do agendamento
                        </Label>

                        <Input
                            id="data_agendamento"
                            type="date"
                            value={
                                form.data_agendamento ??
                                ""
                            }
                            onChange={(event) =>
                                handleChange(
                                    "data_agendamento",
                                    event.target.value
                                )
                            }
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="hora_agendamento">
                            Hora do agendamento{" "}
                            <span className="text-destructive">
                                *
                            </span>
                        </Label>

                        <Input
                            id="hora_agendamento"
                            type="time"
                            value={
                                form.hora_agendamento ??
                                ""
                            }
                            onChange={(event) =>
                                handleChange(
                                    "hora_agendamento",
                                    event.target.value
                                )
                            }
                            required
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="hora_chegada">
                            Hora de chegada
                        </Label>

                        <Input
                            id="hora_chegada"
                            type="time"
                            value={
                                form.hora_chegada ?? ""
                            }
                            onChange={(event) =>
                                handleChange(
                                    "hora_chegada",
                                    event.target.value
                                )
                            }
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="hora_inicio">
                            Hora de início
                        </Label>

                        <Input
                            id="hora_inicio"
                            type="time"
                            value={
                                form.hora_inicio ?? ""
                            }
                            onChange={(event) =>
                                handleChange(
                                    "hora_inicio",
                                    event.target.value
                                )
                            }
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="hora_fim">
                            Hora de término
                        </Label>

                        <Input
                            id="hora_fim"
                            type="time"
                            value={form.hora_fim ?? ""}
                            onChange={(event) =>
                                handleChange(
                                    "hora_fim",
                                    event.target.value
                                )
                            }
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="hora_total_str">
                            Tempo total
                        </Label>

                        <div className="relative">
                            <Clock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                            <Input
                                id="hora_total_str"
                                type="time"
                                value={
                                    form.hora_total_str ??
                                    ""
                                }
                                onChange={(event) =>
                                    handleChange(
                                        "hora_total_str",
                                        event.target.value
                                    )
                                }
                                className="pl-10"
                            />
                        </div>
                    </div>
                </div>
            </Secao>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <section className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-5 shadow-sm">
                    <div className="mb-5 flex items-start gap-3 border-b border-indigo-200 pb-4">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
                            <DollarSign className="h-5 w-5" />
                        </span>

                        <div>
                            <h3 className="text-sm font-bold text-indigo-700">
                                Valores cobrados do cliente
                            </h3>

                            <p className="mt-0.5 text-xs text-indigo-600/80">
                                Valores que compõem o faturamento do chamado
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <CampoMoeda
                            id="valor_chamado_cliente"
                            label="Valor do chamado"
                            value={
                                form.valor_chamado_cliente
                            }
                            onChange={(value) =>
                                handleChange(
                                    "valor_chamado_cliente",
                                    value
                                )
                            }
                            tipo="cliente"
                        />

                        <CampoMoeda
                            id="hora_extra_cliente"
                            label="Hora extra"
                            value={
                                form.hora_extra_cliente
                            }
                            onChange={(value) =>
                                handleChange(
                                    "hora_extra_cliente",
                                    value
                                )
                            }
                            tipo="cliente"
                        />

                        <CampoMoeda
                            id="deslocamento_cliente"
                            label="Deslocamento"
                            value={
                                form.deslocamento_cliente
                            }
                            onChange={(value) =>
                                handleChange(
                                    "deslocamento_cliente",
                                    value
                                )
                            }
                            tipo="cliente"
                        />

                        <CampoMoeda
                            id="reembolso_cliente"
                            label="Reembolso"
                            value={
                                form.reembolso_cliente
                            }
                            onChange={(value) =>
                                handleChange(
                                    "reembolso_cliente",
                                    value
                                )
                            }
                            tipo="cliente"
                        />

                        <div className="sm:col-span-2">
                            <div className="rounded-lg border border-indigo-200 bg-indigo-100/70 p-4">
                                <p className="text-xs font-bold uppercase tracking-wide text-indigo-600">
                                    Total faturado
                                </p>

                                <p className="mt-1 text-2xl font-bold text-indigo-700">
                                    {formatarMoeda(
                                        totalCliente
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="rounded-xl border border-amber-200 bg-amber-50/40 p-5 shadow-sm">
                    <div className="mb-5 flex items-start gap-3 border-b border-amber-200 pb-4">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                            <Wallet className="h-5 w-5" />
                        </span>

                        <div>
                            <h3 className="text-sm font-bold text-amber-700">
                                Valores repassados ao técnico
                            </h3>

                            <p className="mt-0.5 text-xs text-amber-600/80">
                                Custos e pagamentos relacionados ao atendimento
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <CampoMoeda
                            id="valor_chamado_tecnico"
                            label="Valor do chamado"
                            value={
                                form.valor_chamado_tecnico
                            }
                            onChange={(value) =>
                                handleChange(
                                    "valor_chamado_tecnico",
                                    value
                                )
                            }
                            tipo="tecnico"
                        />

                        <CampoMoeda
                            id="hora_extra_tecnico"
                            label="Hora extra"
                            value={
                                form.hora_extra_tecnico
                            }
                            onChange={(value) =>
                                handleChange(
                                    "hora_extra_tecnico",
                                    value
                                )
                            }
                            tipo="tecnico"
                        />

                        <CampoMoeda
                            id="deslocamento_tecnico"
                            label="Deslocamento"
                            value={
                                form.deslocamento_tecnico
                            }
                            onChange={(value) =>
                                handleChange(
                                    "deslocamento_tecnico",
                                    value
                                )
                            }
                            tipo="tecnico"
                        />

                        <CampoMoeda
                            id="reembolso_tecnico"
                            label="Reembolso"
                            value={
                                form.reembolso_tecnico
                            }
                            onChange={(value) =>
                                handleChange(
                                    "reembolso_tecnico",
                                    value
                                )
                            }
                            tipo="tecnico"
                        />

                        <div className="sm:col-span-2">
                            <div className="rounded-lg border border-amber-200 bg-amber-100/70 p-4">
                                <p className="text-xs font-bold uppercase tracking-wide text-amber-600">
                                    Total pago
                                </p>

                                <p className="mt-1 text-2xl font-bold text-amber-700">
                                    {formatarMoeda(
                                        totalTecnico
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            <section
                className={`rounded-xl border p-5 shadow-sm ${
                    lucro >= 0
                        ? "border-emerald-200 bg-emerald-50"
                        : "border-red-200 bg-red-50"
                }`}
            >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <span
                            className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                                lucro >= 0
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-red-100 text-red-700"
                            }`}
                        >
                            <TrendingUp className="h-5 w-5" />
                        </span>

                        <div>
                            <p
                                className={`text-xs font-bold uppercase tracking-wide ${
                                    lucro >= 0
                                        ? "text-emerald-600"
                                        : "text-red-600"
                                }`}
                            >
                                Resultado da operação
                            </p>

                            <p className="mt-0.5 text-sm text-muted-foreground">
                                Faturamento menos o valor pago ao técnico
                            </p>
                        </div>
                    </div>

                    <div className="text-left sm:text-right">
                        <p
                            className={`text-2xl font-bold ${
                                lucro >= 0
                                    ? "text-emerald-700"
                                    : "text-red-700"
                            }`}
                        >
                            {formatarMoeda(lucro)}
                        </p>

                        <p
                            className={`text-xs font-semibold ${
                                lucro >= 0
                                    ? "text-emerald-600"
                                    : "text-red-600"
                            }`}
                        >
                            {lucro >= 0
                                ? "Lucro estimado"
                                : "Prejuízo estimado"}
                        </p>
                    </div>
                </div>
            </section>

            <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={bloqueado}
                    className="sm:min-w-[120px]"
                >
                    Cancelar
                </Button>

                <Button
                    type="submit"
                    disabled={bloqueado}
                    className="gap-2 shadow-sm sm:min-w-[170px]"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Salvando...
                        </>
                    ) : (
                        <>
                            <CheckCircle className="h-4 w-4" />
                            {initialData
                                ? "Atualizar chamado"
                                : "Salvar chamado"}
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
};

export default ChamadoForm;