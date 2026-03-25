import { useState, useEffect } from "react";
import CrudPage, { Column } from "./CrudPage";
import ChamadoForm, { SelectOption } from "./ChamadoForm";
import { getTodosTecnicos } from "../../services/Tecnicos/get-all-tecnicos.service";
import { getTodosClientes } from "../../services/Clientes/get-all-cliente.service";
import { getTodosStatus } from "../../services/status/get-all-status.service";

const Chamados = () => {
    const [chamados, setChamados] = useState<any[]>([]);
    const [opcoesTecnicos, setOpcoesTecnicos] = useState<SelectOption[]>([]);
    const [opcoesClientes, setOpcoesClientes] = useState<SelectOption[]>([]);
    const [opcoesStatus, setOpcoesStatus] = useState<SelectOption[]>([]);

    useEffect(() => {
        const fetchDados = async () => {
            try {
                // const chamadosDB = await getTodosChamados();
                // setChamados(chamadosDB);

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

        fetchDados();
    }, []);

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
            
            CustomForm={(props) => (
                <ChamadoForm 
                    {...props} 
                    tecnicosOptions={opcoesTecnicos}
                    clientesOptions={opcoesClientes}
                    statusOptions={opcoesStatus}
                />
            )}
        />
    );
};

export default Chamados;