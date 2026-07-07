import { useEffect, useState } from "react";
import CrudPage, { Column } from "./CrudPage";
import { getTodosClientes } from "../../services/Clientes/get-all-cliente.service";
import { deletarCliente } from "../../services/Clientes/delete-cliente.service";
import { criarCliente } from "../../services/Clientes/post-cliente.service";
import { atualizarCliente } from "../../services/Clientes/patch-cliente.service";
import { showError, showSuccess } from "../../lib/Utils/toast";

const columns: Column[] = [
    { key: "nome", label: "Nome", type: "text" },
];

const Clientes = () => { 
    const [clientes, setClientes] = useState<any[]>([]);

    const fetchData = async () => {
        try {
            const dados = await getTodosClientes();
            setClientes(dados); 
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchData(); 
    }, []);

    const handleDeleteCliente = async (id: string | number) => {
        try {
            await deletarCliente(id);
            showSuccess("Cliente removido com sucesso!");
            await fetchData();
        } catch (error: any) {
            showError("Erro ao remover o cliente.");
            throw error;
        }
    };

    const handleSaveCliente = async (cliente: any) => {
        try {
            if (cliente.id && typeof cliente.id === 'string' && cliente.id.length > 10) {
                await atualizarCliente(cliente.id, cliente);
                showSuccess("Cliente atualizado com sucesso!");
            } else {
                await criarCliente(cliente);
                showSuccess("Cliente criado com sucesso!");
            }
            await fetchData();
        } catch (error: any) {
            showError("Erro ao salvar o cliente.");
            throw error;
        }
    };

    return(
        <CrudPage
            title="Clientes"
            subtitle="Gerenciar clientes atendidos"
            columns={columns}
            initialData={clientes} 
            onDelete={handleDeleteCliente}
            onSave={handleSaveCliente}
        />
    );
};

export default Clientes;