import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import {
    Boxes,
    Building2,
    ChevronRight,
    Circle,
    CircleDot,
    Loader2,
    PackageCheck,
    PackagePlus,
    RefreshCw,
    RotateCcw,
    Tags,
    UserRound,
    Wrench,
} from "lucide-react";
import AdminHeader from "../AdminHeader";
import { DashboardEstoque } from "../../../types/estoque.type";
import { getDashboardEstoque } from "../../../services/Estoque/estoque.service";
import EstoquePaginacao from "./EstoquePaginacao";

const LIMITE_LISTA = 2;

interface CardProps {
    titulo: string;
    valor: number;
    descricao: string;
    icon: ReactNode;
    className: string;
    iconClassName: string;
}

const Card = ({
    titulo,
    valor,
    descricao,
    icon,
    className,
    iconClassName,
}: CardProps) => {
    return (
        <div
            className={`flex min-h-[145px] flex-col rounded-xl p-5 text-white shadow-md transition-transform hover:-translate-y-1 ${className}`}
        >
            <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-white/80">
                    {titulo}
                </p>

                <span
                    className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconClassName}`}
                >
                    {icon}
                </span>
            </div>

            <p className="mt-4 text-3xl font-bold tracking-tight">
                {valor}
            </p>

            <p className="mt-1 text-xs text-white/75">
                {descricao}
            </p>
        </div>
    );
};

const acoes = [
    {
        to: "/admin/estoque/equipamentos",
        titulo: "Consultar equipamentos",
        descricao: "Filtre e visualize todos os itens cadastrados.",
        icon: Boxes,
        className: "bg-blue-50 text-blue-600",
    },
    {
        to: "/admin/estoque/equipamentos?novo=1",
        titulo: "Cadastrar equipamento",
        descricao: "Registre um novo item no estoque.",
        icon: PackagePlus,
        className: "bg-cyan-50 text-cyan-600",
    },
    {
        to: "/admin/estoque/tipos",
        titulo: "Tipos de equipamento",
        descricao: "Cadastre e mantenha os tipos disponíveis.",
        icon: Tags,
        className: "bg-indigo-50 text-indigo-600",
    },
    {
        to: "/admin/estoque/movimentacoes",
        titulo: "Movimentar equipamentos",
        descricao: "Transfira a responsabilidade entre empresas e técnicos.",
        icon: RotateCcw,
        className: "bg-amber-50 text-amber-600",
    },
    {
        to: "/admin/estoque/devolvidos",
        titulo: "Equipamentos devolvidos",
        descricao: "Consulte o histórico de devoluções.",
        icon: PackageCheck,
        className: "bg-emerald-50 text-emerald-600",
    },
];

const EstoqueDashboard = () => {
    const [dados, setDados] = useState<DashboardEstoque | null>(null);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState<string | null>(null);
    const [paginaEmpresas, setPaginaEmpresas] = useState(1);
    const [paginaTecnicos, setPaginaTecnicos] = useState(1);

    const carregar = useCallback(async () => {
        try {
            setLoading(true);
            setErro(null);

            const resposta = await getDashboardEstoque();

            setDados(resposta);
        } catch (error) {
            setErro(
                error instanceof Error
                    ? error.message
                    : "Erro ao carregar o estoque."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void carregar();
    }, [carregar]);

    const totalPaginasEmpresas = Math.max(
        1,
        Math.ceil(
            (dados?.por_empresa.length || 0) /
                LIMITE_LISTA
        )
    );

    const totalPaginasTecnicos = Math.max(
        1,
        Math.ceil(
            (dados?.por_tecnico.length || 0) /
                LIMITE_LISTA
        )
    );

    const empresasPaginadas = useMemo(() => {
        if (!dados) {
            return [];
        }

        return dados.por_empresa.slice(
            (paginaEmpresas - 1) * LIMITE_LISTA,
            paginaEmpresas * LIMITE_LISTA
        );
    }, [dados, paginaEmpresas]);

    const tecnicosPaginados = useMemo(() => {
        if (!dados) {
            return [];
        }

        return dados.por_tecnico.slice(
            (paginaTecnicos - 1) * LIMITE_LISTA,
            paginaTecnicos * LIMITE_LISTA
        );
    }, [dados, paginaTecnicos]);

    useEffect(() => {
        if (paginaEmpresas > totalPaginasEmpresas) {
            setPaginaEmpresas(totalPaginasEmpresas);
        }
    }, [paginaEmpresas, totalPaginasEmpresas]);

    useEffect(() => {
        if (paginaTecnicos > totalPaginasTecnicos) {
            setPaginaTecnicos(totalPaginasTecnicos);
        }
    }, [paginaTecnicos, totalPaginasTecnicos]);

    return (
        <div>
            <div className="mb-5 flex justify-end">
                <button
                    type="button"
                    onClick={() => void carregar()}
                    disabled={loading}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 text-sm font-bold text-foreground shadow-sm hover:bg-secondary disabled:opacity-50"
                >
                    <RefreshCw
                        className={`h-4 w-4 ${
                            loading ? "animate-spin" : ""
                        }`}
                    />
                    Atualizar
                </button>
            </div>

            {erro && (
                <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    <Circle className="mt-0.5 h-5 w-5 shrink-0" />
                    {erro}
                </div>
            )}

            {loading || !dados ? (
                <div className="flex min-h-[320px] items-center justify-center rounded-xl border border-border bg-card">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                <>
                    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3">
                        <Card
                            titulo="Total"
                            valor={dados.total}
                            descricao="Equipamentos ativos no estoque"
                            icon={<Boxes className="h-5 w-5" />}
                            className="bg-blue-600"
                            iconClassName="bg-blue-500"
                        />

                        <Card
                            titulo="Novo"
                            valor={dados.novo}
                            descricao="Equipamentos em condição nova"
                            icon={<Circle className="h-5 w-5" />}
                            className="bg-cyan-600"
                            iconClassName="bg-cyan-500"
                        />

                        <Card
                            titulo="Recondicionado"
                            valor={dados.recondicionado}
                            descricao="Equipamentos recuperados"
                            icon={<CircleDot className="h-5 w-5" />}
                            className="bg-amber-500"
                            iconClassName="bg-amber-400"
                        />

                        <Card
                            titulo="Ruim"
                            valor={dados.ruim}
                            descricao="Equipamentos que exigem atenção"
                            icon={<Circle className="h-5 w-5" />}
                            className="bg-red-600"
                            iconClassName="bg-red-500"
                        />

                        <Card
                            titulo="Disponível"
                            valor={dados.disponivel}
                            descricao="Itens sem técnico responsável"
                            icon={<PackageCheck className="h-5 w-5" />}
                            className="bg-emerald-600"
                            iconClassName="bg-emerald-500"
                        />

                        <Card
                            titulo="Com técnico"
                            valor={dados.com_tecnico}
                            descricao="Itens atualmente atribuídos"
                            icon={<UserRound className="h-5 w-5" />}
                            className="bg-indigo-600"
                            iconClassName="bg-indigo-500"
                        />
                    </section>

                    <section className="mt-6 grid gap-6 xl:grid-cols-2">
                        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                            <div className="mb-6 flex items-center gap-2 border-b border-border pb-4">
                                <Building2 className="h-5 w-5 text-blue-600" />

                                <h2 className="text-lg font-bold text-foreground">
                                    Contagem por empresa
                                </h2>
                            </div>

                            <div className="space-y-3">
                                {empresasPaginadas.length === 0 ? (
                                    <p className="rounded-lg border border-dashed border-border bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">
                                        Nenhuma empresa encontrada.
                                    </p>
                                ) : (
                                    empresasPaginadas.map((item, index) => (
                                        <div
                                            key={item.id}
                                            className="flex items-center justify-between rounded-lg border border-border bg-background px-4 py-3 shadow-sm transition-all hover:border-blue-300 hover:bg-blue-50/40 hover:shadow-md"
                                        >
                                            <div className="flex min-w-0 items-center gap-3">
                                                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                                                    {(paginaEmpresas - 1) *
                                                        LIMITE_LISTA +
                                                        index +
                                                        1}
                                                </span>

                                                <span className="truncate text-sm font-semibold text-foreground">
                                                    {item.nome}
                                                </span>
                                            </div>

                                            <span className="shrink-0 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600">
                                                {item.quantidade}{" "}
                                                {item.quantidade === 1
                                                    ? "equipamento"
                                                    : "equipamentos"}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>

                            <EstoquePaginacao
                                paginaAtual={paginaEmpresas}
                                totalPaginas={totalPaginasEmpresas}
                                totalResultados={dados.por_empresa.length}
                                limite={LIMITE_LISTA}
                                onChange={setPaginaEmpresas}
                            />
                        </div>

                        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                            <div className="mb-6 flex items-center gap-2 border-b border-border pb-4">
                                <UserRound className="h-5 w-5 text-emerald-600" />

                                <h2 className="text-lg font-bold text-foreground">
                                    Contagem por técnico
                                </h2>
                            </div>

                            <div className="space-y-3">
                                {tecnicosPaginados.length === 0 ? (
                                    <p className="rounded-lg border border-dashed border-border bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">
                                        Nenhum técnico encontrado.
                                    </p>
                                ) : (
                                    tecnicosPaginados.map((item, index) => (
                                        <div
                                            key={item.id || "sem-responsavel"}
                                            className="flex items-center justify-between rounded-lg border border-border bg-background px-4 py-3 shadow-sm transition-all hover:border-emerald-300 hover:bg-emerald-50/30 hover:shadow-md"
                                        >
                                            <div className="flex min-w-0 items-center gap-3">
                                                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
                                                    {(paginaTecnicos - 1) *
                                                        LIMITE_LISTA +
                                                        index +
                                                        1}
                                                </span>

                                                <span className="truncate text-sm font-semibold text-foreground">
                                                    {item.nome}
                                                </span>
                                            </div>

                                            <span className="shrink-0 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600">
                                                {item.quantidade}{" "}
                                                {item.quantidade === 1
                                                    ? "equipamento"
                                                    : "equipamentos"}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>

                            <EstoquePaginacao
                                paginaAtual={paginaTecnicos}
                                totalPaginas={totalPaginasTecnicos}
                                totalResultados={dados.por_tecnico.length}
                                limite={LIMITE_LISTA}
                                onChange={setPaginaTecnicos}
                            />
                        </div>
                    </section>

                    <section className="mt-6 rounded-xl border border-border bg-card p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-foreground">
                            Ações principais
                        </h2>

                        <div className="mt-4 grid gap-3 md:grid-cols-2">
                            {acoes.map((acao) => (
                                <Link
                                    key={acao.to}
                                    to={acao.to}
                                    className="group flex items-center gap-4 rounded-xl border border-border bg-background p-4 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:bg-secondary/40 hover:shadow-md"
                                >
                                    <span
                                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${acao.className}`}
                                    >
                                        <acao.icon className="h-6 w-6" />
                                    </span>

                                    <div className="min-w-0 flex-1">
                                        <p className="font-bold text-foreground">
                                            {acao.titulo}
                                        </p>

                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {acao.descricao}
                                        </p>
                                    </div>

                                    <ChevronRight className="h-5 w-5 shrink-0 text-primary transition-transform group-hover:translate-x-1" />
                                </Link>
                            ))}
                        </div>
                    </section>
                </>
            )}
        </div>
    );
};

export default EstoqueDashboard;
