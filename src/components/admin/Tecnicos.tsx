import { useState, useEffect } from "react";
import CrudPage from "./CrudPage";
import { getTodosTecnicos } from "../../services/Tecnicos/get-all-tecnicos.service"; 

const columns = [
    { key: "nome", label: "Nome" },
    { key: "email_contato", label: "E-mail" },
    { key: "telefone", label: "Telefone" },
    { key: "data_nascimento_formatada", label: "Nascimento" },
    { key: "endereco", label: "Endereço" },
    { key: "nome_municipio", label: "Município" }, 
    { key: "nome_estado", label: "Estado" }, 
];

const Tecnicos = () => {
    const [tecnicos, setTecnicos] = useState<any[]>([]);

    useEffect(() => {
        const fetchTecnicos = async () => {
            try {
                const dados = await getTodosTecnicos();
                
                const dadosFormatados = dados.map((tec: any) => {

                    let dataFormatada = tec.data_nascimento;
                    if (dataFormatada) {
                        const [ano, mes, dia] = dataFormatada.split('-');
                        dataFormatada = `${dia}/${mes}/${ano}`;
                    }

                    return {
                        ...tec,
                        nome_estado: tec.estado?.nome || "Não informado",
                        nome_municipio: tec.municipio?.nome || "Não informado",
                        data_nascimento_formatada: dataFormatada 
                    };
                });

                setTecnicos(dadosFormatados);
            } catch (error) {
                console.error("Falha ao buscar técnicos no useEffect:", error);
            }
        };

        fetchTecnicos();
    }, []);

    return (
        <CrudPage
            title="Técnicos"
            subtitle="Gerenciar técnicos cadastrados"
            columns={columns}
            initialData={tecnicos} 
        />
    );
};

export default Tecnicos;