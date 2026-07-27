import { Outlet } from "react-router-dom";
import EstoqueNav from "./EstoqueNav";

const EstoqueLayout = () => {
    return (
        <div className="space-y-5">
            <EstoqueNav />
            <Outlet />
        </div>
    );
};

export default EstoqueLayout;
