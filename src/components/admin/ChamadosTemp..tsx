import {
    type ReactNode,
    useEffect,
    useState,
} from "react";
import CrudPage, { Column } from "./CrudPage";
import ChamadoForm, { SelectOption } from "./ChamadoForm";
import { getTodosTecnicos } from "../../services/Tecnicos/get-all-tecnicos.service";
import { getTodosClientes } from "../../services/Clientes/get-all-cliente.service";
import { getTodosStatus } from "../../services/status/get-all-status.service";
import { getTodosChamados } from "../../services/Chamados/get-all-chamados.service";
import { deletarChamado } from "../../services/Chamados/delete-chamados.service";
import { criarChamado } from "../../services/Chamados/post-chamados.service";
import { atualizarChamado } from "../../services/Chamados/patch.chamados.service";
import { showError, showSuccess } from "../../lib/Utils/toast";
import { Chamado } from "../../types/chamado.type";

type ChamadoTabela = Chamado & {
    data_agendamento_formatada: string;
    valor_cliente_formatado: ReactNode;
    valor_tecnico_formatado: ReactNode;
    lucro_formatado: ReactNode;
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
        return "---";
    }

    const dataSemHorario = valor.split("T")[0];
    const partes = dataSemHorario.split("-");

    if (partes.length !== 3) {
        return valor;
    }

    const [ano, mes, dia] = partes;

    return `${dia}/${mes}/${ano}`;
};

const limparCamposApresentacao = (
    chamado: Chamado
): Chamado => {
    const dados = {
        ...chamado,
    } as Chamado & Record<string, unknown>;

    delete dados.data_agendamento_formatada;
    delete dados.valor_cliente_formatado;
    delete dados.valor_tecnico_formatado;
    delete dados.lucro_formatado;

    return dados as Chamado;
};

const Chamados = () => {
    const [chamados, setChamados] = useState<
        ChamadoTabela[]
    >([]);

    const [opcoesTecnicos, setOpcoesTecnicos] =
        useState<SelectOption[]>([]);

    const [opcoesClientes, setOpcoesClientes] =
        useState<SelectOption[]>([]);

    const [opcoesStatus, setOpcoesStatus] =
        useState<SelectOption[]>([]);

    const [loading, setLoading] = useState(true);

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

            const chamadosFormatados = chamadosDB.map(
                (chamado: any): ChamadoTabela => {
                    const valorCliente = converterNumero(
                        chamado.valor_total_cliente
                    );

                    const valorTecnico = converterNumero(
                        chamado.valor_total_tecnico
                    );

                    const lucro =
                        valorCliente - valorTecnico;

                    return {
                        ...chamado,

                        data_agendamento_formatada:
                            formatarData(
                                chamado.data_agendamento
                            ),

                        valor_cliente_formatado: (
                            <span className="inline-flex min-w-[110px] items-center justify-center rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700">
                                {formatarMoeda(valorCliente)}
                            </span>
                        ),

                        valor_tecnico_formatado: (
                            <span className="inline-flex min-w-[110px] items-center justify-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700">
                                {formatarMoeda(valorTecnico)}
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
                                {formatarMoeda(lucro)}
                            </span>
                        ),
                    };
                }
            );

            setChamados(chamadosFormatados);

            setOpcoesTecnicos(
                tecnicosDB.map((tecnico: any) => ({
                    value: tecnico.id,
                    label: tecnico.nome,
                }))
            );

            setOpcoesClientes(
                clientesDB.map((cliente: any) => ({
                    value: cliente.id,
                    label: cliente.nome,
                }))
            );

            setOpcoesStatus(
                statusDB.map((status: any) => ({
                    value: status.id,
                    label: status.descricao,
                }))
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

    const handleDeleteChamado = async (
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

    const handleSaveChamado = async (
        chamado: Chamado
    ) => {
        try {
            const dadosChamado =
                limparCamposApresentacao(chamado);

            if (dadosChamado.id) {
                await atualizarChamado(
                    dadosChamado.id,
                    dadosChamado
                );

                showSuccess(
                    "Chamado atualizado com sucesso!"
                );
            } else {
                await criarChamado(dadosChamado);

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
            options: opcoesTecnicos,
        },
        {
            key: "cliente_id",
            label: "Cliente",
            type: "select",
            options: opcoesClientes,
        },
        {
            key: "status_id",
            label: "Status",
            type: "select",
            options: opcoesStatus,
        },
        {
            key: "data_agendamento_formatada",
            label: "Agendamento",
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
            initialData={chamados}
            isLoading={loading}
            modalMaxWidth="max-w-6xl"
            onDelete={handleDeleteChamado}
            CustomForm={(props: any) => (
                <ChamadoForm
                    {...props}
                    onSubmit={async (data) => {
                        await handleSaveChamado(data);

                        if (props.onCancel) {
                            props.onCancel();
                        }
                    }}
                    tecnicosOptions={opcoesTecnicos}
                    clientesOptions={opcoesClientes}
                    statusOptions={opcoesStatus}
                />
            )}
        />
    );
};

export default Chamados;