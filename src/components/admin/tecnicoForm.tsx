import { useState, useEffect } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/Button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { getMunicipiosPorEstado } from "../../services/Municipios/get-municipios-by-estado.service";

export type SelectOption = {
    value: string | number;
    label: string;
};

type TecnicoFormProps = {
    initialData?: any | null;
    onSubmit: (data: any) => void;
    onCancel: () => void;
    estadosOptions?: SelectOption[];
    usuariosOptions?: SelectOption[];
}

const TecnicoForm = ({
    initialData,
    onSubmit,
    onCancel,
    estadosOptions = [],
    usuariosOptions = []
}: TecnicoFormProps) => {
    const [form, setForm] = useState<any>({});
    const [municipiosOptions, setMunicipiosOptions] = useState<SelectOption[]>([]);
    const [isLoadingMunicipios, setIsLoadingMunicipios] = useState(false);

    useEffect(() => {
        if (initialData) {
            setForm(initialData);
            if (initialData.estado_id) {
                carregarMunicipios(initialData.estado_id);
            }
        } else {
            setForm({});
            setMunicipiosOptions([]);
        }
    }, [initialData]);

    const carregarMunicipios = async (estadoId: string | number) => {
        setIsLoadingMunicipios(true);
        try {
            const dados = await getMunicipiosPorEstado(estadoId);
            const formatado = dados.map((mun: any) => ({
                value: mun.id,
                label: mun.nome
            }));
            setMunicipiosOptions(formatado);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoadingMunicipios(false);
        }
    };

    const handleChange = (field: string, value: string | number) => {
        setForm((prev: any) => ({ ...prev, [field]: value }));
    };

    const handleEstadoChange = (valor: string) => {
        const estadoId = Number(valor);
        handleChange("estado_id", estadoId);
        handleChange("municipio_id", ""); 
        carregarMunicipios(estadoId);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(form);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground border-b border-border pb-1 mb-6">
                    Vínculo de Acesso
                </h3>
                <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="usuario_id">Conta de Usuário Relacionada</Label>
                        <Select
                            value={form.usuario_id ? String(form.usuario_id) : ""}
                            onValueChange={(v) => handleChange("usuario_id", v)}
                        >
                            <SelectTrigger id="usuario_id">
                                <SelectValue placeholder="Selecione o e-mail de login deste técnico" />
                            </SelectTrigger>
                            <SelectContent>
                                {usuariosOptions.map((user) => (
                                    <SelectItem key={user.value} value={String(user.value)}>
                                        {user.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground border-b border-border pb-1 mb-6">
                    Dados Pessoais
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                        <Label htmlFor="nome">Nome Completo</Label>
                        <Input
                            id="nome"
                            value={form.nome || ""}
                            onChange={(e) => handleChange("nome", e.target.value)}
                            placeholder="Nome do técnico"
                            required
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="email_contato">E-mail de Contato</Label>
                        <Input
                            id="email_contato"
                            type="email"
                            value={form.email_contato || ""}
                            onChange={(e) => handleChange("email_contato", e.target.value)}
                            placeholder="email@exemplo.com"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="telefone">Telefone</Label>
                        <Input
                            id="telefone"
                            value={form.telefone || ""}
                            onChange={(e) => handleChange("telefone", e.target.value)}
                            placeholder="(00) 00000-0000"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="data_nascimento">Data de Nascimento</Label>
                        <Input
                            id="data_nascimento"
                            type="date"
                            value={form.data_nascimento || ""}
                            onChange={(e) => handleChange("data_nascimento", e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground border-b border-border pb-1 mb-6">
                    Endereço
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5 sm:col-span-2">
                        <Label htmlFor="endereco">Endereço Completo</Label>
                        <Input
                            id="endereco"
                            value={form.endereco || ""}
                            onChange={(e) => handleChange("endereco", e.target.value)}
                            placeholder="Rua, Número, Bairro"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="estado_id">Estado</Label>
                        <Select
                            value={form.estado_id ? String(form.estado_id) : ""}
                            onValueChange={handleEstadoChange}
                        >
                            <SelectTrigger id="estado_id">
                                <SelectValue placeholder="Selecione um estado" />
                            </SelectTrigger>
                            <SelectContent>
                                {estadosOptions.map((est) => (
                                    <SelectItem key={est.value} value={String(est.value)}>
                                        {est.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="municipio_id">Município</Label>
                        <Select
                            value={form.municipio_id ? String(form.municipio_id) : ""}
                            onValueChange={(v) => handleChange("municipio_id", Number(v))}
                            disabled={!form.estado_id || isLoadingMunicipios}
                        >
                            <SelectTrigger id="municipio_id">
                                <SelectValue placeholder={isLoadingMunicipios ? "Carregando..." : "Selecione um município"} />
                            </SelectTrigger>
                            <SelectContent>
                                {municipiosOptions.map((mun) => (
                                    <SelectItem key={mun.value} value={String(mun.value)}>
                                        {mun.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            <div className="mt-6 flex gap-3 border-t border-border pt-5">
                <Button type="submit" className="shadow-sm">
                    {initialData ? "Atualizar Técnico" : "Salvar Técnico"}
                </Button>
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancelar
                </Button>
            </div>
        </form>
    );
};

export default TecnicoForm;