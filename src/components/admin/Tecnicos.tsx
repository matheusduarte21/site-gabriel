import CrudPage from "./CrudPage";

const columns = [
    { key: "nome", label: "Nome" },
    { key: "estado", label: "Estado" },
    { key: "especialidade", label: "Especialidade" },
    { key: "telefone", label: "Telefone" },
];

const initialData = [
    { id: "1", nome: "Gabriel Oliveira", estado: "SP", especialidade: "Redes", telefone: "(11) 98888-0001" },
    { id: "2", nome: "Lucas Santos", estado: "RJ", especialidade: "Hardware", telefone: "(21) 98888-0002" },
    { id: "3", nome: "Pedro Lima", estado: "MG", especialidade: "Software", telefone: "(31) 98888-0003" },
];

const Tecnicos = () => (
    <CrudPage
        title="Técnicos"
        subtitle="Gerenciar técnicos cadastrados"
        columns={columns}
        initialData={initialData}
    />
);

export default Tecnicos;