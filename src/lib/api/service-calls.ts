import { atualizarStatusTecnico } from "../../services/Tecnicos/atualizar-status-tecnico.service";
import { getMeusChamados } from "../../services/Tecnicos/get-meus-chamados.service";
import { validarAtendimentoTecnico } from "../../services/Tecnicos/validar-atendimento.service";
import {
    ChamadoTecnicoPortal,
    FiltroChamadosTecnico,
    StatusTecnicoCodigo,
} from "../../types/portal-tecnico.type";

type StatusOriginal =
    ChamadoTecnicoPortal["status"];

export type ServiceCall = Omit<
    ChamadoTecnicoPortal,
    "status"
> & {
    status: string;
    statusDetalhes: StatusOriginal;
};

export type ServiceCallFilters =
    FiltroChamadosTecnico;

const normalizarTexto = (
    valor: string | null | undefined
): string => {
    return (
        valor
            ?.trim()
            .toLocaleLowerCase("pt-BR") ?? ""
    );
};

const obterStatusChamado = (
    chamado: ChamadoTecnicoPortal
): string => {
    const statusId = Number(
        chamado.status_id
    );

    if (statusId === 1) {
        return "Agendado";
    }

    if (statusId === 2) {
        return "Em Andamento";
    }

    if (statusId === 3) {
        return "Concluído";
    }

    if (statusId === 4) {
        return "Cancelado";
    }

    const descricao = normalizarTexto(
        chamado.status?.descricao
    );

    if (
        descricao === "pendente" ||
        descricao === "agendado"
    ) {
        return "Agendado";
    }

    if (
        descricao === "em andamento" ||
        descricao === "andamento"
    ) {
        return "Em Andamento";
    }

    if (
        descricao === "finalizado" ||
        descricao === "concluído" ||
        descricao === "concluido"
    ) {
        return "Concluído";
    }

    if (
        descricao === "cancelado" ||
        descricao === "cancelada"
    ) {
        return "Cancelado";
    }

    return (
        chamado.status?.descricao ??
        "Não informado"
    );
};

const adaptarChamado = (
    chamado: ChamadoTecnicoPortal
): ServiceCall => {
    const statusDetalhes =
        chamado.status;

    return {
        ...chamado,
        status: obterStatusChamado(
            chamado
        ),
        statusDetalhes,
    };
};

export async function getServiceCalls(
    filtros: ServiceCallFilters = {}
): Promise<ServiceCall[]> {
    const chamados =
        await getMeusChamados(filtros);

    return chamados.map(
        adaptarChamado
    );
}

export async function fetchServiceCalls(
    filtros: ServiceCallFilters = {}
): Promise<ServiceCall[]> {
    return getServiceCalls(filtros);
}

export async function getStaffServiceCalls(
    filtros: ServiceCallFilters = {}
): Promise<ServiceCall[]> {
    return getServiceCalls(filtros);
}

export async function getServiceCallById(
    chamadoId: string
): Promise<ServiceCall | null> {
    const chamados =
        await getServiceCalls();

    return (
        chamados.find(
            (chamado) =>
                String(chamado.id) ===
                String(chamadoId)
        ) ?? null
    );
}

export async function approveServiceCall(
    chamadoId: string
) {
    return validarAtendimentoTecnico({
        chamadoId,
        aprovado: true,
    });
}

export async function rejectServiceCall(
    chamadoId: string,
    observacao: string
) {
    return validarAtendimentoTecnico({
        chamadoId,
        aprovado: false,
        observacao,
    });
}

export async function validateServiceCall(
    chamadoId: string,
    aprovado: boolean,
    observacao = ""
) {
    return validarAtendimentoTecnico({
        chamadoId,
        aprovado,
        observacao,
    });
}

export async function updateServiceCallStatus(
    chamadoId: string,
    status: StatusTecnicoCodigo
) {
    return atualizarStatusTecnico(
        chamadoId,
        status
    );
}

export async function startTravel(
    chamadoId: string
) {
    return atualizarStatusTecnico(
        chamadoId,
        "em_deslocamento"
    );
}

export async function arriveAtLocation(
    chamadoId: string
) {
    return atualizarStatusTecnico(
        chamadoId,
        "chegou_local"
    );
}

export async function startService(
    chamadoId: string
) {
    return atualizarStatusTecnico(
        chamadoId,
        "atendimento_iniciado"
    );
}

export async function finishService(
    chamadoId: string
) {
    return atualizarStatusTecnico(
        chamadoId,
        "atendimento_finalizado"
    );
}