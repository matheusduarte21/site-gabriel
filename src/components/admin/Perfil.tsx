import { useState, useEffect } from "react";
import { 
  Mail, Phone, MapPin, Pencil, MapIcon, Check, X, Lock
} from "lucide-react";
import { atualizarPerfil, obterPerfilLogado, atualizarSenha, PerfilUsuarioCompleto } from "../../services/Usuarios/perfil.service";

export default function Perfil() {
  const [activeTab, setActiveTab] = useState("dados-pessoais");
  const [user, setUser] = useState<PerfilUsuarioCompleto | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<PerfilUsuarioCompleto>>({});
  const [saving, setSaving] = useState(false);

  const [senhaData, setSenhaData] = useState({ novaSenha: "", confirmarSenha: "" });
  const [savingSenha, setSavingSenha] = useState(false);
  const [senhaMessage, setSenhaMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const dados = await obterPerfilLogado();
      setUser(dados);
      setFormData(dados);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const salvarEdicao = async () => {
    try {
      setSaving(true);
      const dadosAtualizados = await atualizarPerfil(formData);
      setUser(dadosAtualizados);
      setIsEditing(false);
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const cancelarEdicao = () => {
    setFormData(user || {});
    setIsEditing(false);
  };

  const handleMudarSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    setSenhaMessage({ type: "", text: "" });

    if (senhaData.novaSenha.length < 6) {
      setSenhaMessage({ type: "error", text: "A senha deve ter pelo menos 6 caracteres." });
      return;
    }

    if (senhaData.novaSenha !== senhaData.confirmarSenha) {
      setSenhaMessage({ type: "error", text: "As senhas não coincidem." });
      return;
    }

    try {
      setSavingSenha(true);
      await atualizarSenha(senhaData.novaSenha);
      setSenhaMessage({ type: "success", text: "Senha atualizada com sucesso!" });
      setSenhaData({ novaSenha: "", confirmarSenha: "" });
    } catch (error) {
      setSenhaMessage({ type: "error", text: "Erro ao atualizar a senha. Tente novamente." });
    } finally {
      setSavingSenha(false);
    }
  };

  if (loading) {
    return <div className="flex h-full items-center justify-center text-muted-foreground">Carregando perfil...</div>;
  }

  if (!user) {
    return <div className="text-destructive">Erro ao carregar os dados do usuário.</div>;
  }

  const iniciais = user.nome?.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() || "US";
  const regiaoFormatada = user.municipio && user.estado ? `${user.municipio.nome} - ${user.estado.sigla}` : "-";

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Meu Perfil</h1>
        
        {activeTab === "dados-pessoais" && user.tipo_perfil_id !== 1 && !isEditing ? (
          <button 
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            <Pencil className="h-4 w-4" />
            Editar
          </button>
        ) : isEditing && activeTab === "dados-pessoais" ? (
          <div className="flex gap-2">
            <button 
              onClick={cancelarEdicao}
              disabled={saving}
              className="flex items-center gap-2 rounded-md border border-border bg-transparent px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary"
            >
              <X className="h-4 w-4" />
              Cancelar
            </button>
            <button 
              onClick={salvarEdicao}
              disabled={saving}
              className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <Check className="h-4 w-4" />
              {saving ? "Salvando..." : "Salvar"}
            </button>
          </div>
        ) : null}
      </div>

      <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-2xl font-semibold text-primary-foreground">
          {iniciais}
        </div>
        <div className="flex flex-col gap-2">
          {isEditing ? (
            <input 
              name="nome"
              value={formData.nome || ""}
              onChange={handleInputChange}
              className="rounded-md border border-input bg-background px-3 py-1 text-xl font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          ) : (
            <h2 className="text-xl font-bold text-foreground">{user.nome}</h2>
          )}
          <span className="w-fit rounded-full bg-green-500/20 px-3 py-1 text-xs font-medium text-green-400">
            {user.tipo_perfil_id === 1 ? "Administrador" : "Disponível"}
          </span>
        </div>
      </div>

      <div className="flex gap-2 border-b border-border pb-px">
        <button 
          onClick={() => { setActiveTab("dados-pessoais"); setIsEditing(false); }}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${activeTab === "dados-pessoais" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
        >
          Dados Pessoais
        </button>
        <button 
          onClick={() => { setActiveTab("seguranca"); setIsEditing(false); }}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${activeTab === "seguranca" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
        >
          Segurança
        </button>
      </div>

      {activeTab === "dados-pessoais" && (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-6 rounded-xl border border-border bg-card p-6">
            <h3 className="text-lg font-semibold text-foreground">Informações de Contato</h3>
            
            <div className="flex items-center gap-4">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div className="flex flex-col w-full">
                <span className="text-xs text-muted-foreground">E-mail</span>
                <span className="text-sm text-foreground">{user.email_contato || "-"}</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <div className="flex flex-col w-full">
                <span className="text-xs text-muted-foreground">Telefone</span>
                {isEditing ? (
                  <input name="telefone" value={formData.telefone || ""} onChange={handleInputChange} className="mt-1 rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
                ) : (
                  <span className="text-sm text-foreground">{user.telefone || "-"}</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6 rounded-xl border border-border bg-card p-6">
            <h3 className="text-lg font-semibold text-foreground">Localização</h3>
            
            <div className="flex items-start gap-4">
              <MapPin className="h-5 w-5 text-muted-foreground mt-1" />
              <div className="flex flex-col w-full">
                <span className="text-xs text-muted-foreground">Região</span>
                <span className="text-sm text-foreground">{regiaoFormatada}</span>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <MapIcon className="h-5 w-5 text-muted-foreground mt-1" />
              <div className="flex flex-col w-full">
                <span className="text-xs text-muted-foreground">Endereço</span>
                {isEditing ? (
                  <textarea name="endereco" value={formData.endereco || ""} onChange={handleInputChange} rows={3} className="mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none" />
                ) : (
                  <span className="text-sm text-foreground whitespace-pre-line">{user.endereco || "-"}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "seguranca" && (
        <div className="flex flex-col gap-6 rounded-xl border border-border bg-card p-6 max-w-xl">
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-foreground" />
            <h3 className="text-lg font-semibold text-foreground">Alterar Senha</h3>
          </div>
          
          <form onSubmit={handleMudarSenha} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm text-muted-foreground">Nova Senha</label>
              <input 
                type="password"
                value={senhaData.novaSenha}
                onChange={(e) => setSenhaData({...senhaData, novaSenha: e.target.value})}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                placeholder="Mínimo 6 caracteres"
                required
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-sm text-muted-foreground">Confirmar Nova Senha</label>
              <input 
                type="password"
                value={senhaData.confirmarSenha}
                onChange={(e) => setSenhaData({...senhaData, confirmarSenha: e.target.value})}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                placeholder="Repita a nova senha"
                required
              />
            </div>

            {senhaMessage.text && (
              <span className={`text-sm ${senhaMessage.type === "error" ? "text-destructive" : "text-green-500"}`}>
                {senhaMessage.text}
              </span>
            )}

            <button 
              type="submit"
              disabled={savingSenha}
              className="mt-2 w-fit rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {savingSenha ? "Atualizando..." : "Atualizar Senha"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}