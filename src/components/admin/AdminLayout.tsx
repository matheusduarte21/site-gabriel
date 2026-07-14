import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";
import AdminSidebar from "./AdminSibebar";

const AdminLayout = () => {
    const [sidebarAberta, setSidebarAberta] = useState(false);

    return (
        <div className="min-h-screen bg-background">
            
            <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 lg:hidden">
                <span className="font-bold text-foreground">Teccorp</span>
                <button 
                    onClick={() => setSidebarAberta(true)}
                    className="rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
                >
                    <Menu className="h-6 w-6" />
                </button>
            </header>

            {sidebarAberta && (
                <div 
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={() => setSidebarAberta(false)}
                />
            )}

            <div className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 lg:translate-x-0 ${sidebarAberta ? "translate-x-0" : "-translate-x-full"}`}>
                <AdminSidebar fecharMenu={() => setSidebarAberta(false)} />
            </div>

            <main className="min-h-screen overflow-x-hidden p-4 lg:ml-64 lg:p-6">
                <Outlet />
            </main>
            
        </div>
    );
};

export default AdminLayout;