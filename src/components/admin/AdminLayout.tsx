import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSibebar";

const AdminLayout = () => {
    return (
        <div className="min-h-screen bg-background">
            <AdminSidebar />
            <main className="ml-64 min-h-screen p-6">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;