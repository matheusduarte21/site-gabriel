import {
    type ReactNode,
    useEffect,
    useMemo,
    useState,
} from "react";
import {
    ClipboardList,
    DollarSign,
    TrendingUp,
    Wallet,
} from "lucide-react";
import CrudPage, {
    Column,
} from "./CrudPage";
import ChamadoForm, {
    SelectOption,
} from "./ChamadoForm";
import FiltroMes, {
    ValorFiltroMes,
} from "./FiltroMes";
import ExportarExcelButton from "./ExportarExcelButton";
import { getTodosTecnicos } from "../../services/Tecnicos/get-all-tecnicos.service";
import { getTodosClientes } from "../../services/Clientes/get-all-cliente.service";
import { getTodosStatus } from "../../services/status/get-all-status.service";
import { getTodosChamados } from "../../services/Chamados/get-all-chamados.service";
import { deletarChamado } from "../../services/Chamados/delete-chamados.service";
import { criarChamado } from "../../services/Chamados/post-chamados.service";
import { atualizarChamado } from "../../services/Chamados/patch.chamados.service";
import {
    showError,
    showSuccess,
} from "../../lib/Utils/toast";
import { Chamado } from "../../types/chamado.type";
import { exportarChamadosExcel } from "../../services/export/exportar-chamados-excel.service";

type ChamadoTabela = Chamado & {
    data_agendamento_formatada: string;
    valor_cliente_formatado: ReactNode;
    valor_tecnico_formatado: ReactNode;
    lucro_formatado: ReactNode;
};

interface CardResumoProps {
    titulo: string;
    descricao: string;
    valor: string;
    icone: ReactNode;
    tipo:
        | "chamados"
        | "faturado"
        | "pago"
        | "lucro"
        | "prejuizo";
}

const formatadorMoeda =
    new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    });

const obterMesAtual = (): string => {
    const hoje = new Date();

    const ano = hoje.getFullYear();

    const mes = String(
        hoje.getMonth() + 1
    ).padStart(2, "0");

    return `${ano}-${mes}`;
};

const converterNumero = (
    valor:
        | number
        | string
        | null
        | undefined
): number => {
    if (
        valor === null ||
        valor === undefined ||
        valor === ""
    ) {
        return 0;
    }

    if (typeof valor === "number") {
        return Number.isFinite(valor)
            ? valor
            : 0;
    }

    const valorNormalizado = valor
        .trim()
        .replace(/\s/g, "")
        .replace(
            /\.(?=\d{3}(?:\D|$))/g,
            ""
        )
        .replace(",", ".");

    const numero = Number(
        valorNormalizado
    );

    return Number.isFinite(numero)
        ? numero
        : 0;
};

const formatarMoeda = (
    valor:
        | number
        | string
        | null
        | undefined
): string => {
    return formatadorMoeda.format(
        converterNumero(valor)
    );
};

const formatarData = (
    valor:
        | string
        | null
        | undefined
): string => {
    if (!valor) {
        return "---";
    }

    const dataSemHorario =
        valor.split("T")[0];

    const partes =
        dataSemHorario.split("-");

    if (partes.length !== 3) {
        return valor;
    }

    const [ano, mes, dia] = partes;

    return `${dia}/${mes}/${ano}`;
};

const obterDataReferencia = (
    chamado: Chamado
): string | null => {
    return (
        chamado.data_agendamento ||
        chamado.data_criacao ||
        null
    );
};

const obterMesReferencia = (
    chamado: Chamado
): string | null => {
    const data =
        obterDataReferencia(chamado);

    if (!data) {
        return null;
    }

    const mes = data.slice(0, 7);

    return /^\d{4}-\d{2}$/.test(mes)
        ? mes
        : null;
};

const limparCamposApresentacao = (
    chamado: Chamado
): Chamado => {
    const dados = {
        ...chamado,
    } as Chamado &
        Record<string, unknown>;

    delete dados.data_agendamento_formatada;
    delete dados.valor_cliente_formatado;
    delete dados.valor_tecnico_formatado;
    delete dados.lucro_formatado;

    return dados as Chamado;
};

const CardResumo = ({
    titulo,
    descricao,
    valor,
    icone,
    tipo,
}: CardResumoProps) => {
    const estilos = {
        chamados:
            "border-blue-200 bg-blue-50 text-blue-700",
        faturado:
            "border-indigo-200 bg-indigo-50 text-indigo-700",
        pago:
            "border-amber-200 bg-amber-50 text-amber-700",
        lucro:
            "border-emerald-200 bg-emerald-50 text-emerald-700",
        prejuizo:
            "border-red-200 bg-red-50 text-red-700",
    };

    return (
        <div
            className={`rounded-xl border p-5 shadow-sm ${estilos[tipo]}`}
        >
            <div className="flex items-center justify-between gap-3">
                <div>
                    <p className="text-xs font-bold uppercase tracking-wide">
                        {titulo}
                    </p>

                    <p className="mt-0.5 text-[11px] opacity-75">
                        {descricao}
                    </p>
                </div>

                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/60">
                    {icone}
                </span>
            </div>

            <p className="mt-4 text-2xl font-bold tracking-tight">
                {valor}
            </p>
        </div>
    );
};

const Chamados = () => {
    const [
        chamadosOriginais,
        setChamadosOriginais,
    ] = useState<Chamado[]>([]);

    const [
        tecnicosDetalhados,
        setTecnicosDetalhados,
    ] = useState<any[]>([]);

    const [
        opcoesTecnicos,
        setOpcoesTecnicos,
    ] = useState<SelectOption[]>([]);

    const [
        opcoesClientes,
        setOpcoesClientes,
    ] = useState<SelectOption[]>([]);

    const [
        opcoesStatus,
        setOpcoesStatus,
    ] = useState<SelectOption[]>([]);

    const [
        mesSelecionado,
        setMesSelecionado,
    ] = useState<ValorFiltroMes>(
        obterMesAtual()
    );

    const [loading, setLoading] =
        useState(true);

    const fetchDados = async () => {
        try {
            setLoading(true);

            const [
                chamadosDB,
                tecnicosDB,
                clientesDB,
                statusDB,
            ] = await Promise.all([
                getTodosChamados(),
                getTodosTecnicos(),
                getTodosClientes(),
                getTodosStatus(),
            ]);

            setChamadosOriginais(
                chamadosDB as unknown as Chamado[]
            );

            setTecnicosDetalhados(
                tecnicosDB
            );

            setOpcoesTecnicos(
                tecnicosDB.map(
                    (tecnico: any) => ({
                        value: tecnico.id,
                        label: tecnico.nome,
                    })
                )
            );

            setOpcoesClientes(
                clientesDB.map(
                    (cliente: any) => ({
                        value: cliente.id,
                        label: cliente.nome,
                    })
                )
            );

            setOpcoesStatus(
                statusDB.map(
                    (status: any) => ({
                        value: status.id,
                        label:
                            status.descricao,
                    })
                )
            );
        } catch (error) {
            console.error(
                "Falha ao carregar os dados da página de chamados:",
                error
            );

            showError(
                "Não foi possível carregar os chamados."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDados();
    }, []);

    const chamadosFiltrados =
        useMemo(() => {
            if (
                mesSelecionado === "todos"
            ) {
                return chamadosOriginais;
            }

            return chamadosOriginais.filter(
                (chamado) =>
                    obterMesReferencia(
                        chamado
                    ) === mesSelecionado
            );
        }, [
            chamadosOriginais,
            mesSelecionado,
        ]);

    const resumo = useMemo(() => {
        return chamadosFiltrados.reduce(
            (acumulado, chamado) => {
                const faturado =
                    converterNumero(
                        chamado.valor_total_cliente
                    );

                const pago =
                    converterNumero(
                        chamado.valor_total_tecnico
                    );

                acumulado.faturado +=
                    faturado;

                acumulado.pago += pago;

                acumulado.lucro +=
                    faturado - pago;

                return acumulado;
            },
            {
                chamados:
                    chamadosFiltrados.length,
                faturado: 0,
                pago: 0,
                lucro: 0,
            }
        );
    }, [chamadosFiltrados]);

    const chamadosFormatados =
        useMemo(() => {
            return chamadosFiltrados.map(
                (
                    chamado
                ): ChamadoTabela => {
                    const valorCliente =
                        converterNumero(
                            chamado.valor_total_cliente
                        );

                    const valorTecnico =
                        converterNumero(
                            chamado.valor_total_tecnico
                        );

                    const lucro =
                        valorCliente -
                        valorTecnico;

                    return {
                        ...chamado,

                        data_agendamento_formatada:
                            formatarData(
                                obterDataReferencia(
                                    chamado
                                )
                            ),

                        valor_cliente_formatado:
                            (
                                <span className="inline-flex min-w-[110px] items-center justify-center rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700">
                                    {formatarMoeda(
                                        valorCliente
                                    )}
                                </span>
                            ),

                        valor_tecnico_formatado:
                            (
                                <span className="inline-flex min-w-[110px] items-center justify-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700">
                                    {formatarMoeda(
                                        valorTecnico
                                    )}
                                </span>
                            ),

                        lucro_formatado: (
                            <span
                                className={`inline-flex min-w-[110px] items-center justify-center rounded-full border px-3 py-1.5 text-xs font-bold ${
                                    lucro >= 0
                                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                        : "border-red-200 bg-red-50 text-red-700"
                                }`}
                            >
                                {formatarMoeda(
                                    lucro
                                )}
                            </span>
                        ),
                    };
                }
            );
        }, [chamadosFiltrados]);

    const handleExportarExcel =
        async () => {
            try {
                await exportarChamadosExcel({
                    chamados:
                        chamadosFiltrados,
                    periodo:
                        mesSelecionado,
                    tecnicos:
                        opcoesTecnicos,
                    clientes:
                        opcoesClientes,
                    status:
                        opcoesStatus,
                    tecnicosDetalhados,
                });

                showSuccess(
                    "Planilha exportada com sucesso!"
                );
            } catch (error) {
                console.error(
                    "Erro ao exportar Excel:",
                    error
                );

                showError(
                    "Não foi possível gerar a planilha."
                );
            }
        };

    const handleDeleteChamado =
        async (
            id: string | number
        ) => {
            try {
                await deletarChamado(id);

                showSuccess(
                    "Chamado removido com sucesso!"
                );

                await fetchDados();
            } catch (error) {
                showError(
                    "Erro ao remover o chamado."
                );

                throw error;
            }
        };

    const handleSaveChamado =
        async (
            chamado: Chamado
        ) => {
            try {
                const dadosChamado =
                    limparCamposApresentacao(
                        chamado
                    );

                if (dadosChamado.id) {
                    await atualizarChamado(
                        dadosChamado.id,
                        dadosChamado
                    );

                    showSuccess(
                        "Chamado atualizado com sucesso!"
                    );
                } else {
                    await criarChamado(
                        dadosChamado
                    );

                    showSuccess(
                        "Chamado criado com sucesso!"
                    );
                }

                await fetchDados();
            } catch (error) {
                showError(
                    "Erro ao salvar o chamado."
                );

                throw error;
            }
        };

    const columns: Column[] = [
        {
            key: "numero_chamado",
            label: "Nº Chamado",
        },
        {
            key: "empresa",
            label: "Empresa",
        },
        {
            key: "tecnico_id",
            label: "Técnico",
            type: "select",
            options:
                opcoesTecnicos,
        },
        {
            key: "cliente_id",
            label: "Cliente",
            type: "select",
            options:
                opcoesClientes,
        },
        {
            key: "status_id",
            label: "Status",
            type: "select",
            options:
                opcoesStatus,
        },
        {
            key: "data_agendamento_formatada",
            label: "Data",
        },
        {
            key: "valor_cliente_formatado",
            label: "Faturado",
        },
        {
            key: "valor_tecnico_formatado",
            label: "Pago",
        },
        {
            key: "lucro_formatado",
            label: "Lucro",
        },
    ];

    return (
        <CrudPage
            title="Chamados"
            subtitle="Gerenciar chamados técnicos e informações financeiras"
            columns={columns}
            initialData={
                chamadosFormatados
            }
            isLoading={loading}
            modalMaxWidth="max-w-6xl"
            onDelete={
                handleDeleteChamado
            }
            topContent={
                <div className="space-y-4">
                    <FiltroMes
                        value={
                            mesSelecionado
                        }
                        onChange={
                            setMesSelecionado
                        }
                    />

                    <div className="flex justify-end">
                        <ExportarExcelButton
                            onExport={
                                handleExportarExcel
                            }
                            disabled={loading}
                            label="Exportar relatório Excel"
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <CardResumo
                            titulo="Chamados"
                            descricao="Atendimentos no período"
                            valor={String(
                                resumo.chamados
                            )}
                            icone={
                                <ClipboardList className="h-5 w-5" />
                            }
                            tipo="chamados"
                        />

                        <CardResumo
                            titulo="Faturado"
                            descricao="Cobrado dos clientes"
                            valor={formatarMoeda(
                                resumo.faturado
                            )}
                            icone={
                                <DollarSign className="h-5 w-5" />
                            }
                            tipo="faturado"
                        />

                        <CardResumo
                            titulo="Pago"
                            descricao="Repassado aos técnicos"
                            valor={formatarMoeda(
                                resumo.pago
                            )}
                            icone={
                                <Wallet className="h-5 w-5" />
                            }
                            tipo="pago"
                        />

                        <CardResumo
                            titulo={
                                resumo.lucro >= 0
                                    ? "Lucro"
                                    : "Prejuízo"
                            }
                            descricao="Resultado da operação"
                            valor={formatarMoeda(
                                resumo.lucro
                            )}
                            icone={
                                <TrendingUp className="h-5 w-5" />
                            }
                            tipo={
                                resumo.lucro >= 0
                                    ? "lucro"
                                    : "prejuizo"
                            }
                        />
                    </div>
                </div>
            }
            CustomForm={(
                props: any
            ) => (
                <ChamadoForm
                    {...props}
                    onSubmit={async (
                        data
                    ) => {
                        await handleSaveChamado(
                            data
                        );

                        if (
                            props.onCancel
                        ) {
                            props.onCancel();
                        }
                    }}
                    tecnicosOptions={
                        opcoesTecnicos
                    }
                    clientesOptions={
                        opcoesClientes
                    }
                    statusOptions={
                        opcoesStatus
                    }
                />
            )}
        />
    );
};

export default Chamados;