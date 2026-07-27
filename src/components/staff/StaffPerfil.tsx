import StaffHeader from "./StaffHeader";
import PerfilUsuarioContent from "../shared/PerfilUsuarioContent";

const StaffPerfil = () => {
    return (
        <div>
            <StaffHeader
                title="Meu perfil"
                subtitle="Consulte seus dados e gerencie a segurança da sua conta."
            />

            <PerfilUsuarioContent />
        </div>
    );
};

export default StaffPerfil;