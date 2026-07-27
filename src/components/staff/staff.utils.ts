import {
    ChamadoTecnicoPortal,
    StatusTecnicoCodigo,
    ValidacaoAtendimento,
} from "../../types/portal-tecnico.type";

const formatadorMoeda = new Intl.NumberFormat(
    "pt-BR",
    {
        style: "currency",
        currency: "BRL",
    }
);

export const converterNumero = (
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

export const formatarMoeda = (
    valor: number | string | null | undefined
): string => {
    return formatadorMoeda.format(
        converterNumero(valor)
    );
};

export const formatarData = (
    valor: string | null | undefined
): string => {
    if (!valor) {
        return "Não informada";
    }

    const dataSemHorario = valor.split("T")[0];
    const partes = dataSemHorario.split("-");

    if (partes.length !== 3) {
        return valor;
    }

    const [ano, mes, dia] = partes;

    return `${dia}/${mes}/${ano}`;
};

export const formatarDataHora = (
    valor: string | null | undefined
): string => {
    if (!valor) {
        return "Não informado";
    }

    const data = new Date(valor);

    if (Number.isNaN(data.getTime())) {
        return valor;
    }

    return new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
    }).format(data);
};

export const formatarHorario = (
    valor: string | null | undefined
): string => {
    if (!valor) {
        return "Não informado";
    }

    return valor.slice(0, 5);
};

export const obterMesAtual = (): string => {
    const hoje = new Date();

    return `${hoje.getFullYear()}-${String(
        hoje.getMonth() + 1
    ).padStart(2, "0")}`;
};

export const obterIniciais = (
    nome: string | null | undefined
): string => {
    if (!nome) {
        return "TC";
    }

    const partes = nome
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    if (partes.length === 1) {
        return partes[0]
            .slice(0, 2)
            .toUpperCase();
    }

    return `${partes[0][0]}${
        partes[partes.length - 1][0]
    }`.toUpperCase();
};

export const obterTimestampChamado = (
    chamado: ChamadoTecnicoPortal
): number => {
    if (!chamado.data_agendamento) {
        return 0;
    }

    const data = chamado.data_agendamento.split("T")[0];
    const hora =
        chamado.hora_agendamento?.slice(0, 8) ||
        "00:00:00";

    const timestamp = new Date(
        `${data}T${hora}`
    ).getTime();

    return Number.isNaN(timestamp)
        ? 0
        : timestamp;
};

export const obterDescricaoStatusOficial = (
    chamado: ChamadoTecnicoPortal
): string => {
    return (
        chamado.status?.descricao ||
        "Não informado"
    );
};

export const obterDescricaoStatusTecnico = (
    chamado: ChamadoTecnicoPortal
): string => {
    return (
        chamado.acompanhamento?.status_tecnico
            ?.descricao || "Aguardando início"
    );
};

export const obterClasseStatusOficial = (
    descricao: string | null | undefined
): string => {
    const status =
        descricao
            ?.trim()
            .toLocaleLowerCase("pt-BR") || "";

    if (
        status.includes("final") ||
        status.includes("conclu")
    ) {
        return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300";
    }

    if (status.includes("andamento")) {
        return "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300";
    }

    if (status.includes("cancel")) {
        return "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300";
    }

    return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300";
};

export const obterClasseValidacao = (
    validacao: ValidacaoAtendimento | null | undefined
): string => {
    if (validacao === "aprovado") {
        return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300";
    }

    if (validacao === "reprovado") {
        return "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300";
    }

    return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300";
};

export const obterTextoValidacao = (
    validacao: ValidacaoAtendimento | null | undefined
): string => {
    if (validacao === "aprovado") {
        return "Atendimento aprovado";
    }

    if (validacao === "reprovado") {
        return "Atendimento reprovado";
    }

    return "Aguardando validação";
};

export const obterClasseStatusTecnico = (
    codigo: StatusTecnicoCodigo | null | undefined
): string => {
    if (
        codigo === "atendimento_finalizado"
    ) {
        return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300";
    }

    if (
        codigo === "atendimento_iniciado"
    ) {
        return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300";
    }

    if (codigo === "chegou_local") {
        return "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-300";
    }

    if (codigo === "em_deslocamento") {
        return "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300";
    }

    return "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300";
};

export const obterProximaEtapa = (
    codigo: StatusTecnicoCodigo | null | undefined
): {
    codigo: StatusTecnicoCodigo;
    label: string;
} | null => {
    if (!codigo || codigo === "aguardando") {
        return {
            codigo: "em_deslocamento",
            label: "Iniciar deslocamento",
        };
    }

    if (codigo === "em_deslocamento") {
        return {
            codigo: "chegou_local",
            label: "Confirmar chegada",
        };
    }

    if (codigo === "chegou_local") {
        return {
            codigo: "atendimento_iniciado",
            label: "Iniciar atendimento",
        };
    }

    if (
        codigo === "atendimento_iniciado"
    ) {
        return {
            codigo: "atendimento_finalizado",
            label: "Finalizar atendimento",
        };
    }

    return null;
};