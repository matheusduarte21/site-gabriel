import {
    useCallback,
    useEffect,
    useState,
} from "react";
import { Link } from "react-router-dom";
import {
    Boxes,
    Building2,
    ChevronRight,
    Loader2,
    PackagePlus,
    RefreshCw,
    RotateCcw,
    Tags,
    UserRound,
} from "lucide-react";
import AdminHeader from "../AdminHeader";
import { DashboardEstoque } from "../../../types/estoque.type";
import { getDashboardEstoque } from "../../../services/Estoque/estoque.service";

const EstoqueDashboard = () => {
    const [dados, setDados] =
        useState<DashboardEstoque | null>(
            null
        );

    const [loading, setLoading] =
        useState(true);

    const [erro, setErro] =
        useState<string | null>(null);

    const carregar = useCallback(
        async () => {
            try {
                setLoading(true);
                setErro(null);
                setDados(
                    await getDashboardEstoque()
                );
            } catch (error) {
                setErro(
                    error instanceof Error
                        ? error.message
                        : "Erro ao carregar o estoque."
                );
            } finally {
                setLoading(false);
            }
        },
        []
    );

    useEffect(() => {
        void carregar();
    }, [carregar]);

    const cards = dados
        ? [
              ["Total", dados.total],
              ["Novo", dados.novo],
              [
                  "Recondicionado",
                  dados.recondicionado,
              ],
              ["Ruim", dados.ruim],
              [
                  "Disponível",
                  dados.disponivel,
              ],
              [
                  "Com técnico",
                  dados.com_tecnico,
              ],
              [
                  "Manutenção",
                  dados.manutencao,
              ],
              ["Baixado", dados.baixado],
          ]
        : [];

    const acoes = [
        {
            to: "/admin/estoque/equipamentos",
            titulo:
                "Consultar equipamentos",
            icon: Boxes,
        },
        {
            to: "/admin/estoque/equipamentos?novo=1",
            titulo:
                "Cadastrar equipamento",
            icon: PackagePlus,
        },
        {
            to: "/admin/estoque/tipos",
            titulo:
                "Tipos de equipamento",
            icon: Tags,
        },
        {
            to: "/admin/estoque/movimentacoes",
            titulo:
                "Movimentar equipamentos",
            icon: RotateCcw,
        },
    ];

    return (
        <div>
            <AdminHeader
                title="Estoque"
                subtitle="Controle equipamentos, responsáveis e movimentações."
            />

            <div className="mb-5 flex justify-end">
                <button
                    type="button"
                    onClick={() => void carregar()}
                    disabled={loading}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 text-sm font-bold text-foreground"
                >
                    <RefreshCw
                        className={`h-4 w-4 ${
                            loading
                                ? "animate-spin"
                                : ""
                        }`}
                    />
                    Atualizar
                </button>
            </div>

            {erro && (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {erro}
                </div>
            )}

            {loading || !dados ? (
                <div className="flex min-h-[320px] items-center justify-center rounded-xl border border-border bg-card">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                <>
                    <section className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8">
                        {cards.map(
                            ([titulo, valor]) => (
                                <div
                                    key={
                                        titulo as string
                                    }
                                    className="rounded-xl border border-border bg-card p-4 shadow-sm"
                                >
                                    <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                                        {titulo}
                                    </p>

                                    <p className="mt-2 text-2xl font-bold text-foreground">
                                        {valor}
                                    </p>
                                </div>
                            )
                        )}
                    </section>

                    <section className="mt-5 grid gap-5 xl:grid-cols-2">
                        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                            <div className="flex items-center gap-2">
                                <Building2 className="h-5 w-5 text-primary" />
                                <h2 className="font-bold text-foreground">
                                    Contagem por empresa
                                </h2>
                            </div>

                            <div className="mt-4 space-y-2">
                                {dados.por_empresa.map(
                                    (item) => (
                                        <div
                                            key={
                                                item.id
                                            }
                                            className="flex items-center justify-between rounded-lg border border-border bg-background px-4 py-3"
                                        >
                                            <span className="font-semibold text-foreground">
                                                {
                                                    item.nome
                                                }
                                            </span>

                                            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                                                {
                                                    item.quantidade
                                                }
                                            </span>
                                        </div>
                                    )
                                )}
                            </div>
                        </div>

                        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                            <div className="flex items-center gap-2">
                                <UserRound className="h-5 w-5 text-emerald-600" />
                                <h2 className="font-bold text-foreground">
                                    Contagem por técnico
                                </h2>
                            </div>

                            <div className="mt-4 space-y-2">
                                {dados.por_tecnico.map(
                                    (item) => (
                                        <div
                                            key={
                                                item.id ||
                                                "sem-responsavel"
                                            }
                                            className="flex items-center justify-between rounded-lg border border-border bg-background px-4 py-3"
                                        >
                                            <span className="font-semibold text-foreground">
                                                {
                                                    item.nome
                                                }
                                            </span>

                                            <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-700">
                                                {
                                                    item.quantidade
                                                }
                                            </span>
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                    </section>

                    <section className="mt-5 rounded-xl border border-border bg-card p-5 shadow-sm">
                        <h2 className="text-lg font-bold text-foreground">
                            Ações principais
                        </h2>

                        <div className="mt-4 grid gap-3 md:grid-cols-2">
                            {acoes.map((acao) => (
                                <Link
                                    key={acao.to}
                                    to={acao.to}
                                    className="group flex items-center gap-4 rounded-xl border border-border bg-background p-4 hover:bg-secondary"
                                >
                                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                        <acao.icon className="h-6 w-6" />
                                    </span>

                                    <span className="flex-1 font-bold text-foreground">
                                        {
                                            acao.titulo
                                        }
                                    </span>

                                    <ChevronRight className="h-5 w-5 text-primary" />
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
