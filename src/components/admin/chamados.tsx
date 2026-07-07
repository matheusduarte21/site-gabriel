import { useState, useEffect } from "react";
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

const Chamados = () => {
    const [chamados, setChamados] = useState<any[]>([]);
    const [opcoesTecnicos, setOpcoesTecnicos] = useState<SelectOption[]>([]);
    const [opcoesClientes, setOpcoesClientes] = useState<SelectOption[]>([]);
    const [opcoesStatus, setOpcoesStatus] = useState<SelectOption[]>([]);

    const fetchDados = async () => {
        try {
            const chamadosDB = await getTodosChamados();
            setChamados(chamadosDB);

            const tecnicosDB = await getTodosTecnicos();
            setOpcoesTecnicos(tecnicosDB.map((t: any) => ({ 
                value: t.id, 
                label: t.nome 
            })));

            const clientesDB = await getTodosClientes();
            setOpcoesClientes(clientesDB.map((c: any) => ({ 
                value: c.id, 
                label: c.nome 
            })));

            const statusDB = await getTodosStatus();
            setOpcoesStatus(statusDB.map((s: any) => ({ 
                value: s.id, 
                label: s.descricao 
            })));

        } catch (error) {
            console.error("Falha ao carregar os dados da página de Chamados:", error);
        }
    };

    useEffect(() => {
        fetchDados();
    }, []);

    const handleDeleteChamado = async (id: string | number) => {
        try {
            await deletarChamado(id);
            showSuccess("Chamado removido com sucesso!");
            await fetchDados();
        } catch (error: any) {
            showError("Erro ao remover o chamado.");
            throw error;
        }
    };

    const handleSaveChamado = async (chamado: Chamado) => {
        try {
            if (chamado.id) {
                await atualizarChamado(chamado.id, chamado);
                showSuccess("Chamado atualizado com sucesso!");
            } else {
                await criarChamado(chamado);
                showSuccess("Chamado criado com sucesso!");
            }
            await fetchDados();
        } catch (error: any) {
            showError("Erro ao salvar o chamado.");
            throw error;
        }
    };

    const columns: Column[] = [
        { key: "numero_chamado", label: "Nº Chamado" },
        { key: "empresa", label: "Empresa" },
        { key: "tecnico_id", label: "Técnico", type: "select", options: opcoesTecnicos },
        { key: "cliente_id", label: "Cliente", type: "select", options: opcoesClientes },
        { key: "status_id", label: "Status", type: "select", options: opcoesStatus },
        { key: "data_agendamento", label: "Data Agendamento" },
        { key: "valor_total", label: "Valor Total" },
    ];

    return (
        <CrudPage
            title="Chamados"
            subtitle="Gerenciar chamados técnicos"
            columns={columns}
            initialData={chamados}
            modalMaxWidth="max-w-4xl" 
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