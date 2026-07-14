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
    ClipboardList,
    Clock,
    DollarSign,
    FileText,
    Loader2,
    Mail,
    MapPin,
    Phone,
    RefreshCw,
    TrendingUp,
    User,
    Wallet,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "../ui/dialog";
import supabase from "../../lib/supabase";
import { Chamado } from "../../types/chamado.type";
import { DesempenhoTecnico } from "../../services/dashboard/dashboard.service";

interface TecnicoDetalheModalProps {
    isOpen: boolean;
    onClose: () => void;
    tecnico: DesempenhoTecnico | null;
}

interface TecnicoCadastro {
    id: string;
    usuario_id?: string | null;
    nome?: string | null;
    estado_id?: string | number | null;
    telefone?: string | null;
    endereco?: string | null;
    data_criacao?: string | null;
    municipio_id?: string | number | null;
    cpf?: string | null;
    rg?: string | null;
    data_nascimento?: string | null;
    email_contato?: string | null;
}

interface EstadoRegistro {
    id: string | number;
    sigla?: string | null;
    nome?: string | null;
}

interface MunicipioRegistro {
    id: string | number;
    nome?: string | null;
    estado_id?: string | number | null;
}

interface UsuarioRegistro {
    id: string;
    email?: string | null;
    tipo_perfil_id?: string | number | null;
}

type ChamadoTecnico = Omit<Partial<Chamado>, "status_id"> & {
    id?: string;
    status_id?: string | number | null;
    distancia?: string | number | null;
};

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

const STATUS_PADRAO: Record<string, string> = {
    "1": "Pendente",
    "2": "Em andamento",
    "3": "Finalizado",
};

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

const formatarDataHora = (
    valor: string | null | undefined
): string => {
    if (!valor) {
        return "Não informado";
    }

    const data = new Date(valor);

    if (Number.isNaN(data.getTime())) {
        return formatarData(valor);
    }

    return data.toLocaleString("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
    });
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
    valor: unknown,
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

const obterStatusId = (
    chamado: ChamadoTecnico
): string => {
    if (
        chamado.status_id === null ||
        chamado.status_id === undefined
    ) {
        return "";
    }

    return String(chamado.status_id);
};

const obterNomeStatus = (
    chamado: ChamadoTecnico
): string => {
    const statusId = obterStatusId(chamado);

    if (!statusId) {
        return "Não informado";
    }

    return STATUS_PADRAO[statusId] ?? `Status ${statusId}`;
};

const chamadoPossuiStatus = (
    chamado: ChamadoTecnico,
    statusId: number
): boolean => {
    return Number(chamado.status_id) === statusId;
};

const obterClasseStatus = (
    chamado: ChamadoTecnico
): string => {
    if (chamadoPossuiStatus(chamado, 1)) {
        return "border-amber-200 bg-amber-50 text-amber-700";
    }

    if (chamadoPossuiStatus(chamado, 2)) {
        return "border-blue-200 bg-blue-50 text-blue-700";
    }

    if (chamadoPossuiStatus(chamado, 3)) {
        return "border-emerald-200 bg-emerald-50 text-emerald-700";
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
                <span className="text-blue-600">
                    {icone}
                </span>

                <h3 className="text-sm font-bold text-foreground">
                    {titulo}
                </h3>
            </div>

            {children}
        </section>
    );
};

const TecnicoDetalheModal = ({
    isOpen,
    onClose,
    tecnico,
}: TecnicoDetalheModalProps) => {
    const [cadastro, setCadastro] =
        useState<TecnicoCadastro | null>(null);

    const [estadoCadastro, setEstadoCadastro] =
        useState<EstadoRegistro | null>(null);

    const [municipioCadastro, setMunicipioCadastro] =
        useState<MunicipioRegistro | null>(null);

    const [usuarioCadastro, setUsuarioCadastro] =
        useState<UsuarioRegistro | null>(null);

    const [chamados, setChamados] =
        useState<ChamadoTecnico[]>([]);

    const [
        chamadoSelecionadoId,
        setChamadoSelecionadoId,
    ] = useState<string | null>(null);

    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState<string | null>(null);
    const [tentativa, setTentativa] = useState(0);

    useEffect(() => {
        if (!isOpen || !tecnico?.tecnico_id) {
            return;
        }

        let componenteAtivo = true;

        const buscarDados = async () => {
            try {
                setLoading(true);
                setErro(null);
                setCadastro(null);
                setEstadoCadastro(null);
                setMunicipioCadastro(null);
                setUsuarioCadastro(null);
                setChamados([]);
                setChamadoSelecionadoId(null);

                const resultadoTecnico = await supabase
                    .from("tecnico")
                    .select("*")
                    .eq("id", tecnico.tecnico_id)
                    .maybeSingle();

                if (resultadoTecnico.error) {
                    throw resultadoTecnico.error;
                }

                const cadastroTecnico =
                    resultadoTecnico.data as TecnicoCadastro | null;

                const resultadoChamados = await supabase
                    .from("chamado")
                    .select("*")
                    .eq("tecnico_id", tecnico.tecnico_id)
                    .order("data_criacao", {
                        ascending: false,
                    });

                if (resultadoChamados.error) {
                    throw resultadoChamados.error;
                }

                const chamadosEncontrados =
                    (resultadoChamados.data ??
                        []) as ChamadoTecnico[];

                let estadoEncontrado: EstadoRegistro | null =
                    null;

                let municipioEncontrado: MunicipioRegistro | null =
                    null;

                let usuarioEncontrado: UsuarioRegistro | null =
                    null;

                if (cadastroTecnico?.estado_id) {
                    const resultadoEstado = await supabase
                        .from("estado")
                        .select("id, sigla, nome")
                        .eq(
                            "id",
                            cadastroTecnico.estado_id
                        )
                        .maybeSingle();

                    if (!resultadoEstado.error) {
                        estadoEncontrado =
                            resultadoEstado.data as EstadoRegistro | null;
                    }
                }

                if (cadastroTecnico?.municipio_id) {
                    const resultadoMunicipio = await supabase
                        .from("municipio")
                        .select("id, nome, estado_id")
                        .eq(
                            "id",
                            cadastroTecnico.municipio_id
                        )
                        .maybeSingle();

                    if (!resultadoMunicipio.error) {
                        municipioEncontrado =
                            resultadoMunicipio.data as MunicipioRegistro | null;
                    }
                }

                if (cadastroTecnico?.usuario_id) {
                    const resultadoUsuario = await supabase
                        .from("usuarios")
                        .select(
                            "id, email, tipo_perfil_id"
                        )
                        .eq(
                            "id",
                            cadastroTecnico.usuario_id
                        )
                        .maybeSingle();

                    if (!resultadoUsuario.error) {
                        usuarioEncontrado =
                            resultadoUsuario.data as UsuarioRegistro | null;
                    }
                }

                if (!componenteAtivo) {
                    return;
                }

                setCadastro(cadastroTecnico);
                setEstadoCadastro(estadoEncontrado);
                setMunicipioCadastro(
                    municipioEncontrado
                );
                setUsuarioCadastro(usuarioEncontrado);
                setChamados(chamadosEncontrados);
                setChamadoSelecionadoId(
                    chamadosEncontrados[0]?.id ?? null
                );
            } catch (error) {
                if (!componenteAtivo) {
                    return;
                }

                const mensagem =
                    error instanceof Error
                        ? error.message
                        : "Não foi possível carregar os dados do técnico.";

                setErro(mensagem);
            } finally {
                if (componenteAtivo) {
                    setLoading(false);
                }
            }
        };

        buscarDados();

        return () => {
            componenteAtivo = false;
        };
    }, [isOpen, tecnico?.tecnico_id, tentativa]);

    const chamadoSelecionado = useMemo(() => {
        return (
            chamados.find(
                (chamado) =>
                    chamado.id === chamadoSelecionadoId
            ) ??
            chamados[0] ??
            null
        );
    }, [chamados, chamadoSelecionadoId]);

    const quantidadeChamados = chamados.length;

    const pendentes = chamados.filter((chamado) =>
        chamadoPossuiStatus(chamado, 1)
    ).length;

    const emAndamento = chamados.filter((chamado) =>
        chamadoPossuiStatus(chamado, 2)
    ).length;

    const finalizados = chamados.filter((chamado) =>
        chamadoPossuiStatus(chamado, 3)
    ).length;

    const retornos = chamados.filter(
        (chamado) => chamado.retorno === true
    ).length;

    const faturado = chamados.reduce(
        (total, chamado) =>
            total +
            converterNumero(
                chamado.valor_total_cliente
            ),
        0
    );

    const pago = chamados.reduce(
        (total, chamado) =>
            total +
            converterNumero(
                chamado.valor_total_tecnico
            ),
        0
    );

    const lucro = faturado - pago;

    const margem =
        faturado > 0
            ? (lucro / faturado) * 100
            : 0;

    const ticketMedio =
        quantidadeChamados > 0
            ? faturado / quantidadeChamados
            : 0;

    const nome =
        cadastro?.nome ??
        tecnico?.nome ??
        "Não informado";

    const estado =
        estadoCadastro?.sigla ??
        estadoCadastro?.nome ??
        tecnico?.estado ??
        "Não informado";

    const municipio =
        municipioCadastro?.nome ??
        "Não informado";

    const email =
        cadastro?.email_contato ??
        usuarioCadastro?.email ??
        "Não informado";

    const telefone =
        cadastro?.telefone ??
        "Não informado";

    const cpf =
        cadastro?.cpf ??
        "Não informado";

    const rg =
        cadastro?.rg ??
        "Não informado";

    const endereco =
        cadastro?.endereco ??
        "Não informado";

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => {
                if (!open) {
                    onClose();
                }
            }}
        >
            <DialogContent className="max-h-[92vh] max-w-7xl overflow-hidden p-0">
                <div className="flex max-h-[92vh] flex-col">
                    <DialogHeader className="border-b border-border bg-gradient-to-r from-emerald-50 to-blue-50 px-6 py-5 pr-12">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <DialogTitle className="text-xl font-bold text-foreground">
                                    Desempenho do técnico
                                </DialogTitle>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    Informações cadastrais,
                                    operacionais e financeiras do
                                    profissional.
                                </p>
                            </div>

                            {tecnico && (
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                                        {nome}
                                    </span>

                                    <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                                        {estado}
                                    </span>
                                </div>
                            )}
                        </div>
                    </DialogHeader>

                    {loading && (
                        <div className="flex min-h-[440px] flex-col items-center justify-center gap-3 p-8">
                            <Loader2 className="h-9 w-9 animate-spin text-emerald-600" />

                            <p className="text-sm font-medium text-muted-foreground">
                                Carregando os dados do técnico...
                            </p>
                        </div>
                    )}

                    {!loading && erro && (
                        <div className="flex min-h-[440px] flex-col items-center justify-center gap-4 p-8 text-center">
                            <span className="rounded-full bg-red-50 p-4">
                                <AlertCircle className="h-9 w-9 text-red-600" />
                            </span>

                            <div>
                                <p className="font-bold text-foreground">
                                    Não foi possível carregar o técnico
                                </p>

                                <p className="mt-1 max-w-md text-sm text-muted-foreground">
                                    {erro}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setTentativa(
                                        (valorAtual) =>
                                            valorAtual + 1
                                    )
                                }
                                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
                            >
                                <RefreshCw className="h-4 w-4" />
                                Tentar novamente
                            </button>
                        </div>
                    )}

                    {!loading && !erro && tecnico && (
                        <div className="min-h-0 flex-1 overflow-y-auto bg-muted/10 p-4 sm:p-6">
                            <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
                                <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                                    <div className="flex items-center gap-2 text-blue-700">
                                        <ClipboardList className="h-4 w-4" />

                                        <p className="text-xs font-bold uppercase tracking-wide">
                                            Chamados
                                        </p>
                                    </div>

                                    <p className="mt-2 text-xl font-bold text-blue-700">
                                        {quantidadeChamados}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4">
                                    <div className="flex items-center gap-2 text-indigo-700">
                                        <DollarSign className="h-4 w-4" />

                                        <p className="text-xs font-bold uppercase tracking-wide">
                                            Faturado
                                        </p>
                                    </div>

                                    <p className="mt-2 text-xl font-bold text-indigo-700">
                                        {formatarMoeda(faturado)}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                                    <div className="flex items-center gap-2 text-amber-700">
                                        <Wallet className="h-4 w-4" />

                                        <p className="text-xs font-bold uppercase tracking-wide">
                                            Pago
                                        </p>
                                    </div>

                                    <p className="mt-2 text-xl font-bold text-amber-700">
                                        {formatarMoeda(pago)}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                                    <div className="flex items-center gap-2 text-emerald-700">
                                        <TrendingUp className="h-4 w-4" />

                                        <p className="text-xs font-bold uppercase tracking-wide">
                                            Lucro
                                        </p>
                                    </div>

                                    <p className="mt-2 text-xl font-bold text-emerald-700">
                                        {formatarMoeda(lucro)}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-violet-200 bg-violet-50 p-4">
                                    <div className="flex items-center gap-2 text-violet-700">
                                        <DollarSign className="h-4 w-4" />

                                        <p className="text-xs font-bold uppercase tracking-wide">
                                            Ticket médio
                                        </p>
                                    </div>

                                    <p className="mt-2 text-xl font-bold text-violet-700">
                                        {formatarMoeda(ticketMedio)}
                                    </p>
                                </div>
                            </div>

                            <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
                                <Campo
                                    label="Pendentes"
                                    value={pendentes}
                                />

                                <Campo
                                    label="Em andamento"
                                    value={emAndamento}
                                    destaque
                                />

                                <Campo
                                    label="Finalizados"
                                    value={finalizados}
                                />

                                <Campo
                                    label="Retornos"
                                    value={retornos}
                                />

                                <Campo
                                    label="Margem da operação"
                                    value={`${margem.toLocaleString(
                                        "pt-BR",
                                        {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        }
                                    )}%`}
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                                <Secao
                                    titulo="Identificação do técnico"
                                    icone={
                                        <User className="h-5 w-5" />
                                    }
                                >
                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                        <Campo
                                            label="Nome"
                                            value={nome}
                                            destaque
                                        />

                                        <Campo
                                            label="ID do técnico"
                                            value={formatarTexto(
                                                tecnico.tecnico_id
                                            )}
                                        />

                                        <Campo
                                            label="Estado"
                                            value={estado}
                                        />

                                        <Campo
                                            label="Município"
                                            value={municipio}
                                        />

                                        <Campo
                                            label="CPF"
                                            value={cpf}
                                        />

                                        <Campo
                                            label="RG"
                                            value={rg}
                                        />

                                        <Campo
                                            label="Data de nascimento"
                                            value={formatarData(
                                                cadastro?.data_nascimento
                                            )}
                                        />

                                        <Campo
                                            label="Data de cadastro"
                                            value={formatarDataHora(
                                                cadastro?.data_criacao
                                            )}
                                        />
                                    </div>
                                </Secao>

                                <Secao
                                    titulo="Contato e localização"
                                    icone={
                                        <Phone className="h-5 w-5" />
                                    }
                                >
                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                        <Campo
                                            label="Telefone"
                                            value={
                                                telefone !==
                                                "Não informado" ? (
                                                    <span className="inline-flex items-center gap-1.5">
                                                        <Phone className="h-3.5 w-3.5" />
                                                        {telefone}
                                                    </span>
                                                ) : (
                                                    telefone
                                                )
                                            }
                                        />

                                        <Campo
                                            label="E-mail"
                                            value={
                                                email !==
                                                "Não informado" ? (
                                                    <span className="inline-flex items-center gap-1.5">
                                                        <Mail className="h-3.5 w-3.5" />
                                                        {email}
                                                    </span>
                                                ) : (
                                                    email
                                                )
                                            }
                                        />

                                        <div className="sm:col-span-2">
                                            <Campo
                                                label="Endereço"
                                                value={
                                                    endereco !==
                                                    "Não informado" ? (
                                                        <span className="inline-flex items-start gap-1.5">
                                                            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                                                            {endereco}
                                                        </span>
                                                    ) : (
                                                        endereco
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>
                                </Secao>

                                <Secao
                                    titulo="Resumo financeiro"
                                    icone={
                                        <DollarSign className="h-5 w-5" />
                                    }
                                >
                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                        <Campo
                                            label="Valor faturado"
                                            value={formatarMoeda(
                                                faturado
                                            )}
                                            destaque
                                        />

                                        <Campo
                                            label="Valor pago"
                                            value={formatarMoeda(
                                                pago
                                            )}
                                        />

                                        <Campo
                                            label="Lucro"
                                            value={formatarMoeda(
                                                lucro
                                            )}
                                        />

                                        <Campo
                                            label="Ticket médio"
                                            value={formatarMoeda(
                                                ticketMedio
                                            )}
                                        />

                                        <Campo
                                            label="Margem"
                                            value={`${margem.toLocaleString(
                                                "pt-BR",
                                                {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                }
                                            )}%`}
                                        />

                                        <Campo
                                            label="Quantidade de chamados"
                                            value={
                                                quantidadeChamados
                                            }
                                        />
                                    </div>
                                </Secao>

                                <Secao
                                    titulo="Indicadores operacionais"
                                    icone={
                                        <Briefcase className="h-5 w-5" />
                                    }
                                >
                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                        <Campo
                                            label="Pendentes"
                                            value={pendentes}
                                        />

                                        <Campo
                                            label="Em andamento"
                                            value={emAndamento}
                                            destaque
                                        />

                                        <Campo
                                            label="Finalizados"
                                            value={finalizados}
                                        />

                                        <Campo
                                            label="Atendimentos de retorno"
                                            value={retornos}
                                        />

                                        <Campo
                                            label="Último registro"
                                            value={
                                                chamados[0]
                                                    ? formatarDataHora(
                                                          chamados[0]
                                                              .data_criacao
                                                      )
                                                    : "Não informado"
                                            }
                                        />

                                        <Campo
                                            label="Total de atendimentos"
                                            value={
                                                quantidadeChamados
                                            }
                                        />
                                    </div>
                                </Secao>

                                <Secao
                                    titulo="Chamados do técnico"
                                    icone={
                                        <ClipboardList className="h-5 w-5" />
                                    }
                                    className="xl:col-span-2"
                                >
                                    {chamados.length === 0 ? (
                                        <div className="flex min-h-40 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-background p-6 text-center">
                                            <ClipboardList className="h-8 w-8 text-muted-foreground" />

                                            <p className="font-semibold text-foreground">
                                                Nenhum chamado encontrado
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[320px_1fr]">
                                            <div className="max-h-[500px] space-y-2 overflow-y-auto pr-1">
                                                {chamados.map(
                                                    (
                                                        chamado,
                                                        index
                                                    ) => {
                                                        const selecionado =
                                                            chamado.id ===
                                                            chamadoSelecionado?.id;

                                                        return (
                                                            <button
                                                                key={
                                                                    chamado.id ??
                                                                    `${chamado.numero_chamado}-${index}`
                                                                }
                                                                type="button"
                                                                onClick={() =>
                                                                    setChamadoSelecionadoId(
                                                                        chamado.id ??
                                                                            null
                                                                    )
                                                                }
                                                                className={`w-full rounded-lg border p-3 text-left transition-all ${
                                                                    selecionado
                                                                        ? "border-blue-300 bg-blue-50 shadow-sm"
                                                                        : "border-border bg-background hover:border-blue-200 hover:bg-muted/40"
                                                                }`}
                                                            >
                                                                <div className="flex items-start justify-between gap-2">
                                                                    <div>
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

                                                                        <p className="mt-1 text-xs font-medium text-muted-foreground">
                                                                            {chamado.empresa ||
                                                                                "Empresa não informada"}
                                                                        </p>
                                                                    </div>

                                                                    <span
                                                                        className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold ${obterClasseStatus(
                                                                            chamado
                                                                        )}`}
                                                                    >
                                                                        {obterNomeStatus(
                                                                            chamado
                                                                        )}
                                                                    </span>
                                                                </div>

                                                                <div className="mt-3 flex items-center justify-between gap-2">
                                                                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                                                        <Calendar className="h-3.5 w-3.5" />
                                                                        {formatarData(
                                                                            chamado.data_agendamento
                                                                        )}
                                                                    </span>

                                                                    <span className="text-xs font-bold text-emerald-600">
                                                                        {formatarMoeda(
                                                                            chamado.valor_total_cliente
                                                                        )}
                                                                    </span>
                                                                </div>
                                                            </button>
                                                        );
                                                    }
                                                )}
                                            </div>

                                            {chamadoSelecionado && (
                                                <div className="rounded-xl border border-border bg-background p-4">
                                                    <div className="mb-4 flex flex-col gap-2 border-b border-border pb-4 sm:flex-row sm:items-start sm:justify-between">
                                                        <div>
                                                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                                                Chamado selecionado
                                                            </p>

                                                            <h4 className="mt-1 text-lg font-bold text-blue-700">
                                                                {chamadoSelecionado.numero_chamado ||
                                                                    "Sem número"}
                                                            </h4>

                                                            <p className="mt-1 text-sm font-medium text-foreground">
                                                                {chamadoSelecionado.empresa ||
                                                                    "Empresa não informada"}
                                                            </p>
                                                        </div>

                                                        <span
                                                            className={`self-start rounded-full border px-3 py-1 text-xs font-bold ${obterClasseStatus(
                                                                chamadoSelecionado
                                                            )}`}
                                                        >
                                                            {obterNomeStatus(
                                                                chamadoSelecionado
                                                            )}
                                                        </span>
                                                    </div>

                                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                                        <Campo
                                                            label="Status"
                                                            value={obterNomeStatus(
                                                                chamadoSelecionado
                                                            )}
                                                            destaque
                                                        />

                                                        <Campo
                                                            label="Data do agendamento"
                                                            value={formatarData(
                                                                chamadoSelecionado.data_agendamento
                                                            )}
                                                        />

                                                        <Campo
                                                            label="Horário agendado"
                                                            value={formatarHora(
                                                                chamadoSelecionado.hora_agendamento
                                                            )}
                                                        />

                                                        <Campo
                                                            label="Retorno"
                                                            value={
                                                                chamadoSelecionado.retorno ===
                                                                true
                                                                    ? "Sim"
                                                                    : "Não"
                                                            }
                                                        />

                                                        <Campo
                                                            label="Chegada"
                                                            value={formatarHora(
                                                                chamadoSelecionado.hora_chegada
                                                            )}
                                                        />

                                                        <Campo
                                                            label="Início"
                                                            value={formatarHora(
                                                                chamadoSelecionado.hora_inicio
                                                            )}
                                                        />

                                                        <Campo
                                                            label="Término"
                                                            value={formatarHora(
                                                                chamadoSelecionado.hora_fim
                                                            )}
                                                        />

                                                        <Campo
                                                            label="Tempo total"
                                                            value={formatarTexto(
                                                                chamadoSelecionado.hora_total_str ||
                                                                    chamadoSelecionado.hora_total
                                                            )}
                                                        />

                                                        <Campo
                                                            label="Hora extra"
                                                            value={formatarTexto(
                                                                chamadoSelecionado.hora_extra
                                                            )}
                                                        />

                                                        <Campo
                                                            label="Distância"
                                                            value={formatarTexto(
                                                                chamadoSelecionado.distancia
                                                            )}
                                                        />

                                                        <Campo
                                                            label="Data de criação"
                                                            value={formatarDataHora(
                                                                chamadoSelecionado.data_criacao
                                                            )}
                                                        />
                                                    </div>

                                                    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                                                        <Campo
                                                            label="Faturado"
                                                            value={formatarMoeda(
                                                                chamadoSelecionado.valor_total_cliente
                                                            )}
                                                            destaque
                                                        />

                                                        <Campo
                                                            label="Pago ao técnico"
                                                            value={formatarMoeda(
                                                                chamadoSelecionado.valor_total_tecnico
                                                            )}
                                                        />

                                                        <Campo
                                                            label="Lucro"
                                                            value={formatarMoeda(
                                                                converterNumero(
                                                                    chamadoSelecionado.valor_total_cliente
                                                                ) -
                                                                    converterNumero(
                                                                        chamadoSelecionado.valor_total_tecnico
                                                                    )
                                                            )}
                                                        />
                                                    </div>

                                                    <div className="mt-4 rounded-lg border border-border bg-muted/20 p-4">
                                                        <div className="flex items-center gap-2">
                                                            <Building2 className="h-4 w-4 text-blue-600" />

                                                            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                                                                Endereço
                                                            </p>
                                                        </div>

                                                        <p className="mt-2 text-sm text-foreground">
                                                            {chamadoSelecionado.endereco ||
                                                                "Endereço não informado."}
                                                        </p>
                                                    </div>

                                                    <div className="mt-3 rounded-lg border border-border bg-muted/20 p-4">
                                                        <div className="flex items-center gap-2">
                                                            <FileText className="h-4 w-4 text-blue-600" />

                                                            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                                                                Observações
                                                            </p>
                                                        </div>

                                                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-foreground">
                                                            {chamadoSelecionado.observacoes ||
                                                                "Nenhuma observação cadastrada."}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </Secao>
                            </div>

                            <div className="mt-5 flex flex-col gap-3 rounded-xl border border-border bg-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-emerald-600" />

                                    <p className="text-xs text-muted-foreground">
                                        Técnico selecionado:{" "}
                                        <span className="font-semibold text-foreground">
                                            {nome}
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
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default TecnicoDetalheModal;