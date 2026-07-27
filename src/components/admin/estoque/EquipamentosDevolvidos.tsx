import {
    useCallback,
    useEffect,
    useState,
} from "react";
import {
    ChevronLeft,
    ChevronRight,
    Loader2,
} from "lucide-react";
import AdminHeader from "../AdminHeader";
import { EquipamentoMovimentacao } from "../../../types/estoque.type";
import { getDevolucoes } from "../../../services/Estoque/estoque.service";

const EquipamentosDevolvidos = () => {
    const [dados, setDados] = useState<
        EquipamentoMovimentacao[]
    >([]);

    const [pagina, setPagina] =
        useState(1);

    const [
        totalPaginas,
        setTotalPaginas,
    ] = useState(1);

    const [total, setTotal] =
        useState(0);

    const [loading, setLoading] =
        useState(true);

    const carregar = useCallback(
        async () => {
            try {
                setLoading(true);

                const resposta =
                    await getDevolucoes(
                        pagina,
                        10
                    );

                setDados(resposta.dados);
                setTotal(resposta.total);
                setTotalPaginas(
                    resposta.totalPaginas
                );
            } finally {
                setLoading(false);
            }
        },
        [pagina]
    );

    useEffect(() => {
        void carregar();
    }, [carregar]);

    const formatarData = (
        valor: string
    ) =>
        new Intl.DateTimeFormat(
            "pt-BR",
            {
                dateStyle: "short",
                timeStyle: "short",
            }
        ).format(new Date(valor));

    return (
        <div>
            <AdminHeader
                title="Equipamentos devolvidos"
                subtitle="Consulte o histórico de devoluções."
            />

            {loading ? (
                <div className="flex min-h-[320px] items-center justify-center rounded-xl border border-border bg-card">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                    <div className="divide-y divide-border">
                        {dados.map((item) => (
                            <article
                                key={item.id}
                                className="p-4"
                            >
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                    <div>
                                        <p className="font-bold text-foreground">
                                            {item
                                                .equipamento
                                                ?.tipo_equipamento
                                                ?.nome ||
                                                "Equipamento"}
                                        </p>

                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {item
                                                .equipamento
                                                ?.patrimonio ||
                                                item
                                                    .equipamento
                                                    ?.numero_serie ||
                                                "Sem identificação"}
                                        </p>
                                    </div>

                                    <span className="text-xs text-muted-foreground">
                                        {formatarData(
                                            item.criado_em
                                        )}
                                    </span>
                                </div>

                                <div className="mt-4 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
                                    <div>
                                        <p className="text-xs text-muted-foreground">
                                            Técnico
                                        </p>

                                        <p className="mt-1 font-bold text-foreground">
                                            {item
                                                .tecnico_origem
                                                ?.nome ||
                                                "Não informado"}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-muted-foreground">
                                            Empresa
                                        </p>

                                        <p className="mt-1 font-bold text-foreground">
                                            {item
                                                .cliente_origem
                                                ?.nome ||
                                                "Não informada"}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-muted-foreground">
                                            Modelo
                                        </p>

                                        <p className="mt-1 font-bold text-foreground">
                                            {item
                                                .equipamento
                                                ?.modelo ||
                                                "Não informado"}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-muted-foreground">
                                            Motivo
                                        </p>

                                        <p className="mt-1 font-bold text-foreground">
                                            {item.motivo ||
                                                "Não informado"}
                                        </p>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>

                    {dados.length === 0 && (
                        <div className="p-10 text-center text-sm text-muted-foreground">
                            Nenhuma devolução encontrada.
                        </div>
                    )}
                </div>
            )}

            {total > 0 && (
                <div className="mt-5 flex items-center justify-between rounded-xl border border-border bg-card p-4">
                    <span className="text-sm text-muted-foreground">
                        {total} devoluções
                    </span>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() =>
                                setPagina(
                                    Math.max(
                                        1,
                                        pagina - 1
                                    )
                                )
                            }
                            disabled={pagina === 1}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background disabled:opacity-40"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>

                        <span className="text-sm font-bold text-foreground">
                            {pagina} de{" "}
                            {totalPaginas}
                        </span>

                        <button
                            onClick={() =>
                                setPagina(
                                    Math.min(
                                        totalPaginas,
                                        pagina + 1
                                    )
                                )
                            }
                            disabled={
                                pagina ===
                                totalPaginas
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background disabled:opacity-40"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EquipamentosDevolvidos;
