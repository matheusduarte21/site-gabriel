import {
    AtSign,
    CalendarDays,
    CreditCard,
    FileText,
    MapPin,
    Phone,
    UserCircle,
} from "lucide-react";
import { useTecnico } from "../../context/TecnicoContext";
import { useAuth } from "../../context/AuthContext";
import StaffHeader from "./StaffHeader";
import {
    formatarData,
    obterIniciais,
} from "./staff.utils";

interface CampoPerfilProps {
    label: string;
    value: string;
    icon: React.ReactNode;
}

const CampoPerfil = ({
    label,
    value,
    icon,
}: CampoPerfilProps) => {
    return (
        <div className="flex items-start gap-3 rounded-xl border border-border bg-background p-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                {icon}
            </span>

            <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground">
                    {label}
                </p>

                <p className="mt-1 break-words text-sm font-bold text-foreground">
                    {value}
                </p>
            </div>
        </div>
    );
};

const StaffPerfil = () => {
    const {
        tecnico,
        loadingTecnico,
        erroTecnico,
    } = useTecnico();

    const { user } = useAuth();

    if (loadingTecnico) {
        return (
            <div className="p-6 text-muted-foreground">
                Carregando perfil...
            </div>
        );
    }

    if (erroTecnico || !tecnico) {
        return (
            <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
                {erroTecnico ||
                    "Perfil não encontrado."}
            </div>
        );
    }

    const localizacao = [
        tecnico.municipio?.nome,
        tecnico.estado?.sigla ||
            tecnico.estado?.nome,
    ]
        .filter(Boolean)
        .join(" - ");

    return (
        <div>
            <StaffHeader
                title="Meu perfil"
                subtitle="Consulte suas informações cadastradas."
            />

            <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                <div className="bg-gradient-to-r from-blue-800 to-indigo-700 p-6 text-white sm:p-8">
                    <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
                        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-4 border-white/20 bg-white/15 text-2xl font-bold">
                            {obterIniciais(
                                tecnico.nome
                            )}
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold">
                                {tecnico.nome}
                            </h2>

                            <p className="mt-1 text-sm text-blue-100">
                                Técnico Teccorp
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-4 sm:p-6">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <CampoPerfil
                            label="E-mail de acesso"
                            value={
                                user?.email ||
                                "Não informado"
                            }
                            icon={
                                <AtSign className="h-5 w-5" />
                            }
                        />

                        <CampoPerfil
                            label="E-mail de contato"
                            value={
                                tecnico.email_contato ||
                                "Não informado"
                            }
                            icon={
                                <AtSign className="h-5 w-5" />
                            }
                        />

                        <CampoPerfil
                            label="Telefone"
                            value={
                                tecnico.telefone ||
                                "Não informado"
                            }
                            icon={
                                <Phone className="h-5 w-5" />
                            }
                        />

                        <CampoPerfil
                            label="Data de nascimento"
                            value={formatarData(
                                tecnico.data_nascimento
                            )}
                            icon={
                                <CalendarDays className="h-5 w-5" />
                            }
                        />

                        <CampoPerfil
                            label="CPF"
                            value={
                                tecnico.cpf ||
                                "Não informado"
                            }
                            icon={
                                <CreditCard className="h-5 w-5" />
                            }
                        />

                        <CampoPerfil
                            label="RG"
                            value={
                                tecnico.rg ||
                                "Não informado"
                            }
                            icon={
                                <FileText className="h-5 w-5" />
                            }
                        />

                        <CampoPerfil
                            label="Localização"
                            value={
                                localizacao ||
                                "Não informada"
                            }
                            icon={
                                <MapPin className="h-5 w-5" />
                            }
                        />

                        <CampoPerfil
                            label="Endereço"
                            value={
                                tecnico.endereco ||
                                "Não informado"
                            }
                            icon={
                                <UserCircle className="h-5 w-5" />
                            }
                        />
                    </div>
                </div>
            </section>
        </div>
    );
};

export default StaffPerfil;