import { useEffect, useState } from "react";
import CrudPage, { Column } from "./CrudPage";
import { getTodosUsuarios } from "../../services/Usuarios/get-all-usuarios.service";
import { getTodosTiposPerfil } from "../../services/Tipo_perfil/get-all-tipo_perfil.service";

const Usuarios = () => { 
    const [usuarios, setUsuarios] = useState<any[]>([]);
    const [opcoesPerfil, setOpcoesPerfil] = useState<{value: string | number, label: string}[]>([]);

    useEffect(() => {
        const fetchUsuarios = async () => {
            try {
                const dados = await getTodosUsuarios();
                setUsuarios(dados); 
            } catch (error) {
                console.error("Falha ao buscar usuarios no useEffect:", error);
            }
        };

        const fetchPerfis = async () => {
            try {
                const dados = await getTodosTiposPerfil();
                const formatado = dados.map((perfil: any) => ({
                    value: perfil.id,
                    label: perfil.nome
                }));
                setOpcoesPerfil(formatado);
            } catch (error) {
                console.error("Falha ao buscar tipos de perfil:", error);
            }
        };

        fetchUsuarios(); 
        fetchPerfis();
    }, []);

    const columns: Column[] = [
        { key: "email", label: "Email" },
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
        />
    );
};

export default Usuarios;