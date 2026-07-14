import {
    type ReactNode,
    useEffect,
    useState,
} from "react";
import {
    Building2,
    Calendar,
    CheckCircle,
    Link2,
    Loader2,
    Mail,
    MapPin,
    Phone,
    User,
} from "lucide-react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/Button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select";
import { getMunicipiosPorEstado } from "../../services/Municipios/get-municipios-by-estado.service";
import { showError } from "../../lib/Utils/toast";

export type SelectOption = {
    value: string | number;
    label: string;
};

type TecnicoFormData = {
    id?: string;
    usuario_id?: string;
    nome?: string;
    email_contato?: string;
    telefone?: string;
    data_nascimento?: string;
    endereco?: string;
    estado_id?: string | number;
    municipio_id?: string | number;
    cpf?: string;
    rg?: string;
};

type TecnicoFormProps = {
    initialData?: TecnicoFormData | null;
    onSubmit: (
        data: TecnicoFormData
    ) => void | Promise<void>;
    onCancel: () => void;
    estadosOptions?: SelectOption[];
    usuariosOptions?: SelectOption[];
};

type SecaoProps = {
    titulo: string;
    descricao?: string;
    icone: ReactNode;
    children: ReactNode;
};

const Secao = ({
    titulo,
    descricao,
    icone,
    children,
}: SecaoProps) => {
    return (
        <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-5 flex items-start gap-3 border-b border-border pb-4">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    {icone}
                </span>

                <div>
                    <h3 className="text-sm font-bold text-foreground">
                        {titulo}
                    </h3>

                    {descricao && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                            {descricao}
                        </p>
                    )}
                </div>
            </div>

            {children}
        </section>
    );
};

const TecnicoForm = ({
    initialData,
    onSubmit,
    onCancel,
    estadosOptions = [],
    usuariosOptions = [],
}: TecnicoFormProps) => {
    const [form, setForm] =
        useState<TecnicoFormData>({});

    const [
        municipiosOptions,
        setMunicipiosOptions,
    ] = useState<SelectOption[]>([]);

    const [
        isLoadingMunicipios,
        setIsLoadingMunicipios,
    ] = useState(false);

    const [isSubmitting, setIsSubmitting] =
        useState(false);

    const carregarMunicipios = async (
        estadoId: string | number
    ) => {
        try {
            setIsLoadingMunicipios(true);
            setMunicipiosOptions([]);

            const dados =
                await getMunicipiosPorEstado(estadoId);

            const municipiosFormatados = dados.map(
                (municipio: any) => ({
                    value: municipio.id,
                    label: municipio.nome,
                })
            );

            setMunicipiosOptions(
                municipiosFormatados
            );
        } catch (error) {
            console.error(
                "Erro ao carregar municípios:",
                error
            );

            showError(
                "Não foi possível carregar os municípios."
            );
        } finally {
            setIsLoadingMunicipios(false);
        }
    };

    useEffect(() => {
        const dadosIniciais = initialData
            ? { ...initialData }
            : {};

        setForm(dadosIniciais);

        if (initialData?.estado_id) {
            carregarMunicipios(
                initialData.estado_id
            );
        } else {
            setMunicipiosOptions([]);
        }
    }, [initialData]);

    const handleChange = (
        field: keyof TecnicoFormData,
        value: string | number
    ) => {
        setForm((estadoAtual) => ({
            ...estadoAtual,
            [field]: value,
        }));
    };

    const handleEstadoChange = (
        valor: string
    ) => {
        const estadoId = Number(valor);

        setForm((estadoAtual) => ({
            ...estadoAtual,
            estado_id: estadoId,
            municipio_id: "",
        }));

        carregarMunicipios(estadoId);
    };

    const handleSubmit = async (
        event: React.FormEvent
    ) => {
        event.preventDefault();

        if (!form.usuario_id) {
            showError(
                "Selecione a conta de usuário relacionada."
            );

            return;
        }

        if (!form.nome?.trim()) {
            showError(
                "Informe o nome do técnico."
            );

            return;
        }

        if (!form.estado_id) {
            showError(
                "Selecione o estado do técnico."
            );

            return;
        }

        if (!form.municipio_id) {
            showError(
                "Selecione o município do técnico."
            );

            return;
        }

        try {
            setIsSubmitting(true);

            await onSubmit({
                ...form,
                nome: form.nome.trim(),
                email_contato:
                    form.email_contato?.trim() || "",
                telefone:
                    form.telefone?.trim() || "",
                endereco:
                    form.endereco?.trim() || "",
                cpf: form.cpf?.trim() || "",
                rg: form.rg?.trim() || "",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const bloqueado =
        isSubmitting || isLoadingMunicipios;

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-6 pt-2"
        >
            <Secao
                titulo="Vínculo de acesso"
                descricao="Relacione o técnico a uma conta de acesso existente"
                icone={
                    <Link2 className="h-5 w-5" />
                }
            >
                <div className="grid grid-cols-1 gap-5">
                    <div className="space-y-1.5">
                        <Label htmlFor="usuario_id">
                            Conta de usuário{" "}
                            <span className="text-destructive">
                                *
                            </span>
                        </Label>

                        <Select
                            value={
                                form.usuario_id
                                    ? String(
                                          form.usuario_id
                                      )
                                    : ""
                            }
                            onValueChange={(value) =>
                                handleChange(
                                    "usuario_id",
                                    value
                                )
                            }
                        >
                            <SelectTrigger id="usuario_id">
                                <SelectValue placeholder="Selecione o e-mail de acesso do técnico" />
                            </SelectTrigger>

                            <SelectContent>
                                {usuariosOptions.map(
                                    (usuario) => (
                                        <SelectItem
                                            key={
                                                usuario.value
                                            }
                                            value={String(
                                                usuario.value
                                            )}
                                        >
                                            {usuario.label}
                                        </SelectItem>
                                    )
                                )}
                            </SelectContent>
                        </Select>

                        <p className="text-xs text-muted-foreground">
                            Esta conta será utilizada pelo
                            técnico para acessar o sistema.
                        </p>
                    </div>
                </div>
            </Secao>

            <Secao
                titulo="Dados pessoais"
                descricao="Informações de identificação e contato do profissional"
                icone={
                    <User className="h-5 w-5" />
                }
            >
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
                        <Label htmlFor="nome">
                            Nome completo{" "}
                            <span className="text-destructive">
                                *
                            </span>
                        </Label>

                        <div className="relative">
                            <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                            <Input
                                id="nome"
                                value={form.nome ?? ""}
                                onChange={(event) =>
                                    handleChange(
                                        "nome",
                                        event.target.value
                                    )
                                }
                                placeholder="Nome completo do técnico"
                                className="pl-10"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="email_contato">
                            E-mail de contato
                        </Label>

                        <div className="relative">
                            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                            <Input
                                id="email_contato"
                                type="email"
                                value={
                                    form.email_contato ??
                                    ""
                                }
                                onChange={(event) =>
                                    handleChange(
                                        "email_contato",
                                        event.target.value
                                    )
                                }
                                placeholder="email@exemplo.com"
                                className="pl-10"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="telefone">
                            Telefone
                        </Label>

                        <div className="relative">
                            <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                            <Input
                                id="telefone"
                                type="tel"
                                value={
                                    form.telefone ?? ""
                                }
                                onChange={(event) =>
                                    handleChange(
                                        "telefone",
                                        event.target.value
                                    )
                                }
                                placeholder="(00) 00000-0000"
                                className="pl-10"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="data_nascimento">
                            Data de nascimento
                        </Label>

                        <div className="relative">
                            <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                            <Input
                                id="data_nascimento"
                                type="date"
                                value={
                                    form.data_nascimento ??
                                    ""
                                }
                                onChange={(event) =>
                                    handleChange(
                                        "data_nascimento",
                                        event.target.value
                                    )
                                }
                                className="pl-10"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="cpf">
                            CPF
                        </Label>

                        <Input
                            id="cpf"
                            value={form.cpf ?? ""}
                            onChange={(event) =>
                                handleChange(
                                    "cpf",
                                    event.target.value
                                )
                            }
                            placeholder="000.000.000-00"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="rg">
                            RG
                        </Label>

                        <Input
                            id="rg"
                            value={form.rg ?? ""}
                            onChange={(event) =>
                                handleChange(
                                    "rg",
                                    event.target.value
                                )
                            }
                            placeholder="Número do RG"
                        />
                    </div>
                </div>
            </Secao>

            <Secao
                titulo="Endereço e região de atendimento"
                descricao="Localização principal utilizada no cadastro do técnico"
                icone={
                    <MapPin className="h-5 w-5" />
                }
            >
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div className="space-y-1.5 sm:col-span-2">
                        <Label htmlFor="endereco">
                            Endereço completo
                        </Label>

                        <div className="relative">
                            <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                            <Input
                                id="endereco"
                                value={
                                    form.endereco ?? ""
                                }
                                onChange={(event) =>
                                    handleChange(
                                        "endereco",
                                        event.target.value
                                    )
                                }
                                placeholder="Rua, número, complemento e bairro"
                                className="pl-10"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="estado_id">
                            Estado{" "}
                            <span className="text-destructive">
                                *
                            </span>
                        </Label>

                        <Select
                            value={
                                form.estado_id
                                    ? String(
                                          form.estado_id
                                      )
                                    : ""
                            }
                            onValueChange={
                                handleEstadoChange
                            }
                        >
                            <SelectTrigger id="estado_id">
                                <SelectValue placeholder="Selecione um estado" />
                            </SelectTrigger>

                            <SelectContent>
                                {estadosOptions.map(
                                    (estado) => (
                                        <SelectItem
                                            key={
                                                estado.value
                                            }
                                            value={String(
                                                estado.value
                                            )}
                                        >
                                            {estado.label}
                                        </SelectItem>
                                    )
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="municipio_id">
                            Município{" "}
                            <span className="text-destructive">
                                *
                            </span>
                        </Label>

                        <Select
                            value={
                                form.municipio_id
                                    ? String(
                                          form.municipio_id
                                      )
                                    : ""
                            }
                            onValueChange={(value) =>
                                handleChange(
                                    "municipio_id",
                                    Number(value)
                                )
                            }
                            disabled={
                                !form.estado_id ||
                                isLoadingMunicipios
                            }
                        >
                            <SelectTrigger id="municipio_id">
                                <SelectValue
                                    placeholder={
                                        isLoadingMunicipios
                                            ? "Carregando municípios..."
                                            : !form.estado_id
                                              ? "Selecione primeiro o estado"
                                              : "Selecione um município"
                                    }
                                />
                            </SelectTrigger>

                            <SelectContent>
                                {municipiosOptions.map(
                                    (municipio) => (
                                        <SelectItem
                                            key={
                                                municipio.value
                                            }
                                            value={String(
                                                municipio.value
                                            )}
                                        >
                                            {
                                                municipio.label
                                            }
                                        </SelectItem>
                                    )
                                )}
                            </SelectContent>
                        </Select>

                        {isLoadingMunicipios && (
                            <div className="flex items-center gap-2 text-xs font-medium text-blue-600">
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                Carregando municípios...
                            </div>
                        )}
                    </div>
                </div>
            </Secao>

            <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4">
                <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                        <Building2 className="h-4 w-4" />
                    </span>

                    <div>
                        <p className="text-sm font-bold text-blue-700">
                            Cadastro do técnico
                        </p>

                        <p className="mt-1 text-xs leading-5 text-blue-700/80">
                            Verifique o vínculo de acesso,
                            os dados pessoais e a região de
                            atendimento antes de salvar.
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isSubmitting}
                    className="sm:min-w-[120px]"
                >
                    Cancelar
                </Button>

                <Button
                    type="submit"
                    disabled={bloqueado}
                    className="gap-2 shadow-sm sm:min-w-[170px]"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Salvando...
                        </>
                    ) : (
                        <>
                            <CheckCircle className="h-4 w-4" />

                            {initialData
                                ? "Atualizar técnico"
                                : "Salvar técnico"}
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
};

export default TecnicoForm;