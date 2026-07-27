import {
    BrowserRouter as Router,
    Navigate,
    Route,
    Routes,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Services from "./components/Services";
import About from "./components/About";
import Clients from "./components/Clients";
import Contact from "./components/Contact";
import AdminLayout from "./components/admin/AdminLayout";
import AdminHome from "./components/admin/AdminHome";
import Clientes from "./components/admin/Clientes";
import Tecnicos from "./components/admin/Tecnicos";
import Usuarios from "./components/admin/Usuarios";
import Perfil from "./components/admin/Perfil";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import StaffLayout from "./components/staff/StaffLayout";
import StaffDashboard from "./components/staff/StaffDashboard";
import StaffChamados from "./components/staff/StaffChamados";
import StaffAdiantamentos from "./components/staff/StaffAdiantamentos";
import StaffPerfil from "./components/staff/StaffPerfil";
import StaffVideos from "./components/staff/StaffVideos";
import { AuthProvider } from "./context/AuthContext";
import BibliotecaVideos from "./components/admin/BibliotecaVideos/BibliotecaVideos";
import Chamados from "./components/admin/ChamadosTemp.";
import Login from "./components/auth/Login";
import AdiantamentosAdmin from "./components/admin/adiantamento/AdiantamentosAdmin";
import EquipamentosDevolvidos from "./components/admin/estoque/EquipamentosDevolvidos";
import MovimentacoesEstoque from "./components/admin/estoque/MovimentacoesEstoque";
import EquipamentosAdmin from "./components/admin/estoque/EquipamentosAdmin";
import EstoqueDashboard from "./components/admin/estoque/EstoqueDashboard";
import EstoqueLayout from "./components/admin/estoque/EstoqueLayout";
import TiposEquipamentoAdmin from "./components/admin/estoque/TiposEquipamentoAdmin";

const PaginaNaoEncontrada = () => {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-6">
            <div className="text-center">
                <p className="text-6xl font-bold text-primary">
                    404
                </p>

                <h1 className="mt-4 text-xl font-bold text-foreground">
                    Página não encontrada
                </h1>

                <p className="mt-2 text-sm text-muted-foreground">
                    O endereço informado não existe.
                </p>
            </div>
        </div>
    );
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 4000,
                    }}
                />

                <Routes>
                    <Route
                        path="/"
                        element={
                            <div className="min-h-screen bg-white">
                                <Navbar />
                                <Hero />
                                <Services />
                                <About />
                                <Clients />
                                <Contact />
                            </div>
                        }
                    />

                    <Route
                        path="/login"
                        element={<Login />}
                    />

                    <Route
                        path="/admin/login"
                        element={
                            <Navigate
                                to="/login"
                                replace
                            />
                        }
                    />

                    <Route
                        path="/staff/login"
                        element={
                            <Navigate
                                to="/login"
                                replace
                            />
                        }
                    />

                    <Route
                        path="/admin"
                        element={
                            <ProtectedRoute
                                requireAdmin
                            >
                                <AdminLayout />
                            </ProtectedRoute>
                        }
                    >

                        <Route
                            path="estoque"
                            element={<EstoqueLayout />}
                        >
                            <Route
                                index
                                element={<EstoqueDashboard />}
                            />

                            <Route
                                path="equipamentos"
                                element={<EquipamentosAdmin />}
                            />

                            <Route
                                path="tipos"
                                element={<TiposEquipamentoAdmin />}
                            />

                            <Route
                                path="movimentacoes"
                                element={<MovimentacoesEstoque />}
                            />

                            <Route
                                path="devolvidos"
                                element={<EquipamentosDevolvidos />}
                            />
                        </Route>

                        <Route
                            index
                            element={<AdminHome />}
                        />

                        <Route
                            path="clientes"
                            element={<Clientes />}
                        />

                        <Route
                            path="tecnicos"
                            element={<Tecnicos />}
                        />

                        <Route
                            path="chamados"
                            element={<Chamados />}
                        />

                        <Route
                            path="adiantamentos"
                            element={<AdiantamentosAdmin />}
                        />

                        <Route
                            path="videos"
                            element={
                                <BibliotecaVideos />
                            }
                        />

                        <Route
                            path="usuarios"
                            element={<Usuarios />}
                        />

                        <Route
                            path="perfil"
                            element={<Perfil />}
                        />
                    </Route>

                    <Route
                        path="/staff"
                        element={
                            <ProtectedRoute
                                requireTecnico
                            >
                                <StaffLayout />
                            </ProtectedRoute>
                        }
                    >
                        <Route
                            index
                            element={
                                <Navigate
                                    to="dashboard"
                                    replace
                                />
                            }
                        />

                        <Route
                            path="dashboard"
                            element={
                                <StaffDashboard />
                            }
                        />

                        <Route
                            path="chamados"
                            element={
                                <StaffChamados />
                            }
                        />

                        <Route
                            path="videos"
                            element={
                                <StaffVideos />
                            }
                        />

                        <Route
                            path="adiantamentos"
                            element={
                                <StaffAdiantamentos />
                            }
                        />

                        <Route
                            path="perfil"
                            element={
                                <StaffPerfil />
                            }
                        />
                    </Route>

                    <Route
                        path="*"
                        element={
                            <PaginaNaoEncontrada />
                        }
                    />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;