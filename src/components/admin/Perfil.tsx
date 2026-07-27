import AdminHeader from "./AdminHeader";
import PerfilUsuarioContent from "../shared/PerfilUsuarioContent";

const Perfil = () => {
    return (
        <div>
            <AdminHeader
                title="Meu perfil"
                subtitle="Consulte seus dados e gerencie a segurança da sua conta."
            />

            <PerfilUsuarioContent />
        </div>
    );
};

export default Perfil;