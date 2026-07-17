import {
    useState,
} from "react";
import {
    LogIn,
    Menu,
    X,
} from "lucide-react";
import {
    useNavigate,
} from "react-router-dom";
import logo from "../assests/TECCORP LOGO/4.png";

const Navbar = () => {
    const navigate = useNavigate();

    const [isOpen, setIsOpen] =
        useState(false);

    const abrirLogin = () => {
        setIsOpen(false);

        navigate("/login");
    };

    return (
        <nav className="fixed z-50 w-full border-b border-slate-100 bg-white/95 shadow-sm backdrop-blur">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    <a
                        href="#home"
                        className="flex items-center"
                    >
                        <img
                            src={logo}
                            alt="Teccorp"
                            className="h-14 w-[210px] object-contain"
                        />
                    </a>

                    <div className="hidden items-center gap-6 md:flex">
                        <NavLink href="#home">
                            Início
                        </NavLink>

                        <NavLink href="#services">
                            Serviços
                        </NavLink>

                        <NavLink href="#about">
                            Sobre Nós
                        </NavLink>

                        <NavLink href="#clients">
                            Clientes
                        </NavLink>

                        <NavLink href="#contact">
                            Contato
                        </NavLink>

                        <button
                            type="button"
                            onClick={
                                abrirLogin
                            }
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-blue-700 px-5 text-sm font-bold text-white transition-colors hover:bg-blue-800"
                        >
                            <LogIn className="h-4 w-4" />
                            Entrar
                        </button>
                    </div>

                    <div className="flex items-center md:hidden">
                        <button
                            type="button"
                            onClick={() =>
                                setIsOpen(
                                    (valor) =>
                                        !valor
                                )
                            }
                            aria-label={
                                isOpen
                                    ? "Fechar menu"
                                    : "Abrir menu"
                            }
                            className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100"
                        >
                            {isOpen ? (
                                <X className="h-6 w-6" />
                            ) : (
                                <Menu className="h-6 w-6" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {isOpen && (
                <div className="border-t border-slate-100 bg-white md:hidden">
                    <div className="space-y-1 px-4 py-4">
                        <MobileNavLink
                            href="#home"
                            onClick={() =>
                                setIsOpen(
                                    false
                                )
                            }
                        >
                            Início
                        </MobileNavLink>

                        <MobileNavLink
                            href="#services"
                            onClick={() =>
                                setIsOpen(
                                    false
                                )
                            }
                        >
                            Serviços
                        </MobileNavLink>

                        <MobileNavLink
                            href="#about"
                            onClick={() =>
                                setIsOpen(
                                    false
                                )
                            }
                        >
                            Sobre Nós
                        </MobileNavLink>

                        <MobileNavLink
                            href="#clients"
                            onClick={() =>
                                setIsOpen(
                                    false
                                )
                            }
                        >
                            Clientes
                        </MobileNavLink>

                        <MobileNavLink
                            href="#contact"
                            onClick={() =>
                                setIsOpen(
                                    false
                                )
                            }
                        >
                            Contato
                        </MobileNavLink>

                        <button
                            type="button"
                            onClick={
                                abrirLogin
                            }
                            className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 text-sm font-bold text-white hover:bg-blue-800"
                        >
                            <LogIn className="h-4 w-4" />
                            Entrar no sistema
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
};

interface NavLinkProps {
    href: string;
    children: React.ReactNode;
}

const NavLink = ({
    href,
    children,
}: NavLinkProps) => {
    return (
        <a
            href={href}
            className="px-2 py-2 text-sm font-medium text-slate-700 transition-colors hover:text-blue-700"
        >
            {children}
        </a>
    );
};

interface MobileNavLinkProps {
    href: string;
    children: React.ReactNode;
    onClick: () => void;
}

const MobileNavLink = ({
    href,
    children,
    onClick,
}: MobileNavLinkProps) => {
    return (
        <a
            href={href}
            onClick={onClick}
            className="block rounded-lg px-3 py-2.5 text-base font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700"
        >
            {children}
        </a>
    );
};

export default Navbar;