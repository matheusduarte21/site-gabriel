import { useEffect, useState } from "react";
import CrudPage from "./CrudPage";
import { getTodosClientes } from "../../services/Clientes/get-all-cliente.service";

const columns = [
    { key: "nome", label: "Nome" },
];

const Clientes = () => { 
    const [clientes, setClientes] = useState<any[]>([]);

    useEffect(() => {
        const fetchClientes = async () => {
            try {
                const dados = await getTodosClientes();
                setClientes(dados); 
            } catch (error) {
                console.error("Falha ao buscar clientes no useEffect:", error);
            }
        };

        fetchClientes(); 
    }, []);

    return(
        <CrudPage
            title="Clientes"
            subtitle="Gerenciar clientes atendidos"
            columns={columns}
            initialData={clientes} 
        />
    );
};

export default Clientes;