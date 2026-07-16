import ExcelJS from "exceljs";
import { Chamado } from "../../types/chamado.type";
import {
    aplicarBordasTabela,
    aplicarCabecalhoTabela,
    aplicarFormatoData,
    aplicarFormatoMoeda,
    aplicarFormatoPercentual,
    aplicarTituloPlanilha,
    ajustarLargurasColunas,
    baixarWorkbook,
    configurarTabelaExcel,
    converterDataExcel,
    converterNumero,
    formatarPeriodoRelatorio,
    nomePeriodoArquivo,
    PeriodoRelatorio,
} from "./excel.utils";

interface OpcaoExportacao {
    value: string | number;
    label: string;
}

interface TecnicoExportacao {
    id: string | number;
    nome?: string;
    email_contato?: string | null;
    estado?: string | {
        nome?: string;
        sigla?: string;
    } | null;
    municipio?: string | {
        nome?: string;
    } | null;
    nome_estado?: string;
    nome_municipio?: string;
}

interface ExportarChamadosExcelParams {
    chamados: Chamado[];
    periodo: PeriodoRelatorio;
    tecnicos: OpcaoExportacao[];
    clientes: OpcaoExportacao[];
    status: OpcaoExportacao[];
    tecnicosDetalhados?: TecnicoExportacao[];
}

interface ResumoAgrupado {
    chamados: number;
    pendentes: number;
    emAndamento: number;
    finalizados: number;
    retornos: number;
    faturado: number;
    pago: number;
}

interface ResumoTecnicoAgrupado
    extends ResumoAgrupado {
    valorChamados: number;
    horaExtra: number;
    deslocamento: number;
    reembolso: number;
}

const STATUS_PADRAO: Record<string, string> = {
    "1": "Pendente",
    "2": "Em andamento",
    "3": "Finalizado",
};

const obterNomeEstado = (
    tecnico: TecnicoExportacao | undefined
): string => {
    if (!tecnico) {
        return "Não informado";
    }

    if (typeof tecnico.estado === "string") {
        return tecnico.estado;
    }

    return (
        tecnico.estado?.nome ||
        tecnico.estado?.sigla ||
        tecnico.nome_estado ||
        "Não informado"
    );
};

const obterNomeMunicipio = (
    tecnico: TecnicoExportacao | undefined
): string => {
    if (!tecnico) {
        return "Não informado";
    }

    if (typeof tecnico.municipio === "string") {
        return tecnico.municipio;
    }

    return (
        tecnico.municipio?.nome ||
        tecnico.nome_municipio ||
        "Não informado"
    );
};

const criarResumoVazio = (): ResumoAgrupado => ({
    chamados: 0,
    pendentes: 0,
    emAndamento: 0,
    finalizados: 0,
    retornos: 0,
    faturado: 0,
    pago: 0,
});

const criarResumoTecnicoVazio =
    (): ResumoTecnicoAgrupado => ({
        ...criarResumoVazio(),
        valorChamados: 0,
        horaExtra: 0,
        deslocamento: 0,
        reembolso: 0,
    });

const atualizarStatus = (
    resumo: ResumoAgrupado,
    statusId: string | number | null | undefined
) => {
    const status = Number(statusId);

    if (status === 1) {
        resumo.pendentes += 1;
    }

    if (status === 2) {
        resumo.emAndamento += 1;
    }

    if (status === 3) {
        resumo.finalizados += 1;
    }
};

export const exportarChamadosExcel = async ({
    chamados,
    periodo,
    tecnicos,
    clientes,
    status,
    tecnicosDetalhados = [],
}: ExportarChamadosExcelParams) => {
    const workbook = new ExcelJS.Workbook();

    workbook.creator = "Teccorp";
    workbook.lastModifiedBy = "Teccorp";
    workbook.created = new Date();
    workbook.modified = new Date();
    workbook.company = "Teccorp";
    workbook.subject =
        "Relatório de chamados e fechamento financeiro";
    workbook.title = `Relatório Teccorp - ${formatarPeriodoRelatorio(
        periodo
    )}`;

    const tecnicosMap = new Map(
        tecnicos.map((tecnico) => [
            String(tecnico.value),
            tecnico.label,
        ])
    );

    const clientesMap = new Map(
        clientes.map((cliente) => [
            String(cliente.value),
            cliente.label,
        ])
    );

    const statusMap = new Map(
        status.map((item) => [
            String(item.value),
            item.label,
        ])
    );

    const tecnicosDetalhadosMap = new Map(
        tecnicosDetalhados.map((tecnico) => [
            String(tecnico.id),
            tecnico,
        ])
    );

    const obterNomeTecnico = (
        tecnicoId: string | number | null | undefined
    ) => {
        if (
            tecnicoId === null ||
            tecnicoId === undefined
        ) {
            return "Não informado";
        }

        return (
            tecnicosMap.get(String(tecnicoId)) ||
            tecnicosDetalhadosMap.get(
                String(tecnicoId)
            )?.nome ||
            "Não informado"
        );
    };

    const obterNomeCliente = (
        clienteId: string | number | null | undefined
    ) => {
        if (
            clienteId === null ||
            clienteId === undefined
        ) {
            return "Não informado";
        }

        return (
            clientesMap.get(String(clienteId)) ||
            "Não informado"
        );
    };

    const obterNomeStatus = (
        statusId: string | number | null | undefined
    ) => {
        if (
            statusId === null ||
            statusId === undefined
        ) {
            return "Não informado";
        }

        return (
            statusMap.get(String(statusId)) ||
            STATUS_PADRAO[String(statusId)] ||
            `Status ${statusId}`
        );
    };

    const totalFaturado = chamados.reduce(
        (total, chamado) =>
            total +
            converterNumero(
                chamado.valor_total_cliente
            ),
        0
    );

    const totalPago = chamados.reduce(
        (total, chamado) =>
            total +
            converterNumero(
                chamado.valor_total_tecnico
            ),
        0
    );

    const lucroTotal = totalFaturado - totalPago;

    const margemTotal =
        totalFaturado > 0
            ? lucroTotal / totalFaturado
            : 0;

    const ticketMedio =
        chamados.length > 0
            ? totalFaturado / chamados.length
            : 0;

    const pendentes = chamados.filter(
        (chamado) =>
            Number(chamado.status_id) === 1
    ).length;

    const emAndamento = chamados.filter(
        (chamado) =>
            Number(chamado.status_id) === 2
    ).length;

    const finalizados = chamados.filter(
        (chamado) =>
            Number(chamado.status_id) === 3
    ).length;

    const retornos = chamados.filter(
        (chamado) => chamado.retorno
    ).length;

    const empresasDistintas = new Set(
        chamados
            .map((chamado) =>
                chamado.empresa?.trim()
            )
            .filter(Boolean)
    ).size;

    const tecnicosDistintos = new Set(
        chamados
            .map((chamado) =>
                chamado.tecnico_id
                    ? String(chamado.tecnico_id)
                    : null
            )
            .filter(Boolean)
    ).size;

    const resumoSheet =
        workbook.addWorksheet("Resumo");

    aplicarTituloPlanilha(
        resumoSheet,
        "Fechamento Teccorp",
        formatarPeriodoRelatorio(periodo),
        2
    );

    aplicarCabecalhoTabela(
        resumoSheet,
        4,
        ["Indicador", "Resultado"]
    );

    const indicadoresResumo = [
        {
            indicador: "Período",
            valor: formatarPeriodoRelatorio(periodo),
            tipo: "texto",
        },
        {
            indicador: "Total de chamados",
            valor: chamados.length,
            tipo: "numero",
        },
        {
            indicador: "Pendentes",
            valor: pendentes,
            tipo: "numero",
        },
        {
            indicador: "Em andamento",
            valor: emAndamento,
            tipo: "numero",
        },
        {
            indicador: "Finalizados",
            valor: finalizados,
            tipo: "numero",
        },
        {
            indicador: "Retornos",
            valor: retornos,
            tipo: "numero",
        },
        {
            indicador: "Empresas atendidas",
            valor: empresasDistintas,
            tipo: "numero",
        },
        {
            indicador: "Técnicos envolvidos",
            valor: tecnicosDistintos,
            tipo: "numero",
        },
        {
            indicador: "Faturamento",
            valor: totalFaturado,
            tipo: "moeda",
        },
        {
            indicador: "Total pago",
            valor: totalPago,
            tipo: "moeda",
        },
        {
            indicador: "Lucro",
            valor: lucroTotal,
            tipo: "moeda",
        },
        {
            indicador: "Margem",
            valor: margemTotal,
            tipo: "percentual",
        },
        {
            indicador: "Ticket médio",
            valor: ticketMedio,
            tipo: "moeda",
        },
    ];

    indicadoresResumo.forEach((indicador) => {
        const row = resumoSheet.addRow([
            indicador.indicador,
            indicador.valor,
        ]);

        const valorCell = row.getCell(2);

        if (indicador.tipo === "moeda") {
            valorCell.numFmt =
                'R$ #,##0.00;[Red]-R$ #,##0.00';
        }

        if (indicador.tipo === "percentual") {
            valorCell.numFmt = "0.00%";
        }

        if (indicador.indicador === "Faturamento") {
            valorCell.font = {
                bold: true,
                color: {
                    argb: "FF4338CA",
                },
            };
        }

        if (indicador.indicador === "Total pago") {
            valorCell.font = {
                bold: true,
                color: {
                    argb: "FFD97706",
                },
            };
        }

        if (indicador.indicador === "Lucro") {
            valorCell.font = {
                bold: true,
                color: {
                    argb:
                        lucroTotal >= 0
                            ? "FF059669"
                            : "FFDC2626",
                },
            };
        }
    });

    configurarTabelaExcel(resumoSheet, 4, 2);
    aplicarBordasTabela(resumoSheet, 4);
    ajustarLargurasColunas(resumoSheet, 4);

    resumoSheet.getColumn(1).width = 30;
    resumoSheet.getColumn(2).width = 24;

    const chamadosSheet =
        workbook.addWorksheet("Chamados");

    const colunasChamados = [
        "ID do chamado",
        "Nº chamado",
        "Empresa",
        "Cliente",
        "ID cliente",
        "Técnico",
        "ID técnico",
        "Status",
        "ID status",
        "Retorno",
        "Data de criação",
        "Data do agendamento",
        "Hora do agendamento",
        "Hora de chegada",
        "Hora de início",
        "Hora de término",
        "Tempo total",
        "Hora extra",
        "Endereço",
        "Distância",
        "Observações",
        "Valor chamado cliente",
        "Hora extra cliente",
        "Deslocamento cliente",
        "Reembolso cliente",
        "Total faturado",
        "Valor chamado técnico",
        "Hora extra técnico",
        "Deslocamento técnico",
        "Reembolso técnico",
        "Total pago",
        "Lucro",
        "Margem",
        "Arquivo",
    ];

    aplicarTituloPlanilha(
        chamadosSheet,
        "Chamados Teccorp",
        formatarPeriodoRelatorio(periodo),
        colunasChamados.length
    );

    aplicarCabecalhoTabela(
        chamadosSheet,
        4,
        colunasChamados
    );

    chamados.forEach((chamado) => {
        const registro = chamado as Chamado & {
            distancia?: string | number | null;
        };

        const faturado = converterNumero(
            chamado.valor_total_cliente
        );

        const pago = converterNumero(
            chamado.valor_total_tecnico
        );

        const lucro = faturado - pago;

        const margem =
            faturado > 0 ? lucro / faturado : 0;

        const row = chamadosSheet.addRow([
            chamado.id || "",
            chamado.numero_chamado || "",
            chamado.empresa || "Não informado",
            obterNomeCliente(chamado.cliente_id),
            chamado.cliente_id || "",
            obterNomeTecnico(chamado.tecnico_id),
            chamado.tecnico_id || "",
            obterNomeStatus(chamado.status_id),
            chamado.status_id || "",
            chamado.retorno ? "Sim" : "Não",
            converterDataExcel(
                chamado.data_criacao
            ),
            converterDataExcel(
                chamado.data_agendamento
            ),
            chamado.hora_agendamento || "",
            chamado.hora_chegada || "",
            chamado.hora_inicio || "",
            chamado.hora_fim || "",
            chamado.hora_total_str ||
                chamado.hora_total ||
                "",
            chamado.hora_extra || "",
            chamado.endereco || "",
            registro.distancia || "",
            chamado.observacoes || "",
            converterNumero(
                chamado.valor_chamado_cliente
            ),
            converterNumero(
                chamado.hora_extra_cliente
            ),
            converterNumero(
                chamado.deslocamento_cliente
            ),
            converterNumero(
                chamado.reembolso_cliente
            ),
            faturado,
            converterNumero(
                chamado.valor_chamado_tecnico
            ),
            converterNumero(
                chamado.hora_extra_tecnico
            ),
            converterNumero(
                chamado.deslocamento_tecnico
            ),
            converterNumero(
                chamado.reembolso_tecnico
            ),
            pago,
            lucro,
            margem,
            chamado.url_arquivo || "",
        ]);

        if (chamado.url_arquivo) {
            const arquivoCell = row.getCell(34);

            arquivoCell.value = {
                text: "Abrir arquivo",
                hyperlink: chamado.url_arquivo,
            };

            arquivoCell.font = {
                color: {
                    argb: "FF2563EB",
                },
                underline: true,
            };
        }

        row.getCell(26).font = {
            bold: true,
            color: {
                argb: "FF4338CA",
            },
        };

        row.getCell(31).font = {
            bold: true,
            color: {
                argb: "FFD97706",
            },
        };

        row.getCell(32).font = {
            bold: true,
            color: {
                argb:
                    lucro >= 0
                        ? "FF059669"
                        : "FFDC2626",
            },
        };
    });

    aplicarFormatoData(
        chamadosSheet,
        [11, 12]
    );

    aplicarFormatoMoeda(
        chamadosSheet,
        [
            22, 23, 24, 25, 26, 27, 28, 29,
            30, 31, 32,
        ]
    );

    aplicarFormatoPercentual(
        chamadosSheet,
        [33]
    );

    configurarTabelaExcel(
        chamadosSheet,
        4,
        colunasChamados.length
    );

    aplicarBordasTabela(chamadosSheet, 4);
    ajustarLargurasColunas(chamadosSheet, 4);

    chamadosSheet.getColumn(21).width = 40;
    chamadosSheet.getColumn(34).width = 18;

    const empresasAgrupadas =
        new Map<string, ResumoAgrupado>();

    chamados.forEach((chamado) => {
        const empresa =
            chamado.empresa?.trim() ||
            obterNomeCliente(chamado.cliente_id) ||
            "Não informado";

        const resumo =
            empresasAgrupadas.get(empresa) ||
            criarResumoVazio();

        resumo.chamados += 1;

        resumo.faturado += converterNumero(
            chamado.valor_total_cliente
        );

        resumo.pago += converterNumero(
            chamado.valor_total_tecnico
        );

        if (chamado.retorno) {
            resumo.retornos += 1;
        }

        atualizarStatus(
            resumo,
            chamado.status_id
        );

        empresasAgrupadas.set(
            empresa,
            resumo
        );
    });

    const empresasSheet =
        workbook.addWorksheet("Por Empresa");

    const colunasEmpresa = [
        "Empresa",
        "Chamados",
        "Pendentes",
        "Em andamento",
        "Finalizados",
        "Retornos",
        "Faturado",
        "Pago",
        "Lucro",
        "Margem",
        "Ticket médio",
    ];

    aplicarTituloPlanilha(
        empresasSheet,
        "Desempenho por Empresa",
        formatarPeriodoRelatorio(periodo),
        colunasEmpresa.length
    );

    aplicarCabecalhoTabela(
        empresasSheet,
        4,
        colunasEmpresa
    );

    Array.from(
        empresasAgrupadas.entries()
    )
        .sort(
            ([, empresaA], [, empresaB]) =>
                empresaB.faturado -
                empresaA.faturado
        )
        .forEach(([empresa, resumo]) => {
            const lucro =
                resumo.faturado - resumo.pago;

            const margem =
                resumo.faturado > 0
                    ? lucro / resumo.faturado
                    : 0;

            const ticketMedioEmpresa =
                resumo.chamados > 0
                    ? resumo.faturado /
                      resumo.chamados
                    : 0;

            const row = empresasSheet.addRow([
                empresa,
                resumo.chamados,
                resumo.pendentes,
                resumo.emAndamento,
                resumo.finalizados,
                resumo.retornos,
                resumo.faturado,
                resumo.pago,
                lucro,
                margem,
                ticketMedioEmpresa,
            ]);

            row.getCell(7).font = {
                bold: true,
                color: {
                    argb: "FF4338CA",
                },
            };

            row.getCell(8).font = {
                bold: true,
                color: {
                    argb: "FFD97706",
                },
            };

            row.getCell(9).font = {
                bold: true,
                color: {
                    argb:
                        lucro >= 0
                            ? "FF059669"
                            : "FFDC2626",
                },
            };
        });

    aplicarFormatoMoeda(
        empresasSheet,
        [7, 8, 9, 11]
    );

    aplicarFormatoPercentual(
        empresasSheet,
        [10]
    );

    configurarTabelaExcel(
        empresasSheet,
        4,
        colunasEmpresa.length
    );

    aplicarBordasTabela(empresasSheet, 4);
    ajustarLargurasColunas(empresasSheet, 4);

    const tecnicosAgrupados =
        new Map<
            string,
            ResumoTecnicoAgrupado
        >();

    chamados.forEach((chamado) => {
        if (!chamado.tecnico_id) {
            return;
        }

        const tecnicoId = String(
            chamado.tecnico_id
        );

        const resumo =
            tecnicosAgrupados.get(tecnicoId) ||
            criarResumoTecnicoVazio();

        resumo.chamados += 1;

        resumo.faturado += converterNumero(
            chamado.valor_total_cliente
        );

        resumo.valorChamados +=
            converterNumero(
                chamado.valor_chamado_tecnico
            );

        resumo.horaExtra += converterNumero(
            chamado.hora_extra_tecnico
        );

        resumo.deslocamento +=
            converterNumero(
                chamado.deslocamento_tecnico
            );

        resumo.reembolso += converterNumero(
            chamado.reembolso_tecnico
        );

        resumo.pago += converterNumero(
            chamado.valor_total_tecnico
        );

        if (chamado.retorno) {
            resumo.retornos += 1;
        }

        atualizarStatus(
            resumo,
            chamado.status_id
        );

        tecnicosAgrupados.set(
            tecnicoId,
            resumo
        );
    });

    const tecnicosSheet =
        workbook.addWorksheet("Por Técnico");

    const colunasTecnico = [
        "Técnico",
        "E-mail",
        "Estado",
        "Município",
        "Chamados",
        "Pendentes",
        "Em andamento",
        "Finalizados",
        "Retornos",
        "Faturamento gerado",
        "Valor chamados",
        "Hora extra",
        "Deslocamento",
        "Reembolso",
        "Total a pagar",
        "Lucro gerado",
        "Margem",
    ];

    aplicarTituloPlanilha(
        tecnicosSheet,
        "Desempenho por Técnico",
        formatarPeriodoRelatorio(periodo),
        colunasTecnico.length
    );

    aplicarCabecalhoTabela(
        tecnicosSheet,
        4,
        colunasTecnico
    );

    Array.from(
        tecnicosAgrupados.entries()
    )
        .sort(
            ([, tecnicoA], [, tecnicoB]) =>
                tecnicoB.faturado -
                tecnicoA.faturado
        )
        .forEach(([tecnicoId, resumo]) => {
            const tecnico =
                tecnicosDetalhadosMap.get(
                    tecnicoId
                );

            const lucro =
                resumo.faturado - resumo.pago;

            const margem =
                resumo.faturado > 0
                    ? lucro / resumo.faturado
                    : 0;

            const row = tecnicosSheet.addRow([
                obterNomeTecnico(tecnicoId),
                tecnico?.email_contato || "",
                obterNomeEstado(tecnico),
                obterNomeMunicipio(tecnico),
                resumo.chamados,
                resumo.pendentes,
                resumo.emAndamento,
                resumo.finalizados,
                resumo.retornos,
                resumo.faturado,
                resumo.valorChamados,
                resumo.horaExtra,
                resumo.deslocamento,
                resumo.reembolso,
                resumo.pago,
                lucro,
                margem,
            ]);

            row.getCell(10).font = {
                bold: true,
                color: {
                    argb: "FF4338CA",
                },
            };

            row.getCell(15).font = {
                bold: true,
                color: {
                    argb: "FFD97706",
                },
            };

            row.getCell(16).font = {
                bold: true,
                color: {
                    argb:
                        lucro >= 0
                            ? "FF059669"
                            : "FFDC2626",
                },
            };
        });

    aplicarFormatoMoeda(
        tecnicosSheet,
        [10, 11, 12, 13, 14, 15, 16]
    );

    aplicarFormatoPercentual(
        tecnicosSheet,
        [17]
    );

    configurarTabelaExcel(
        tecnicosSheet,
        4,
        colunasTecnico.length
    );

    aplicarBordasTabela(tecnicosSheet, 4);
    ajustarLargurasColunas(tecnicosSheet, 4);

    await baixarWorkbook(
        workbook,
        `Relatorio_Chamados_Teccorp_${nomePeriodoArquivo(
            periodo
        )}`
    );
};