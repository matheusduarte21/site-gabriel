import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";
import { TecnicoProvider } from "../../context/TecnicoContext";
import StaffSidebar from "./StaffSidebar";
import teccorpLogo from "../../assests/TECCORP LOGO/2.png";

const StaffLayoutContent = () => {
    const [sidebarAberta, setSidebarAberta] =
        useState(false);

    return (
        <div className="min-h-screen bg-background">
            <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card/95 px-4 shadow-sm backdrop-blur lg:hidden">
                <img
                    src={teccorpLogo}
                    alt="Teccorp"
                    className="h-10 w-auto max-w-[155px] object-contain"
                />

                <button
                    type="button"
                    onClick={() =>
                        setSidebarAberta(true)
                    }
                    aria-label="Abrir menu"
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground shadow-sm transition-colors hover:bg-secondary hover:text-foreground"
                >
                    <Menu className="h-5 w-5" />
                </button>
            </header>

            {sidebarAberta && (
                <button
                    type="button"
                    onClick={() =>
                        setSidebarAberta(false)
                    }
                    aria-label="Fechar menu"
                    className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px] lg:hidden"
                />
            )}

            <div
                className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
                    sidebarAberta
                        ? "translate-x-0"
                        : "-translate-x-full"
                }`}
            >
                <StaffSidebar
                    fecharMenu={() =>
                        setSidebarAberta(false)
                    }
                />
            </div>

            <main className="min-h-screen overflow-x-hidden p-4 pb-24 sm:p-5 sm:pb-24 lg:ml-64 lg:p-6">
                <Outlet />
            </main>
        </div>
    );
};

const StaffLayout = () => {
    return (
        <TecnicoProvider>
            <StaffLayoutContent />
        </TecnicoProvider>
    );
};

export default StaffLayout;