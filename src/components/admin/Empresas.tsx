import CrudPage from "./CrudPage";

const columns = [
    { key: "nome", label: "Nome" },
    { key: "cnpj", label: "CNPJ" },
    { key: "contato", label: "Contato" },
    { key: "telefone", label: "Telefone" },
];

const initialData = [
    { id: "1", nome: "TechCorp", cnpj: "12.345.678/0001-90", contato: "Maria Silva", telefone: "(11) 99999-0001" },
    { id: "2", nome: "InfoServ", cnpj: "23.456.789/0001-01", contato: "João Souza", telefone: "(21) 99999-0002" },
    { id: "3", nome: "DataPro", cnpj: "34.567.890/0001-12", contato: "Ana Costa", telefone: "(31) 99999-0003" },
];

const Empresas = () => (
    <CrudPage
        title="Empresas"
        subtitle="Gerenciar empresas acionadoras"
        columns={columns}
        initialData={initialData}
    />
);

export default Empresas;