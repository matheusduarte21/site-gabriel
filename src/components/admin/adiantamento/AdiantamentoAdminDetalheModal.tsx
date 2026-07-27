import { X, UserRound, ClipboardList, CircleDollarSign, FileText, CalendarDays, ExternalLink } from "lucide-react";
import { ReactNode } from "react";
import { AdiantamentoAdmin } from "../../../types/diantamento-admin.type";

interface CampoDetalheProps {
    label: string;
    valor: string;
    icon: ReactNode;
}

interface AdiantamentoAdminDetalheModalProps {
    adiantamento: AdiantamentoAdmin;
    onClose: () => void;
}

const formatarMoeda = (
    valor: number
) => {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(valor);
};

const formatarDataHora = (
    valor: string | null | undefined
) => {
    if (!valor) {
        return "Não informado";
    }

    const data = new Date(valor);

    if (
        Number.isNaN(data.getTime())
    ) {
        return valor;
    }

    return new Intl.DateTimeFormat(
        "pt-BR",
        {
            dateStyle: "short",
            timeStyle: "short",
        }
    ).format(data);
};

const formatarTexto = (
    valor: string
) => {
    return valor
        .replace("_", " ")
        .replace(/\b\w/g, (letra) =>
            letra.toUpperCase()
        );
};

const CampoDetalhe = ({
    label,
    valor,
    icon,
}: CampoDetalheProps) => {
    return (
        <div className="flex min-h-[86px] items-start gap-3 rounded-xl border border-border bg-background p-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                {icon}
            </span>

            <div className="min-w-0">
                <p className="text-xs text-muted-foreground">
                    {label}
                </p>

                <p className="mt-1 break-words text-sm font-bold text-foreground">
                    {valor}
                </p>
            </div>
        </div>
    );
};

const AdiantamentoAdminDetalheModal = ({
    adiantamento,
    onClose,
}: AdiantamentoAdminDetalheModalProps) => {
    return (
        <div
            className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm sm:flex sm:items-center sm:justify-center sm:p-5"
            role="dialog"
            aria-modal="true"
            onMouseDown={(event) => {
                if (
                    event.target ===
                    event.currentTarget
                ) {
                    onClose();
                }
            }}
        >
            <div className="flex h-[100dvh] w-full flex-col overflow-hidden bg-card sm:h-auto sm:max-h-[94vh] sm:max-w-4xl sm:rounded-2xl sm:border sm:border-border sm:shadow-2xl">
                <div className="flex shrink-0 items-start justify-between gap-4 border-b border-border p-5 sm:p-6">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-primary">
                            Adiantamento
                        </p>

                        <h2 className="mt-1 text-xl font-bold text-foreground">
                            {formatarMoeda(
                                adiantamento.valor_numero
                            )}
                        </h2>

                        <p className="mt-1 text-sm text-muted-foreground">
                            {adiantamento.tecnico
                                ?.nome ||
                                "Técnico não informado"}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground hover:bg-secondary hover:text-foreground"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-5 sm:p-6">
                    <div className="rounded-xl border border-border bg-secondary/30 p-4">
                        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                            Descrição
                        </p>

                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-foreground">
                            {adiantamento.descricao}
                        </p>
                    </div>

                    <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <CampoDetalhe
                            label="Técnico"
                            valor={
                                adiantamento.tecnico
                                    ?.nome ||
                                "Não informado"
                            }
                            icon={
                                <UserRound className="h-5 w-5" />
                            }
                        />

                        <CampoDetalhe
                            label="Chamado relacionado"
                            valor={
                                adiantamento.chamado
                                    ?.numero_chamado ||
                                "Nenhum"
                            }
                            icon={
                                <ClipboardList className="h-5 w-5" />
                            }
                        />

                        <CampoDetalhe
                            label="Valor original"
                            valor={formatarMoeda(
                                adiantamento.valor_numero
                            )}
                            icon={
                                <CircleDollarSign className="h-5 w-5" />
                            }
                        />

                        <CampoDetalhe
                            label="Valor compensado"
                            valor={formatarMoeda(
                                adiantamento.valor_compensado_numero
                            )}
                            icon={
                                <CircleDollarSign className="h-5 w-5" />
                            }
                        />

                        <CampoDetalhe
                            label="Saldo para compensar"
                            valor={formatarMoeda(
                                adiantamento.saldo_compensar
                            )}
                            icon={
                                <CircleDollarSign className="h-5 w-5" />
                            }
                        />

                        <CampoDetalhe
                            label="Etapa atual"
                            valor={formatarTexto(
                                adiantamento.etapa
                            )}
                            icon={
                                <FileText className="h-5 w-5" />
                            }
                        />
                    </div>

                    <div className="mt-6">
                        <h3 className="text-base font-bold text-foreground">
                            Situação do fluxo
                        </h3>

                        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="rounded-xl border border-border bg-background p-4">
                                <p className="text-xs text-muted-foreground">
                                    Validação do valor
                                </p>

                                <p className="mt-1 text-sm font-bold text-foreground">
                                    {formatarTexto(
                                        adiantamento.validacao_valor_tecnico
                                    )}
                                </p>
                            </div>

                            <div className="rounded-xl border border-border bg-background p-4">
                                <p className="text-xs text-muted-foreground">
                                    Pagamento
                                </p>

                                <p className="mt-1 text-sm font-bold text-foreground">
                                    {formatarTexto(
                                        adiantamento.status_pagamento
                                    )}
                                </p>
                            </div>

                            <div className="rounded-xl border border-border bg-background p-4">
                                <p className="text-xs text-muted-foreground">
                                    Recebimento
                                </p>

                                <p className="mt-1 text-sm font-bold text-foreground">
                                    {formatarTexto(
                                        adiantamento.confirmacao_recebimento
                                    )}
                                </p>
                            </div>

                            <div className="rounded-xl border border-border bg-background p-4">
                                <p className="text-xs text-muted-foreground">
                                    Compensação
                                </p>

                                <p className="mt-1 text-sm font-bold text-foreground">
                                    {formatarTexto(
                                        adiantamento.status_compensacao
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>

                    {(adiantamento.observacao_validacao ||
                        adiantamento.observacao_recebimento ||
                        adiantamento.motivo_cancelamento) && (
                        <div className="mt-6 space-y-3">
                            <h3 className="text-base font-bold text-foreground">
                                Observações
                            </h3>

                            {adiantamento.observacao_validacao && (
                                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
                                    <p className="font-bold">
                                        Reprovação do valor
                                    </p>

                                    <p className="mt-1">
                                        {
                                            adiantamento.observacao_validacao
                                        }
                                    </p>
                                </div>
                            )}

                            {adiantamento.observacao_recebimento && (
                                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
                                    <p className="font-bold">
                                        Divergência do recebimento
                                    </p>

                                    <p className="mt-1">
                                        {
                                            adiantamento.observacao_recebimento
                                        }
                                    </p>
                                </div>
                            )}

                            {adiantamento.motivo_cancelamento && (
                                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
                                    <p className="font-bold">
                                        Motivo do cancelamento
                                    </p>

                                    <p className="mt-1">
                                        {
                                            adiantamento.motivo_cancelamento
                                        }
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="mt-6">
                        <h3 className="text-base font-bold text-foreground">
                            Datas
                        </h3>

                        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            <CampoDetalhe
                                label="Cadastrado em"
                                valor={formatarDataHora(
                                    adiantamento.criado_em
                                )}
                                icon={
                                    <CalendarDays className="h-5 w-5" />
                                }
                            />

                            <CampoDetalhe
                                label="Valor respondido em"
                                valor={formatarDataHora(
                                    adiantamento.validado_em
                                )}
                                icon={
                                    <CalendarDays className="h-5 w-5" />
                                }
                            />

                            <CampoDetalhe
                                label="Pagamento registrado em"
                                valor={formatarDataHora(
                                    adiantamento.pago_em
                                )}
                                icon={
                                    <CalendarDays className="h-5 w-5" />
                                }
                            />

                            <CampoDetalhe
                                label="Recebimento respondido em"
                                valor={formatarDataHora(
                                    adiantamento.recebimento_respondido_em
                                )}
                                icon={
                                    <CalendarDays className="h-5 w-5" />
                                }
                            />

                            <CampoDetalhe
                                label="Compensado em"
                                valor={formatarDataHora(
                                    adiantamento.compensado_em
                                )}
                                icon={
                                    <CalendarDays className="h-5 w-5" />
                                }
                            />
                        </div>
                    </div>

                    {adiantamento.comprovante_url && (
                        <a
                            href={
                                adiantamento.comprovante_url
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-bold text-primary hover:bg-secondary"
                        >
                            <ExternalLink className="h-4 w-4" />
                            Abrir comprovante
                        </a>
                    )}
                </div>

                <div className="shrink-0 border-t border-border p-4 sm:p-5">
                    <button
                        type="button"
                        onClick={onClose}
                        className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm font-bold text-foreground hover:bg-secondary sm:ml-auto sm:block sm:w-auto sm:min-w-32"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdiantamentoAdminDetalheModal;