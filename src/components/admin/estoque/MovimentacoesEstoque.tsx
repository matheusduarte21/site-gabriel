import { Navigate } from "react-router-dom";

const MovimentacoesEstoque = () => {
    return (
        <Navigate
            to="/admin/estoque/equipamentos"
            replace
        />
    );
};

export default MovimentacoesEstoque;
