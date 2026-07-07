import { useEffect, useState } from "react";
import CrudPage, { Column } from "./CrudPage";
import { getTodosUsuarios } from "../../services/Usuarios/get-all-usuarios.service";
import { getTodosTiposPerfil } from "../../services/Tipo_perfil/get-all-tipo_perfil.service";
import { deletarUsuario } from "../../services/Usuarios/delete-usuarios.service";
import { criarUsuario } from "../../services/Usuarios/post-usuarios.service";
import { atualizarUsuario } from "../../services/Usuarios/patch-usuarios.service";
import { showError, showSuccess } from "../../lib/Utils/toast";

const Usuarios = () => { 
    const [usuarios, setUsuarios] = useState<any[]>([]);
    const [opcoesPerfil, setOpcoesPerfil] = useState<{value: string | number, label: string}[]>([]);

    const fetchData = async () => {
        try {
            const dadosUsuarios = await getTodosUsuarios();
            setUsuarios(dadosUsuarios); 

            const dadosPerfis = await getTodosTiposPerfil();
            const formatado = dadosPerfis.map((perfil: any) => ({
                value: perfil.id,
                label: perfil.nome
            }));
            setOpcoesPerfil(formatado);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchData(); 
    }, []);

    const handleDeleteUsuario = async (id: string | number) => {
        try {
            await deletarUsuario(id);
            showSuccess("Usuário removido com sucesso!");
            await fetchData();
        } catch (error: any) {
            showError("Erro ao remover usuário");
            throw error;
        }
    };

    const handleSaveUsuario = async (usuario: any) => {
        try {
            if (usuario.id) {
                await atualizarUsuario(usuario.id, usuario);
                showSuccess("Usuário atualizado com sucesso!");
            } else {
                await criarUsuario(usuario);
                showSuccess("Usuário criado com sucesso!");
            }
            await fetchData();
        } catch (error: any) {
            showError("Erro ao salvar usuário");
            throw error;
        }
    };

    const columns: Column[] = [
        { key: "email", label: "Email", type: "text" },
        { 
            key: "tipo_perfil_id",
            label: "Tipo de Perfil",
            type: "select",
            options: opcoesPerfil
        },
    ];

    return(
        <CrudPage
            title="Usuários"
            subtitle="Gerenciar usuários do sistema"
            columns={columns}
            initialData={usuarios} 
            onDelete={handleDeleteUsuario}
            onSave={handleSaveUsuario}
        />
    );
};

export default Usuarios;