import {
    type ReactNode,
    useEffect,
    useMemo,
    useState,
} from "react";
import {
    AlertCircle,
    Briefcase,
    Building2,
    Calendar,
    CheckCircle,
    Clock,
    DollarSign,
    ExternalLink,
    FileText,
    Loader2,
    MapPin,
    Phone,
    RefreshCw,
    User,
    Wallet,
    Wrench,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "../ui/dialog";
import supabase from "../../lib/supabase";
import { Chamado } from "../../types/chamado.type";

type Relacionamento =
    | Record<string, unknown>
    | Record<string, unknown>[]
    | null
    | undefined;

type ChamadoDetalhado = Partial<Chamado> & {
    id: string;
    distancia?: string | number | null;
    data_retorno?: string | null;
    cliente?: Relacionamento;
    tecnico?: Relacionamento;
};

interface ChamadoDetalheModalProps {
    isOpen: boolean;
    onClose: () => void;
    chamadoId?: string | null;
    empresa?: string | null;
}

interface CampoProps {
    label: string;
    value: ReactNode;
    destaque?: boolean;
}

interface SecaoProps {
    titulo: string;
    icone: ReactNode;
    children: ReactNode;
    className?: string;
}

const formatadorMoeda = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
});

const converterNumero = (
    valor: number | string | null | undefined
): number => {
    if (valor === null || valor === undefined || valor === "") {
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

const formatarMoeda = (
    valor: number | string | null | undefined
): string => {
    return formatadorMoeda.format(converterNumero(valor));
};

const formatarData = (
    valor: string | null | undefined
): string => {
    if (!valor) {
        return "Não informado";
    }

    const dataSemHorario = valor.split("T")[0];
    const partes = dataSemHorario.split("-");

    if (partes.length !== 3) {
        return valor;
    }

    const [ano, mes, dia] = partes;

    return `${dia}/${mes}/${ano}`;
};

const formatarHora = (
    valor: string | null | undefined
): string => {
    if (!valor) {
        return "Não informado";
    }

    if (!valor.includes(":")) {
        return valor;
    }

    return valor.slice(0, 5);
};

const formatarTexto = (
    valor: string | number | null | undefined,
    fallback = "Não informado"
): string => {
    if (
        valor === null ||
        valor === undefined ||
        String(valor).trim() === ""
    ) {
        return fallback;
    }

    return String(valor);
};

const obterObjetoRelacionamento = (
    relacionamento: Relacionamento
): Record<string, unknown> | null => {
    if (!relacionamento) {
        return null;
    }

    if (Array.isArray(relacionamento)) {
        return relacionamento[0] ?? null;
    }

    return relacionamento;
};

const obterValorRelacionamento = (
    relacionamento: Relacionamento,
    campos: string[]
): string | null => {
    const objeto = obterObjetoRelacionamento(relacionamento);

    if (!objeto) {
        return null;
    }

    for (const campo of campos) {
        const valor = objeto[campo];

        if (
            valor !== null &&
            valor !== undefined &&
            String(valor).trim() !== ""
        ) {
            return String(valor);
        }
    }

    return null;
};

const obterNomeCliente = (
    cliente: Relacionamento
): string | null => {
    return obterValorRelacionamento(cliente, [
        "nome_fantasia",
        "razao_social",
        "nome",
        "empresa",
    ]);
};

const obterNomeTecnico = (
    tecnico: Relacionamento
): string | null => {
    return obterValorRelacionamento(tecnico, [
        "nome",
        "nome_completo",
        "razao_social",
    ]);
};

const obterStatus = (
    statusId: string | number | null | undefined
): string => {
    if (
        statusId === null ||
        statusId === undefined ||
        statusId === ""
    ) {
        return "Não informado";
    }

    const statusConhecidos: Record<string, string> = {
        "1": "Aberto",
        "2": "Em andamento",
        "3": "Concluído",
        "4": "Cancelado",
    };

    return statusConhecidos[String(statusId)] ?? String(statusId);
};

const obterClasseStatus = (status: string): string => {
    const statusNormalizado = status.toLowerCase();

    if (
        statusNormalizado.includes("concluído") ||
        statusNormalizado.includes("concluido") ||
        statusNormalizado.includes("finalizado")
    ) {
        return "border-emerald-200 bg-emerald-50 text-emerald-700";
    }

    if (
        statusNormalizado.includes("cancelado") ||
        statusNormalizado.includes("erro")
    ) {
        return "border-red-200 bg-red-50 text-red-700";
    }

    if (
        statusNormalizado.includes("andamento") ||
        statusNormalizado.includes("agendado")
    ) {
        return "border-blue-200 bg-blue-50 text-blue-700";
    }

    return "border-slate-200 bg-slate-50 text-slate-700";
};

const Campo = ({
    label,
    value,
    destaque = false,
}: CampoProps) => {
    return (
        <div
            className={`rounded-lg border px-3 py-3 ${
                destaque
                    ? "border-blue-200 bg-blue-50/70"
                    : "border-border bg-background"
            }`}
        >
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {label}
            </p>

            <div
                className={`mt-1 break-words text-sm ${
                    destaque
                        ? "font-bold text-blue-700"
                        : "font-medium text-foreground"
                }`}
            >
                {value}
            </div>
        </div>
    );
};

const Secao = ({
    titulo,
    icone,
    children,
    className = "",
}: SecaoProps) => {
    return (
        <section
            className={`rounded-xl border border-border bg-card p-4 shadow-sm ${className}`}
        >
            <div className="mb-4 flex items-center gap-2 border-b border-border pb-3">
                <span className="text-blue-600">{icone}</span>

                <h3 className="text-sm font-bold text-foreground">
                    {titulo}
                </h3>
            </div>

            {children}
        </section>
    );
};

const ChamadoDetalheModal = ({
    isOpen,
    onClose,
    chamadoId = null,
    empresa = null,
}: ChamadoDetalheModalProps) => {
    const [chamados, setChamados] = useState<ChamadoDetalhado[]>([]);
    const [chamadoAtivoId, setChamadoAtivoId] = useState<string | null>(
        null
    );
    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState<string | null>(null);
    const [tentativa, setTentativa] = useState(0);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        let componenteAtivo = true;

        const buscarChamadoPorId = async (
            id: string
        ): Promise<ChamadoDetalhado | null> => {
            const consultaDetalhada = await supabase
                .from("chamado")
                .select("*, cliente(*), tecnico(*)")
                .eq("id", id)
                .maybeSingle();

            if (!consultaDetalhada.error) {
                return consultaDetalhada.data as ChamadoDetalhado | null;
            }

            const consultaSimples = await supabase
                .from("chamado")
                .select("*")
                .eq("id", id)
                .maybeSingle();

            if (consultaSimples.error) {
                throw consultaSimples.error;
            }

            return consultaSimples.data as ChamadoDetalhado | null;
        };

        const buscarChamadosPorEmpresa = async (
            nomeEmpresa: string
        ): Promise<ChamadoDetalhado[]> => {
            const consultaDetalhada = await supabase
                .from("chamado")
                .select("*, cliente(*), tecnico(*)")
                .eq("empresa", nomeEmpresa)
                .order("data_agendamento", {
                    ascending: false,
                });

            if (!consultaDetalhada.error) {
                return (consultaDetalhada.data ??
                    []) as ChamadoDetalhado[];
            }

            const consultaSimples = await supabase
                .from("chamado")
                .select("*")
                .eq("empresa", nomeEmpresa)
                .order("data_agendamento", {
                    ascending: false,
                });

            if (consultaSimples.error) {
                throw consultaSimples.error;
            }

            return (consultaSimples.data ?? []) as ChamadoDetalhado[];
        };

        const buscarDetalhes = async () => {
            try {
                setLoading(true);
                setErro(null);
                setChamados([]);
                setChamadoAtivoId(null);

                if (chamadoId) {
                    const chamado = await buscarChamadoPorId(chamadoId);

                    if (!chamado) {
                        throw new Error(
                            "O chamado selecionado não foi encontrado."
                        );
                    }

                    if (!componenteAtivo) {
                        return;
                    }

                    setChamados([chamado]);
                    setChamadoAtivoId(chamado.id);

                    return;
                }

                if (empresa) {
                    const chamadosEncontrados =
                        await buscarChamadosPorEmpresa(empresa);

                    if (!componenteAtivo) {
                        return;
                    }

                    setChamados(chamadosEncontrados);
                    setChamadoAtivoId(
                        chamadosEncontrados[0]?.id ?? null
                    );

                    return;
                }

                throw new Error(
                    "Nenhum chamado ou empresa foi selecionado."
                );
            } catch (error) {
                if (!componenteAtivo) {
                    return;
                }

                const mensagem =
                    error instanceof Error
                        ? error.message
                        : "Não foi possível carregar os detalhes do chamado.";

                setErro(mensagem);
            } finally {
                if (componenteAtivo) {
                    setLoading(false);
                }
            }
        };

        buscarDetalhes();

        return () => {
            componenteAtivo = false;
        };
    }, [isOpen, chamadoId, empresa, tentativa]);

    const chamadoAtivo = useMemo(() => {
        return (
            chamados.find(
                (chamado) => chamado.id === chamadoAtivoId
            ) ??
            chamados[0] ??
            null
        );
    }, [chamados, chamadoAtivoId]);

    const valorTotalCliente = converterNumero(
        chamadoAtivo?.valor_total_cliente
    );

    const valorTotalTecnico = converterNumero(
        chamadoAtivo?.valor_total_tecnico
    );

    const lucro = valorTotalCliente - valorTotalTecnico;

    const margem =
        valorTotalCliente > 0
            ? (lucro / valorTotalCliente) * 100
            : 0;

    const status = obterStatus(chamadoAtivo?.status_id);

    const clienteNome =
        obterNomeCliente(chamadoAtivo?.cliente) ??
        chamadoAtivo?.empresa ??
        "Não informado";

    const clienteDocumento = obterValorRelacionamento(
        chamadoAtivo?.cliente,
        ["cnpj", "cpf", "documento"]
    );

    const clienteEmail = obterValorRelacionamento(
        chamadoAtivo?.cliente,
        ["email", "email_principal"]
    );

    const clienteTelefone = obterValorRelacionamento(
        chamadoAtivo?.cliente,
        ["telefone", "celular", "whatsapp"]
    );

    const tecnicoNome =
        obterNomeTecnico(chamadoAtivo?.tecnico) ?? "Não informado";

    const tecnicoEmail = obterValorRelacionamento(
        chamadoAtivo?.tecnico,
        ["email", "email_principal"]
    );

    const tecnicoTelefone = obterValorRelacionamento(
        chamadoAtivo?.tecnico,
        ["telefone", "celular", "whatsapp"]
    );

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => {
                if (!open) {
                    onClose();
                }
            }}
        >
            <DialogContent className="max-h-[92vh] max-w-6xl overflow-hidden p-0">
                <div className="flex max-h-[92vh] flex-col">
                    <DialogHeader className="border-b border-border bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-5 pr-12">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <DialogTitle className="text-xl font-bold text-foreground">
                                    {empresa && !chamadoId
                                        ? `Chamados da empresa ${empresa}`
                                        : "Detalhes do chamado"}
                                </DialogTitle>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    Informações operacionais, financeiras e
                                    de atendimento.
                                </p>
                            </div>

                            {chamadoAtivo && (
                                <div className="flex flex-wrap items-center gap-2">
                                    <span
                                        className={`rounded-full border px-3 py-1 text-xs font-bold ${obterClasseStatus(
                                            status
                                        )}`}
                                    >
                                        {status}
                                    </span>

                                    <span className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
                                        {chamadoAtivo.numero_chamado ||
                                            "Sem número"}
                                    </span>
                                </div>
                            )}
                        </div>
                    </DialogHeader>

                    {loading && (
                        <div className="flex min-h-[420px] flex-col items-center justify-center gap-3 p-8">
                            <Loader2 className="h-9 w-9 animate-spin text-blue-600" />

                            <p className="text-sm font-medium text-muted-foreground">
                                Carregando os detalhes do chamado...
                            </p>
                        </div>
                    )}

                    {!loading && erro && (
                        <div className="flex min-h-[420px] flex-col items-center justify-center gap-4 p-8 text-center">
                            <span className="rounded-full bg-red-50 p-4">
                                <AlertCircle className="h-9 w-9 text-red-600" />
                            </span>

                            <div>
                                <p className="font-bold text-foreground">
                                    Não foi possível carregar o chamado
                                </p>

                                <p className="mt-1 max-w-md text-sm text-muted-foreground">
                                    {erro}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setTentativa(
                                        (valorAtual) => valorAtual + 1
                                    )
                                }
                                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                            >
                                <RefreshCw className="h-4 w-4" />
                                Tentar novamente
                            </button>
                        </div>
                    )}

                    {!loading &&
                        !erro &&
                        chamados.length === 0 && (
                            <div className="flex min-h-[420px] flex-col items-center justify-center gap-3 p-8 text-center">
                                <FileText className="h-10 w-10 text-muted-foreground" />

                                <p className="font-bold text-foreground">
                                    Nenhum chamado encontrado
                                </p>

                                <p className="text-sm text-muted-foreground">
                                    Não existem chamados vinculados à
                                    seleção atual.
                                </p>
                            </div>
                        )}

                    {!loading && !erro && chamadoAtivo && (
                        <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
                            {empresa && chamados.length > 1 && (
                                <aside className="max-h-56 shrink-0 overflow-y-auto border-b border-border bg-muted/20 p-4 lg:max-h-none lg:w-72 lg:border-b-0 lg:border-r">
                                    <div className="mb-3 flex items-center justify-between">
                                        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                                            Chamados encontrados
                                        </p>

                                        <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-bold text-indigo-700">
                                            {chamados.length}
                                        </span>
                                    </div>

                                    <div className="space-y-2">
                                        {chamados.map((chamado) => {
                                            const selecionado =
                                                chamado.id ===
                                                chamadoAtivo.id;

                                            return (
                                                <button
                                                    key={chamado.id}
                                                    type="button"
                                                    onClick={() =>
                                                        setChamadoAtivoId(
                                                            chamado.id
                                                        )
                                                    }
                                                    className={`w-full rounded-lg border p-3 text-left transition-colors ${
                                                        selecionado
                                                            ? "border-blue-300 bg-blue-50 shadow-sm"
                                                            : "border-border bg-background hover:bg-muted"
                                                    }`}
                                                >
                                                    <p
                                                        className={`text-sm font-bold ${
                                                            selecionado
                                                                ? "text-blue-700"
                                                                : "text-foreground"
                                                        }`}
                                                    >
                                                        {chamado.numero_chamado ||
                                                            "Sem número"}
                                                    </p>

                                                    <div className="mt-1 flex items-center justify-between gap-2">
                                                        <span className="text-xs text-muted-foreground">
                                                            {formatarData(
                                                                chamado.data_agendamento
                                                            )}
                                                        </span>

                                                        <span className="text-xs font-semibold text-emerald-600">
                                                            {formatarMoeda(
                                                                chamado.valor_total_cliente
                                                            )}
                                                        </span>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </aside>
                            )}

                            <div className="min-h-0 flex-1 overflow-y-auto bg-muted/10 p-4 sm:p-6">
                                <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                                    <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                                        <div className="flex items-center gap-2 text-blue-700">
                                            <DollarSign className="h-4 w-4" />

                                            <p className="text-xs font-bold uppercase tracking-wide">
                                                Faturado
                                            </p>
                                        </div>

                                        <p className="mt-2 text-xl font-bold text-blue-700">
                                            {formatarMoeda(
                                                valorTotalCliente
                                            )}
                                        </p>
                                    </div>

                                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                                        <div className="flex items-center gap-2 text-amber-700">
                                            <Wallet className="h-4 w-4" />

                                            <p className="text-xs font-bold uppercase tracking-wide">
                                                Custo técnico
                                            </p>
                                        </div>

                                        <p className="mt-2 text-xl font-bold text-amber-700">
                                            {formatarMoeda(
                                                valorTotalTecnico
                                            )}
                                        </p>
                                    </div>

                                    <div
                                        className={`rounded-xl border p-4 ${
                                            lucro >= 0
                                                ? "border-emerald-200 bg-emerald-50"
                                                : "border-red-200 bg-red-50"
                                        }`}
                                    >
                                        <div
                                            className={`flex items-center gap-2 ${
                                                lucro >= 0
                                                    ? "text-emerald-700"
                                                    : "text-red-700"
                                            }`}
                                        >
                                            <DollarSign className="h-4 w-4" />

                                            <p className="text-xs font-bold uppercase tracking-wide">
                                                Lucro
                                            </p>
                                        </div>

                                        <p
                                            className={`mt-2 text-xl font-bold ${
                                                lucro >= 0
                                                    ? "text-emerald-700"
                                                    : "text-red-700"
                                            }`}
                                        >
                                            {formatarMoeda(lucro)}
                                        </p>
                                    </div>

                                    <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4">
                                        <div className="flex items-center gap-2 text-indigo-700">
                                            <DollarSign className="h-4 w-4" />

                                            <p className="text-xs font-bold uppercase tracking-wide">
                                                Margem
                                            </p>
                                        </div>

                                        <p className="mt-2 text-xl font-bold text-indigo-700">
                                            {margem.toLocaleString(
                                                "pt-BR",
                                                {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                }
                                            )}
                                            %
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                                    <Secao
                                        titulo="Identificação do chamado"
                                        icone={
                                            <Briefcase className="h-5 w-5" />
                                        }
                                    >
                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                            <Campo
                                                label="Número do chamado"
                                                value={formatarTexto(
                                                    chamadoAtivo.numero_chamado,
                                                    "Sem número"
                                                )}
                                                destaque
                                            />

                                            <Campo
                                                label="Status"
                                                value={status}
                                            />

                                            <Campo
                                                label="Empresa"
                                                value={formatarTexto(
                                                    chamadoAtivo.empresa
                                                )}
                                            />

                                            <Campo
                                                label="É retorno?"
                                                value={
                                                    chamadoAtivo.retorno
                                                        ? "Sim"
                                                        : "Não"
                                                }
                                            />

                                            <Campo
                                                label="ID do chamado"
                                                value={chamadoAtivo.id}
                                            />

                                            <Campo
                                                label="Status ID"
                                                value={formatarTexto(
                                                    chamadoAtivo.status_id
                                                )}
                                            />
                                        </div>
                                    </Secao>

                                    <Secao
                                        titulo="Agendamento"
                                        icone={
                                            <Calendar className="h-5 w-5" />
                                        }
                                    >
                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                            <Campo
                                                label="Data do agendamento"
                                                value={formatarData(
                                                    chamadoAtivo.data_agendamento
                                                )}
                                                destaque
                                            />

                                            <Campo
                                                label="Horário agendado"
                                                value={formatarHora(
                                                    chamadoAtivo.hora_agendamento
                                                )}
                                            />

                                            <Campo
                                                label="Data de retorno"
                                                value={formatarData(
                                                    chamadoAtivo.data_retorno
                                                )}
                                            />

                                            <Campo
                                                label="Distância"
                                                value={formatarTexto(
                                                    chamadoAtivo.distancia
                                                )}
                                            />
                                        </div>
                                    </Secao>

                                    <Secao
                                        titulo="Execução do atendimento"
                                        icone={
                                            <Clock className="h-5 w-5" />
                                        }
                                    >
                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                            <Campo
                                                label="Hora de chegada"
                                                value={formatarHora(
                                                    chamadoAtivo.hora_chegada
                                                )}
                                            />

                                            <Campo
                                                label="Hora de início"
                                                value={formatarHora(
                                                    chamadoAtivo.hora_inicio
                                                )}
                                            />

                                            <Campo
                                                label="Hora de término"
                                                value={formatarHora(
                                                    chamadoAtivo.hora_fim
                                                )}
                                            />

                                            <Campo
                                                label="Tempo total"
                                                value={formatarTexto(
                                                    chamadoAtivo.hora_total_str ||
                                                        chamadoAtivo.hora_total
                                                )}
                                            />

                                            <Campo
                                                label="Hora extra"
                                                value={formatarTexto(
                                                    chamadoAtivo.hora_extra
                                                )}
                                            />

                                            <Campo
                                                label="Atendimento concluído"
                                                value={
                                                    chamadoAtivo.hora_fim ? (
                                                        <span className="inline-flex items-center gap-1 text-emerald-600">
                                                            <CheckCircle className="h-4 w-4" />
                                                            Sim
                                                        </span>
                                                    ) : (
                                                        "Não"
                                                    )
                                                }
                                            />
                                        </div>
                                    </Secao>

                                    <Secao
                                        titulo="Local do atendimento"
                                        icone={
                                            <MapPin className="h-5 w-5" />
                                        }
                                    >
                                        <div className="space-y-3">
                                            <Campo
                                                label="Endereço"
                                                value={formatarTexto(
                                                    chamadoAtivo.endereco
                                                )}
                                            />

                                            <Campo
                                                label="Distância informada"
                                                value={formatarTexto(
                                                    chamadoAtivo.distancia
                                                )}
                                            />
                                        </div>
                                    </Secao>

                                    <Secao
                                        titulo="Dados do cliente"
                                        icone={
                                            <Building2 className="h-5 w-5" />
                                        }
                                    >
                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                            <Campo
                                                label="Cliente"
                                                value={clienteNome}
                                                destaque
                                            />

                                            <Campo
                                                label="Cliente ID"
                                                value={formatarTexto(
                                                    chamadoAtivo.cliente_id
                                                )}
                                            />

                                            <Campo
                                                label="CPF/CNPJ"
                                                value={formatarTexto(
                                                    clienteDocumento
                                                )}
                                            />

                                            <Campo
                                                label="E-mail"
                                                value={formatarTexto(
                                                    clienteEmail
                                                )}
                                            />

                                            <Campo
                                                label="Telefone"
                                                value={
                                                    clienteTelefone ? (
                                                        <span className="inline-flex items-center gap-1">
                                                            <Phone className="h-3.5 w-3.5" />
                                                            {
                                                                clienteTelefone
                                                            }
                                                        </span>
                                                    ) : (
                                                        "Não informado"
                                                    )
                                                }
                                            />
                                        </div>
                                    </Secao>

                                    <Secao
                                        titulo="Dados do técnico"
                                        icone={
                                            <Wrench className="h-5 w-5" />
                                        }
                                    >
                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                            <Campo
                                                label="Técnico"
                                                value={tecnicoNome}
                                                destaque
                                            />

                                            <Campo
                                                label="Técnico ID"
                                                value={formatarTexto(
                                                    chamadoAtivo.tecnico_id
                                                )}
                                            />

                                            <Campo
                                                label="E-mail"
                                                value={formatarTexto(
                                                    tecnicoEmail
                                                )}
                                            />

                                            <Campo
                                                label="Telefone"
                                                value={
                                                    tecnicoTelefone ? (
                                                        <span className="inline-flex items-center gap-1">
                                                            <Phone className="h-3.5 w-3.5" />
                                                            {
                                                                tecnicoTelefone
                                                            }
                                                        </span>
                                                    ) : (
                                                        "Não informado"
                                                    )
                                                }
                                            />
                                        </div>
                                    </Secao>

                                    <Secao
                                        titulo="Valores cobrados do cliente"
                                        icone={
                                            <DollarSign className="h-5 w-5" />
                                        }
                                    >
                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                            <Campo
                                                label="Valor do chamado"
                                                value={formatarMoeda(
                                                    chamadoAtivo.valor_chamado_cliente
                                                )}
                                            />

                                            <Campo
                                                label="Hora extra"
                                                value={formatarMoeda(
                                                    chamadoAtivo.hora_extra_cliente
                                                )}
                                            />

                                            <Campo
                                                label="Deslocamento"
                                                value={formatarMoeda(
                                                    chamadoAtivo.deslocamento_cliente
                                                )}
                                            />

                                            <Campo
                                                label="Reembolso"
                                                value={formatarMoeda(
                                                    chamadoAtivo.reembolso_cliente
                                                )}
                                            />

                                            <div className="sm:col-span-2">
                                                <Campo
                                                    label="Total do cliente"
                                                    value={formatarMoeda(
                                                        chamadoAtivo.valor_total_cliente
                                                    )}
                                                    destaque
                                                />
                                            </div>
                                        </div>
                                    </Secao>

                                    <Secao
                                        titulo="Valores pagos ao técnico"
                                        icone={
                                            <Wallet className="h-5 w-5" />
                                        }
                                    >
                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                            <Campo
                                                label="Valor do chamado"
                                                value={formatarMoeda(
                                                    chamadoAtivo.valor_chamado_tecnico
                                                )}
                                            />

                                            <Campo
                                                label="Hora extra"
                                                value={formatarMoeda(
                                                    chamadoAtivo.hora_extra_tecnico
                                                )}
                                            />

                                            <Campo
                                                label="Deslocamento"
                                                value={formatarMoeda(
                                                    chamadoAtivo.deslocamento_tecnico
                                                )}
                                            />

                                            <Campo
                                                label="Reembolso"
                                                value={formatarMoeda(
                                                    chamadoAtivo.reembolso_tecnico
                                                )}
                                            />

                                            <div className="sm:col-span-2">
                                                <Campo
                                                    label="Total do técnico"
                                                    value={formatarMoeda(
                                                        chamadoAtivo.valor_total_tecnico
                                                    )}
                                                    destaque
                                                />
                                            </div>
                                        </div>
                                    </Secao>

                                    <Secao
                                        titulo="Observações"
                                        icone={
                                            <FileText className="h-5 w-5" />
                                        }
                                        className="xl:col-span-2"
                                    >
                                        <div className="rounded-lg border border-border bg-background p-4">
                                            <p className="whitespace-pre-wrap text-sm leading-6 text-foreground">
                                                {chamadoAtivo.observacoes ||
                                                    "Nenhuma observação cadastrada para este chamado."}
                                            </p>
                                        </div>

                                        {chamadoAtivo.url_arquivo && (
                                            <a
                                                href={
                                                    chamadoAtivo.url_arquivo
                                                }
                                                target="_blank"
                                                rel="noreferrer"
                                                className="mt-3 inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-100"
                                            >
                                                <ExternalLink className="h-4 w-4" />
                                                Abrir arquivo anexado
                                            </a>
                                        )}
                                    </Secao>
                                </div>

                                <div className="mt-5 flex flex-col gap-3 rounded-xl border border-border bg-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-muted-foreground" />

                                        <p className="text-xs text-muted-foreground">
                                            Registro selecionado:{" "}
                                            <span className="font-semibold text-foreground">
                                                {chamadoAtivo.numero_chamado ||
                                                    chamadoAtivo.id}
                                            </span>
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="rounded-lg bg-foreground px-4 py-2 text-sm font-semibold text-background transition-opacity hover:opacity-90"
                                    >
                                        Fechar
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ChamadoDetalheModal;