import { useState, useEffect } from "react";
import CrudPage from "./CrudPage";
import TecnicoForm, { SelectOption } from "./tecnicoForm";
import { getTodosTecnicos } from "../../services/Tecnicos/get-all-tecnicos.service";
import { deletarTecnico } from "../../services/Tecnicos/delete-usuarios.service";
import { criarTecnico } from "../../services/Tecnicos/post-tercnico.service";
import { atualizarTecnico } from "../../services/Tecnicos/patch-tecnicos.sevice";
import { getTodosEstados } from "../../services/Estados/get-all-estados.service";
import { getUsuariosParaSelect } from "../../services/Usuarios/get-usuarios-select.service";
import { showError, showSuccess } from "../../lib/Utils/toast";

const columns = [
    { key: "nome", label: "Nome" },
    { key: "email_contato", label: "E-mail" },
    { key: "telefone", label: "Telefone" },
    { key: "nome_municipio", label: "Município" },  
    { key: "nome_estado", label: "Estado" }, 
];

const Tecnicos = () => {
    const [tecnicos, setTecnicos] = useState<any[]>([]);
    const [opcoesEstados, setOpcoesEstados] = useState<SelectOption[]>([]);
    const [opcoesUsuarios, setOpcoesUsuarios] = useState<SelectOption[]>([]);

    const fetchData = async () => {
        try {
            const [dadosTecnicos, dadosEstados, dadosUsuarios] = await Promise.all([
                getTodosTecnicos(),
                getTodosEstados(),
                getUsuariosParaSelect()
            ]);

            setTecnicos(dadosTecnicos.map((tec: any) => ({
                ...tec,
                nome_estado: tec.estado?.nome || "---",
                nome_municipio: tec.municipio?.nome || "---",
                data_nascimento_formatada: tec.data_nascimento ? tec.data_nascimento.split('-').reverse().join('/') : "---"
            })));

            setOpcoesEstados(dadosEstados.map((est: any) => ({ value: est.id, label: est.nome })));
            setOpcoesUsuarios(dadosUsuarios.map((u: any) => ({ value: u.id, label: u.email })));

        } catch (error) {
            console.error("Erro ao carregar dados:", error);
            showError("Erro ao carregar dados de técnicos/usuários.");
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSaveTecnico = async (tecnico: any) => {
        try {
            if (tecnico.id && typeof tecnico.id === 'string' && tecnico.id.length > 30) {
                await atualizarTecnico(tecnico.id, tecnico);
                showSuccess("Técnico atualizado!");
            } else {
                await criarTecnico(tecnico);
                showSuccess("Técnico criado!");
            }
            await fetchData();
        } catch (error: any) {
            showError("Erro ao salvar técnico.");
        }
    };

    return (
        <CrudPage
            title="Técnicos"
            subtitle="Gerenciar técnicos cadastrados"
            columns={columns}
            initialData={tecnicos} 
            modalMaxWidth="max-w-3xl"
            onDelete={async (id) => {
                await deletarTecnico(id);
                showSuccess("Removido!");
                await fetchData();
            }}
            CustomForm={(props: any) => (
                <TecnicoForm 
                    {...props} 
                    estadosOptions={opcoesEstados}
                    usuariosOptions={opcoesUsuarios}
                    onSubmit={async (data) => {
                        await handleSaveTecnico(data);
                        props.onCancel();
                    }}
                />
            )}
        />
    );
};

export default Tecnicos;