import {
    useEffect,
    useMemo,
    useState,
} from "react";
import CrudPage, {
    Column,
    CrudItem,
} from "./CrudPage";
import TecnicoForm, {
    SelectOption,
} from "./tecnicoForm";
import FiltroMes, {
    ValorFiltroMes,
} from "./FiltroMes";
import TecnicoFinanceiroModal, {
    TecnicoResumoMensal,
} from "./TecnicoFinanceiroModal";
import { getTodosTecnicos } from "../../services/Tecnicos/get-all-tecnicos.service";
import { deletarTecnico } from "../../services/Tecnicos/delete-usuarios.service";
import { criarTecnico } from "../../services/Tecnicos/post-tercnico.service";
import { atualizarTecnico } from "../../services/Tecnicos/patch-tecnicos.sevice";
import { getTodosEstados } from "../../services/Estados/get-all-estados.service";
import { getUsuariosParaSelect } from "../../services/Usuarios/get-usuarios-select.service";
import { getTodosChamados } from "../../services/Chamados/get-all-chamados.service";
import {
    showError,
    showSuccess,
} from "../../lib/Utils/toast";
import { Chamado } from "../../types/chamado.type";

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
    valor: number
): string => {
    return formatadorMoeda.format(
        valor
    );
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
    const dataReferencia =
        obterDataReferencia(chamado);

    if (!dataReferencia) {
        return null;
    }

    const mesReferencia =
        dataReferencia.slice(0, 7);

    return /^\d{4}-\d{2}$/.test(
        mesReferencia
    )
        ? mesReferencia
        : null;
};

const limparCamposApresentacao = (
    tecnico: any
) => {
    const dados = {
        ...tecnico,
    };

    delete dados.estado;
    delete dados.municipio;
    delete dados.nome_estado;
    delete dados.nome_municipio;
    delete dados.data_nascimento_formatada;
    delete dados.chamados;
    delete dados.pendentes;
    delete dados.em_andamento;
    delete dados.finalizados;
    delete dados.faturado;
    delete dados.pago;
    delete dados.lucro;
    delete dados.margem;
    delete dados.status_chamados_formatado;
    delete dados.faturado_formatado;
    delete dados.pago_formatado;
    delete dados.lucro_formatado;

    return dados;
};

const Tecnicos = () => {
    const [
        tecnicosOriginais,
        setTecnicosOriginais,
    ] = useState<any[]>([]);

    const [
        chamadosOriginais,
        setChamadosOriginais,
    ] = useState<Chamado[]>([]);

    const [
        opcoesEstados,
        setOpcoesEstados,
    ] = useState<SelectOption[]>([]);

    const [
        opcoesUsuarios,
        setOpcoesUsuarios,
    ] = useState<SelectOption[]>([]);

    const [
        mesSelecionado,
        setMesSelecionado,
    ] = useState<ValorFiltroMes>(
        obterMesAtual()
    );

    const [
        tecnicoSelecionado,
        setTecnicoSelecionado,
    ] =
        useState<TecnicoResumoMensal | null>(
            null
        );

    const [
        modalTecnicoAberto,
        setModalTecnicoAberto,
    ] = useState(false);

    const [loading, setLoading] =
        useState(true);

    const fetchData = async () => {
        try {
            setLoading(true);

            const [
                dadosTecnicos,
                dadosEstados,
                dadosUsuarios,
                dadosChamados,
            ] = await Promise.all([
                getTodosTecnicos(),
                getTodosEstados(),
                getUsuariosParaSelect(),
                getTodosChamados(),
            ]);

            setTecnicosOriginais(
                dadosTecnicos
            );

            setChamadosOriginais(
                dadosChamados as unknown as Chamado[]
            );

            setOpcoesEstados(
                dadosEstados.map(
                    (estado: any) => ({
                        value: estado.id,
                        label: estado.nome,
                    })
                )
            );

            setOpcoesUsuarios(
                dadosUsuarios.map(
                    (usuario: any) => ({
                        value: usuario.id,
                        label: usuario.email,
                    })
                )
            );
        } catch (error) {
            console.error(
                "Erro ao carregar dados:",
                error
            );

            showError(
                "Erro ao carregar dados de técnicos."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const chamadosFiltrados =
        useMemo(() => {
            if (
                mesSelecionado ===
                "todos"
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

    const tecnicosTabela = useMemo(() => {
        const indicadoresPorTecnico =
            new Map<
                string,
                {
                    chamados: number;
                    pendentes: number;
                    emAndamento: number;
                    finalizados: number;
                    faturado: number;
                    pago: number;
                }
            >();

        chamadosFiltrados.forEach(
            (chamado) => {
                if (!chamado.tecnico_id) {
                    return;
                }

                const tecnicoId = String(
                    chamado.tecnico_id
                );

                const indicadorAtual =
                    indicadoresPorTecnico.get(
                        tecnicoId
                    ) ?? {
                        chamados: 0,
                        pendentes: 0,
                        emAndamento: 0,
                        finalizados: 0,
                        faturado: 0,
                        pago: 0,
                    };

                indicadorAtual.chamados +=
                    1;

                indicadorAtual.faturado +=
                    converterNumero(
                        chamado.valor_total_cliente
                    );

                indicadorAtual.pago +=
                    converterNumero(
                        chamado.valor_total_tecnico
                    );

                const statusId = Number(
                    chamado.status_id
                );

                if (statusId === 1) {
                    indicadorAtual.pendentes +=
                        1;
                }

                if (statusId === 2) {
                    indicadorAtual.emAndamento +=
                        1;
                }

                if (statusId === 3) {
                    indicadorAtual.finalizados +=
                        1;
                }

                indicadoresPorTecnico.set(
                    tecnicoId,
                    indicadorAtual
                );
            }
        );

        return tecnicosOriginais.map(
            (tecnico: any) => {
                const indicadores =
                    indicadoresPorTecnico.get(
                        String(tecnico.id)
                    ) ?? {
                        chamados: 0,
                        pendentes: 0,
                        emAndamento: 0,
                        finalizados: 0,
                        faturado: 0,
                        pago: 0,
                    };

                const lucro =
                    indicadores.faturado -
                    indicadores.pago;

                const margem =
                    indicadores.faturado >
                    0
                        ? (lucro /
                              indicadores.faturado) *
                          100
                        : 0;

                return {
                    ...tecnico,

                    nome_estado:
                        tecnico.estado?.nome ||
                        "---",

                    nome_municipio:
                        tecnico.municipio
                            ?.nome || "---",

                    data_nascimento_formatada:
                        tecnico.data_nascimento
                            ? tecnico.data_nascimento
                                  .split("-")
                                  .reverse()
                                  .join("/")
                            : "---",

                    chamados:
                        indicadores.chamados,

                    pendentes:
                        indicadores.pendentes,

                    em_andamento:
                        indicadores.emAndamento,

                    finalizados:
                        indicadores.finalizados,

                    faturado:
                        indicadores.faturado,

                    pago: indicadores.pago,

                    lucro,

                    margem,

                    status_chamados_formatado:
                        (
                            <div className="flex min-w-[245px] flex-wrap items-center gap-1.5">
                                <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300">
                                    Pendentes{" "}
                                    {
                                        indicadores.pendentes
                                    }
                                </span>

                                <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300">
                                    Andamento{" "}
                                    {
                                        indicadores.emAndamento
                                    }
                                </span>

                                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300">
                                    Finalizados{" "}
                                    {
                                        indicadores.finalizados
                                    }
                                </span>
                            </div>
                        ),

                    faturado_formatado: (
                        <span className="inline-flex min-w-[105px] items-center justify-center rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950 dark:text-indigo-300">
                            {formatarMoeda(
                                indicadores.faturado
                            )}
                        </span>
                    ),

                    pago_formatado: (
                        <span className="inline-flex min-w-[105px] items-center justify-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300">
                            {formatarMoeda(
                                indicadores.pago
                            )}
                        </span>
                    ),

                    lucro_formatado: (
                        <span
                            className={`inline-flex min-w-[105px] items-center justify-center rounded-full border px-3 py-1.5 text-xs font-bold ${
                                lucro >= 0
                                    ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300"
                                    : "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
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
    }, [
        tecnicosOriginais,
        chamadosFiltrados,
    ]);

    const chamadosTecnicoSelecionado =
        useMemo(() => {
            if (!tecnicoSelecionado) {
                return [];
            }

            return chamadosFiltrados.filter(
                (chamado) =>
                    String(
                        chamado.tecnico_id
                    ) ===
                    String(
                        tecnicoSelecionado.id
                    )
            );
        }, [
            chamadosFiltrados,
            tecnicoSelecionado,
        ]);

    const handleSaveTecnico =
        async (tecnico: any) => {
            try {
                const dadosTecnico =
                    limparCamposApresentacao(
                        tecnico
                    );

                if (
                    dadosTecnico.id &&
                    typeof dadosTecnico.id ===
                        "string" &&
                    dadosTecnico.id.length >
                        30
                ) {
                    await atualizarTecnico(
                        dadosTecnico.id,
                        dadosTecnico
                    );

                    showSuccess(
                        "Técnico atualizado!"
                    );
                } else {
                    await criarTecnico(
                        dadosTecnico
                    );

                    showSuccess(
                        "Técnico criado!"
                    );
                }

                await fetchData();
            } catch (error) {
                console.error(error);

                showError(
                    "Erro ao salvar técnico."
                );

                throw error;
            }
        };

    const handleDeleteTecnico =
        async (
            id: string | number
        ) => {
            try {
                await deletarTecnico(id);

                showSuccess(
                    "Técnico removido!"
                );

                await fetchData();
            } catch (error) {
                console.error(error);

                showError(
                    "Erro ao remover técnico."
                );

                throw error;
            }
        };

    const abrirPainelTecnico = (
        item: CrudItem
    ) => {
        setTecnicoSelecionado(
            item as TecnicoResumoMensal
        );

        setModalTecnicoAberto(true);
    };

    const fecharPainelTecnico = () => {
        setModalTecnicoAberto(false);
        setTecnicoSelecionado(null);
    };

    const columns: Column[] = [
        {
            key: "nome",
            label: "Nome",
        },
        {
            key: "email_contato",
            label: "E-mail",
        },
        {
            key: "nome_municipio",
            label: "Município",
        },
        {
            key: "chamados",
            label: "Chamados",
        },
        {
            key: "status_chamados_formatado",
            label: "Situação dos chamados",
        },
        {
            key: "faturado_formatado",
            label: "Faturado",
        },
        {
            key: "pago_formatado",
            label: "A pagar",
        },
        {
            key: "lucro_formatado",
            label: "Lucro",
        },
    ];

    return (
        <>
            <CrudPage
                title="Técnicos"
                subtitle="Gerenciar técnicos e acompanhar o desempenho financeiro"
                columns={columns}
                initialData={
                    tecnicosTabela
                }
                isLoading={loading}
                modalMaxWidth="max-w-3xl"
                topContent={
                    <FiltroMes
                        value={
                            mesSelecionado
                        }
                        onChange={
                            setMesSelecionado
                        }
                    />
                }
                onView={
                    abrirPainelTecnico
                }
                onDelete={
                    handleDeleteTecnico
                }
                CustomForm={(
                    props: any
                ) => (
                    <TecnicoForm
                        {...props}
                        estadosOptions={
                            opcoesEstados
                        }
                        usuariosOptions={
                            opcoesUsuarios
                        }
                        onSubmit={async (
                            data
                        ) => {
                            await handleSaveTecnico(
                                data
                            );

                            props.onCancel();
                        }}
                    />
                )}
            />

            <TecnicoFinanceiroModal
                isOpen={
                    modalTecnicoAberto
                }
                onClose={
                    fecharPainelTecnico
                }
                tecnico={
                    tecnicoSelecionado
                }
                chamados={
                    chamadosTecnicoSelecionado
                }
                mesSelecionado={
                    mesSelecionado
                }
            />
        </>
    );
};

export default Tecnicos;