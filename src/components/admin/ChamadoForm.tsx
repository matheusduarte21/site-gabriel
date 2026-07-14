import { useState, useEffect } from "react";
import { Chamado, emptyChamado } from "../../types/chamado.type";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Checkbox } from "../ui/checkbox";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/Button";
import { uploadDocumento } from "../../services/Chamados/uplodate-chamados.service";
import { showError } from "../../lib/Utils/toast";

export type SelectOption = {
    value: string | number;
    label: string;
};

type ChamadoFormProps = {
    initialData?: Chamado | null;
    onSubmit: (chamado: Chamado) => void;
    onCancel: () => void;
    tecnicosOptions?: SelectOption[];
    clientesOptions?: SelectOption[];
    statusOptions?: SelectOption[];
}

const ChamadoForm = ({
    initialData,
    onSubmit,
    onCancel,
    tecnicosOptions = [],
    clientesOptions = [],
    statusOptions = []
}: ChamadoFormProps) => {
    const [form, setForm] = useState<Chamado>(initialData || emptyChamado);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        if (initialData) {
            setForm(initialData);
        } else {
            setForm(emptyChamado);
        }
    }, [initialData]);

    useEffect(() => {
        const parseNum = (val: any) => parseFloat(val) || 0;

        const totalCliente = 
            parseNum(form.valor_chamado_cliente) + 
            parseNum(form.hora_extra_cliente) + 
            parseNum(form.deslocamento_cliente) + 
            parseNum(form.reembolso_cliente);

        const totalTecnico = 
            parseNum(form.valor_chamado_tecnico) + 
            parseNum(form.hora_extra_tecnico) + 
            parseNum(form.deslocamento_tecnico) + 
            parseNum(form.reembolso_tecnico);

        if (form.valor_total_cliente !== totalCliente || form.valor_total_tecnico !== totalTecnico) {
            setForm(prev => ({
                ...prev,
                valor_total_cliente: totalCliente,
                valor_total_tecnico: totalTecnico
            }));
        }
    }, [
        form.valor_chamado_cliente, form.hora_extra_cliente, form.deslocamento_cliente, form.reembolso_cliente,
        form.valor_chamado_tecnico, form.hora_extra_tecnico, form.deslocamento_tecnico, form.reembolso_tecnico
    ]);

    const handleChange = (field: keyof Chamado, value: string | boolean | number) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const fileUrl = await uploadDocumento(file);
            handleChange("url_arquivo", fileUrl);
        } catch (error) {
            showError("Erro ao fazer upload do arquivo.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.hora_agendamento) {
            showError("A hora do agendamento é obrigatória!");
            return;
        }

        const dadosLimpos = { ...form };

        const camposTime: Array<"hora_total" | "hora_extra"> = [
            "hora_total",
            "hora_extra",
        ];

        camposTime.forEach((campo) => {
            if (dadosLimpos[campo] === "") {
            delete dadosLimpos[campo];
            }
        });

        onSubmit(dadosLimpos);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="rounded-xl border border-border bg-card/40 p-5 shadow-sm">
                <h3 className="text-sm font-bold text-foreground border-b border-border pb-2 mb-5">
                    Informações Principais
                </h3>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div className="space-y-1.5">
                        <Label htmlFor="numero_chamado">Número do Chamado</Label>
                        <Input
                            id="numero_chamado"
                            value={form.numero_chamado || ""}
                            onChange={(e) => handleChange("numero_chamado", e.target.value)}
                            placeholder="Ex: CH-001"
                            required
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="empresa">Empresa</Label>
                        <Input
                            id="empresa"
                            value={form.empresa || ""}
                            onChange={(e) => handleChange("empresa", e.target.value)}
                            placeholder="Nome da empresa"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="tecnico_id">Técnico</Label>
                        <Select
                            value={form.tecnico_id ? String(form.tecnico_id) : ""}
                            onValueChange={(v) => handleChange("tecnico_id", v)}
                        >
                            <SelectTrigger id="tecnico_id">
                                <SelectValue placeholder="Selecione um técnico" />
                            </SelectTrigger>
                            <SelectContent>
                                {tecnicosOptions.map((tec) => (
                                    <SelectItem key={tec.value} value={String(tec.value)}>
                                        {tec.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="cliente_id">Cliente</Label>
                        <Select
                            value={form.cliente_id ? String(form.cliente_id) : ""}
                            onValueChange={(v) => handleChange("cliente_id", v)}
                        >
                            <SelectTrigger id="cliente_id">
                                <SelectValue placeholder="Selecione um cliente" />
                            </SelectTrigger>
                            <SelectContent>
                                {clientesOptions.map((cli) => (
                                    <SelectItem key={cli.value} value={String(cli.value)}>
                                        {cli.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="status_id">Status</Label>
                        <Select
                            value={form.status_id ? String(form.status_id) : ""}
                            onValueChange={(v) => handleChange("status_id", v)}
                        >
                            <SelectTrigger id="status_id">
                                <SelectValue placeholder="Selecionar status" />
                            </SelectTrigger>
                            <SelectContent>
                                {statusOptions.map((st) => (
                                    <SelectItem key={st.value} value={String(st.value)}>
                                        {st.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center gap-2 pt-6">
                        <Checkbox
                            id="retorno"
                            checked={form.retorno || false}
                            onCheckedChange={(checked) =>
                                handleChange("retorno", checked === true)
                            }
                        />
                        <Label htmlFor="retorno" className="cursor-pointer">Retorno</Label>
                    </div>
                </div>
            </div>

            <div className="rounded-xl border border-border bg-card/40 p-5 shadow-sm">
                <h3 className="text-sm font-bold text-foreground border-b border-border pb-2 mb-5">
                    Localização e Documentos
                </h3>
                <div className="grid grid-cols-1 gap-5">
                    <div className="space-y-1.5">
                        <Label htmlFor="endereco">Endereço</Label>
                        <Input
                            id="endereco"
                            value={form.endereco || ""}
                            onChange={(e) => handleChange("endereco", e.target.value)}
                            placeholder="Endereço completo"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="observacoes">Observações</Label>
                        <Textarea
                            id="observacoes"
                            value={form.observacoes || ""}
                            onChange={(e) => handleChange("observacoes", e.target.value)}
                            placeholder="Observações adicionais..."
                            rows={2}
                        />
                    </div>
                    
                    <div className="space-y-1.5">
                        <Label htmlFor="arquivo_upload">Enviar Documento/Comprovante</Label>
                        <div className="flex items-center gap-3">
                            <Input
                                id="arquivo_upload"
                                type="file"
                                onChange={handleFileChange}
                                disabled={isUploading}
                                className="cursor-pointer"
                            />
                            {isUploading && <span className="text-sm text-muted-foreground">Enviando...</span>}
                        </div>
                        {form.url_arquivo && (
                            <div className="mt-2 text-sm text-green-600 font-medium">
                                ✓ Arquivo anexado com sucesso
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="rounded-xl border border-border bg-card/40 p-5 shadow-sm">
                <h3 className="text-sm font-bold text-foreground border-b border-border pb-2 mb-5">
                    Agendamento e Horários
                </h3>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="space-y-1.5">
                        <Label htmlFor="data_agendamento">Data Agendamento</Label>
                        <Input
                            id="data_agendamento"
                            type="date"
                            value={form.data_agendamento || ""}
                            onChange={(e) => handleChange("data_agendamento", e.target.value)}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="hora_agendamento">Hora Agendamento <span className="text-destructive">*</span></Label>
                        <Input
                            id="hora_agendamento"
                            type="time"
                            value={form.hora_agendamento || ""}
                            onChange={(e) => handleChange("hora_agendamento", e.target.value)}
                            required 
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="hora_chegada">Hora Chegada</Label>
                        <Input
                            id="hora_chegada"
                            type="time"
                            value={form.hora_chegada || ""}
                            onChange={(e) => handleChange("hora_chegada", e.target.value)}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="hora_inicio">Hora Início</Label>
                        <Input
                            id="hora_inicio"
                            type="time"
                            value={form.hora_inicio || ""}
                            onChange={(e) => handleChange("hora_inicio", e.target.value)}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="hora_fim">Hora Fim</Label>
                        <Input
                            id="hora_fim"
                            type="time"
                            value={form.hora_fim || ""}
                            onChange={(e) => handleChange("hora_fim", e.target.value)}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="hora_total_str">Tempo Total</Label>
                        <Input
                            id="hora_total_str"
                            type="time"
                            value={form.hora_total_str || ""}
                            onChange={(e) => handleChange("hora_total_str", e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Lado Esquerdo: CLIENTE */}
                <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-5 shadow-sm">
                    <h3 className="text-sm font-bold text-blue-500 border-b border-blue-500/20 pb-2 mb-5">
                        Valores Cobrados (Cliente)
                    </h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="valor_chamado_cliente">Valor do Chamado</Label>
                            <Input
                                id="valor_chamado_cliente"
                                type="number" step="0.01"
                                value={form.valor_chamado_cliente || ""}
                                onChange={(e) => handleChange("valor_chamado_cliente", e.target.value)}
                                placeholder="0.00"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="hora_extra_cliente">Hora Extra</Label>
                            <Input
                                id="hora_extra_cliente"
                                type="number" step="0.01"
                                value={form.hora_extra_cliente || ""}
                                onChange={(e) => handleChange("hora_extra_cliente", e.target.value)}
                                placeholder="0.00"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="deslocamento_cliente">Deslocamento</Label>
                            <Input
                                id="deslocamento_cliente"
                                type="number" step="0.01"
                                value={form.deslocamento_cliente || ""}
                                onChange={(e) => handleChange("deslocamento_cliente", e.target.value)}
                                placeholder="0.00"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="reembolso_cliente">Reembolso</Label>
                            <Input
                                id="reembolso_cliente"
                                type="number" step="0.01"
                                value={form.reembolso_cliente || ""}
                                onChange={(e) => handleChange("reembolso_cliente", e.target.value)}
                                placeholder="0.00"
                            />
                        </div>
                        <div className="space-y-1.5 sm:col-span-2 mt-2">
                            <Label htmlFor="valor_total_cliente" className="font-bold">Valor Total (Cliente)</Label>
                            <Input
                                id="valor_total_cliente"
                                type="number" step="0.01"
                                value={form.valor_total_cliente || ""}
                                disabled
                                className="bg-blue-500/10 font-bold text-blue-500"
                            />
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-5 shadow-sm">
                    <h3 className="text-sm font-bold text-orange-500 border-b border-orange-500/20 pb-2 mb-5">
                        Valores Repassados (Técnico)
                    </h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="valor_chamado_tecnico">Valor do Chamado</Label>
                            <Input
                                id="valor_chamado_tecnico"
                                type="number" step="0.01"
                                value={form.valor_chamado_tecnico || ""}
                                onChange={(e) => handleChange("valor_chamado_tecnico", e.target.value)}
                                placeholder="0.00"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="hora_extra_tecnico">Hora Extra</Label>
                            <Input
                                id="hora_extra_tecnico"
                                type="number" step="0.01"
                                value={form.hora_extra_tecnico || ""}
                                onChange={(e) => handleChange("hora_extra_tecnico", e.target.value)}
                                placeholder="0.00"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="deslocamento_tecnico">Deslocamento</Label>
                            <Input
                                id="deslocamento_tecnico"
                                type="number" step="0.01"
                                value={form.deslocamento_tecnico || ""}
                                onChange={(e) => handleChange("deslocamento_tecnico", e.target.value)}
                                placeholder="0.00"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="reembolso_tecnico">Reembolso</Label>
                            <Input
                                id="reembolso_tecnico"
                                type="number" step="0.01"
                                value={form.reembolso_tecnico || ""}
                                onChange={(e) => handleChange("reembolso_tecnico", e.target.value)}
                                placeholder="0.00"
                            />
                        </div>
                        <div className="space-y-1.5 sm:col-span-2 mt-2">
                            <Label htmlFor="valor_total_tecnico" className="font-bold">Valor Total (Técnico)</Label>
                            <Input
                                id="valor_total_tecnico"
                                type="number" step="0.01"
                                value={form.valor_total_tecnico || ""}
                                disabled
                                className="bg-orange-500/10 font-bold text-orange-500"
                            />
                        </div>
                    </div>
                </div>

            </div>

            <div className="mt-6 flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onCancel} disabled={isUploading}>
                    Cancelar
                </Button>
                <Button type="submit" className="shadow-sm min-w-[150px]" disabled={isUploading}>
                    {initialData ? "Atualizar Chamado" : "Salvar Chamado"}
                </Button>
            </div>
        </form>
    );
};

export default ChamadoForm;