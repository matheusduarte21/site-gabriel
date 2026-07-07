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
        onSubmit(form);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground border-b border-border pb-1 mb-6">
                    Informações Principais
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

            <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground border-b border-border pb-1 mb-6">
                    Localização e Documentos
                </h3>
                <div className="grid grid-cols-1 gap-4">
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
                            />
                            {isUploading && <span className="text-sm text-muted-foreground">Enviando...</span>}
                        </div>
                        {form.url_arquivo && (
                            <div className="mt-2 text-sm text-green-600">
                                ✓ Arquivo anexado com sucesso
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground border-b border-border pb-1 mb-6">
                    Agendamento e Horários
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                        <Label htmlFor="hora_agendamento">Hora Agendamento</Label>
                        <Input
                            id="hora_agendamento"
                            type="time"
                            value={form.hora_agendamento || ""}
                            onChange={(e) => handleChange("hora_agendamento", e.target.value)}
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
                        <Label htmlFor="hora_total">Hora Total</Label>
                        <Input
                            id="hora_total"
                            type="time"
                            value={form.hora_total || ""}
                            onChange={(e) => handleChange("hora_total", e.target.value)}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="hora_extra">Hora Extra</Label>
                        <Input
                            id="hora_extra"
                            value={form.hora_extra || ""}
                            onChange={(e) => handleChange("hora_extra", e.target.value)}
                            placeholder="Ex: 02:00"
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground border-b border-border pb-1">
                    Valores Financeiros
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="space-y-1.5">
                        <Label htmlFor="despesas">Despesas</Label>
                        <Input
                            id="despesas"
                            value={form.despesas || ""}
                            onChange={(e) => handleChange("despesas", e.target.value)}
                            placeholder="R$ 0,00"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="valor_chamado">Valor do Chamado</Label>
                        <Input
                            id="valor_chamado"
                            type="number"
                            step="0.01"
                            value={form.valor_chamado || ""}
                            onChange={(e) => handleChange("valor_chamado", e.target.value)}
                            placeholder="0.00"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="valor_total">Valor Total</Label>
                        <Input
                            id="valor_total"
                            type="number"
                            step="0.01"
                            value={form.valor_total || ""}
                            onChange={(e) => handleChange("valor_total", e.target.value)}
                            placeholder="0.00"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="valor_faturado">Valor Faturado</Label>
                        <Input
                            id="valor_faturado"
                            type="number"
                            step="0.01"
                            value={form.valor_faturado || ""}
                            onChange={(e) => handleChange("valor_faturado", e.target.value)}
                            placeholder="0.00"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="valor_pago">Valor Pago</Label>
                        <Input
                            id="valor_pago"
                            type="number"
                            step="0.01"
                            value={form.valor_pago || ""}
                            onChange={(e) => handleChange("valor_pago", e.target.value)}
                            placeholder="0.00"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="valor_ganho">Valor Ganho</Label>
                        <Input
                            id="valor_ganho"
                            type="number"
                            step="0.01"
                            value={form.valor_ganho || ""}
                            onChange={(e) => handleChange("valor_ganho", e.target.value)}
                            placeholder="0.00"
                            disabled
                        />
                    </div>
                </div>
            </div>

            <div className="mt-6 flex gap-3 border-t border-border pt-5">
                <Button type="submit" className="shadow-sm" disabled={isUploading}>
                    {initialData ? "Atualizar Chamado" : "Salvar Chamado"}
                </Button>
                <Button type="button" variant="outline" onClick={onCancel} disabled={isUploading}>
                    Cancelar
                </Button>
            </div>
        </form>
    );
};

export default ChamadoForm;