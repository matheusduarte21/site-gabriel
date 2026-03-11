import CrudPage from "./CrudPage";

const columns = [
    { key: "nome", label: "Nome" },
    { key: "email", label: "E-mail" },
    { key: "telefone", label: "Telefone" },
    { key: "cidade", label: "Cidade" },
];

const initialData = [
    { id: "1", nome: "Empresa ABC", email: "contato@abc.com", telefone: "(11) 3333-0001", cidade: "São Paulo" },
    { id: "2", nome: "Loja XYZ", email: "contato@xyz.com", telefone: "(21) 3333-0002", cidade: "Rio de Janeiro" },
];

const Clientes = () => (
    <CrudPage
        title="Clientes"
        subtitle="Gerenciar clientes atendidos"
        columns={columns}
        initialData={initialData}
    />
);

export default Clientes;