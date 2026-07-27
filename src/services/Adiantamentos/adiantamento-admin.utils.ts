import { AdiantamentoAdmin, AdiantamentoAdminRespostaBanco, EtapaAdiantamentoAdmin, ResumoAdiantamentosAdmin } from "../../types/diantamento-admin.type";


export const ADIANTAMENTO_ADMIN_SELECT = `
    id,
    tecnico_id,
    chamado_id,
    valor,
    descricao,
    status,
    confirmacao_tecnico,
    observacao_tecnico,
    comprovante_url,
    solicitado_em,
    aprovado_em,
    pago_em,
    confirmado_em,
    criado_em,
    atualizado_em,
    validacao_valor_tecnico,
    observacao_validacao,
    enviado_validacao_em,
    validado_em,
    status_pagamento,
    confirmacao_recebimento,
    observacao_recebimento,
    recebimento_respondido_em,
    status_compensacao,
    valor_compensado,
    compensado_em,
    criado_por,
    pagamento_registrado_por,
    cancelado_por,
    cancelado_em,
    motivo_cancelamento,
    tecnico:tecnico!adiantamento_tecnico_fk (
        id,
        usuario_id,
        nome,
        telefone,
        email_contato,
        cpf
    ),
    chamado:chamado!adiantamento_chamado_fk (
        id,
        numero_chamado,
        empresa,
        data_agendamento,
        valor_total_tecnico,
        status_id,
        status (
            id,
            descricao
        )
    ),
    criado_por_usuario:usuarios!adiantamento_criado_por_fk (
        id,
        email
    ),
    pagamento_registrado_por_usuario:usuarios!adiantamento_pagamento_registrado_por_fk (
        id,
        email
    ),
    cancelado_por_usuario:usuarios!adiantamento_cancelado_por_fk (
        id,
        email
    )
`;

const obterRelacaoUnica = <T>(
    valor: T | T[] | null | undefined
): T | null => {
    if (Array.isArray(valor)) {
        return valor[0] ?? null;
    }

    return valor ?? null;
};

export const converterNumeroAdiantamento = (
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
        return Number.isFinite(valor)
            ? valor
            : 0;
    }

    const numero = Number(valor);

    return Number.isFinite(numero)
        ? numero
        : 0;
};

export const obterEtapaAdiantamento = (
    registro: AdiantamentoAdminRespostaBanco
): EtapaAdiantamentoAdmin => {
    if (
        registro.status_pagamento ===
        "cancelado"
    ) {
        return "cancelado";
    }

    if (
        registro.validacao_valor_tecnico ===
        "pendente"
    ) {
        return "aguardando_validacao";
    }

    if (
        registro.validacao_valor_tecnico ===
        "reprovado"
    ) {
        return "valor_reprovado";
    }

    if (
        registro.status_pagamento ===
        "pendente"
    ) {
        return "aguardando_pagamento";
    }

    if (
        registro.confirmacao_recebimento ===
        "pendente"
    ) {
        return "aguardando_confirmacao";
    }

    if (
        registro.confirmacao_recebimento ===
        "divergencia"
    ) {
        return "divergencia_recebimento";
    }

    if (
        registro.status_compensacao ===
        "compensado"
    ) {
        return "compensado";
    }

    if (
        registro.status_compensacao ===
        "parcial"
    ) {
        return "parcialmente_compensado";
    }

    return "disponivel_compensacao";
};

export const normalizarAdiantamentoAdmin = (
    registro: AdiantamentoAdminRespostaBanco
): AdiantamentoAdmin => {
    const valorNumero =
        converterNumeroAdiantamento(
            registro.valor
        );

    const valorCompensadoNumero =
        converterNumeroAdiantamento(
            registro.valor_compensado
        );

    return {
        ...registro,
        valor_numero: valorNumero,
        valor_compensado_numero:
            valorCompensadoNumero,
        saldo_compensar: Math.max(
            0,
            valorNumero -
                valorCompensadoNumero
        ),
        etapa:
            obterEtapaAdiantamento(
                registro
            ),
        tecnico: obterRelacaoUnica(
            registro.tecnico
        ),
        chamado: obterRelacaoUnica(
            registro.chamado
        ),
        criado_por_usuario:
            obterRelacaoUnica(
                registro.criado_por_usuario
            ),
        pagamento_registrado_por_usuario:
            obterRelacaoUnica(
                registro.pagamento_registrado_por_usuario
            ),
        cancelado_por_usuario:
            obterRelacaoUnica(
                registro.cancelado_por_usuario
            ),
    };
};

export const obterRegistroRpcAdiantamento = (
    data: unknown
): AdiantamentoAdminRespostaBanco => {
    const registro = Array.isArray(data)
        ? data[0]
        : data;

    if (
        !registro ||
        typeof registro !== "object"
    ) {
        throw new Error(
            "O Supabase não retornou o adiantamento atualizado."
        );
    }

    return registro as AdiantamentoAdminRespostaBanco;
};

export const calcularResumoAdiantamentosAdmin = (
    adiantamentos: AdiantamentoAdmin[]
): ResumoAdiantamentosAdmin => {
    return adiantamentos.reduce(
        (resumo, adiantamento) => {
            resumo.quantidade += 1;
            resumo.valorTotal +=
                adiantamento.valor_numero;

            if (
                adiantamento.etapa ===
                "aguardando_validacao"
            ) {
                resumo.quantidadeAguardandoValidacao +=
                    1;

                resumo.valorAguardandoValidacao +=
                    adiantamento.valor_numero;
            }

            if (
                adiantamento.etapa ===
                "aguardando_pagamento"
            ) {
                resumo.quantidadeAguardandoPagamento +=
                    1;

                resumo.valorAguardandoPagamento +=
                    adiantamento.valor_numero;
            }

            if (
                adiantamento.etapa ===
                "aguardando_confirmacao"
            ) {
                resumo.quantidadeAguardandoConfirmacao +=
                    1;

                resumo.valorAguardandoConfirmacao +=
                    adiantamento.valor_numero;
            }

            if (
                adiantamento.etapa ===
                "divergencia_recebimento"
            ) {
                resumo.quantidadeDivergencias +=
                    1;

                resumo.valorDivergencias +=
                    adiantamento.valor_numero;
            }

            if (
                adiantamento.etapa ===
                    "disponivel_compensacao" ||
                adiantamento.etapa ===
                    "parcialmente_compensado"
            ) {
                resumo.quantidadeDisponiveisCompensacao +=
                    1;

                resumo.valorDisponivelCompensacao +=
                    adiantamento.saldo_compensar;
            }

            resumo.valorCompensado +=
                adiantamento.valor_compensado_numero;

            if (
                adiantamento.etapa ===
                "compensado"
            ) {
                resumo.quantidadeCompensados +=
                    1;

                resumo.valorTotalCompensados +=
                    adiantamento.valor_numero;
            }

            return resumo;
        },
        {
            quantidade: 0,
            valorTotal: 0,
            quantidadeAguardandoValidacao: 0,
            valorAguardandoValidacao: 0,
            quantidadeAguardandoPagamento: 0,
            valorAguardandoPagamento: 0,
            quantidadeAguardandoConfirmacao: 0,
            valorAguardandoConfirmacao: 0,
            quantidadeDivergencias: 0,
            valorDivergencias: 0,
            quantidadeDisponiveisCompensacao: 0,
            valorDisponivelCompensacao: 0,
            valorCompensado: 0,
            quantidadeCompensados: 0,
            valorTotalCompensados: 0,
        }
    );
};

export const criarInicioDiaIso = (
    data: string
): string => {
    const [ano, mes, dia] = data
        .split("-")
        .map(Number);

    const valor = new Date(
        ano,
        mes - 1,
        dia,
        0,
        0,
        0,
        0
    );

    return valor.toISOString();
};

export const criarFimDiaIso = (
    data: string
): string => {
    const [ano, mes, dia] = data
        .split("-")
        .map(Number);

    const valor = new Date(
        ano,
        mes - 1,
        dia,
        23,
        59,
        59,
        999
    );

    return valor.toISOString();
};