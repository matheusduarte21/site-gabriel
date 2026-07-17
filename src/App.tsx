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
import LoginAdmin from "./components/admin/LoginAdmin";
import Perfil from "./components/admin/Perfil";
import StaffLogin from "./components/staff/StaffLogin";
import StaffLayout from "./components/staff/StaffLayout";
import StaffDashboard from "./components/staff/StaffDashboard";
import StaffChamados from "./components/staff/StaffChamados";
import StaffAdiantamentos from "./components/staff/StaffAdiantamentos";
import StaffPerfil from "./components/staff/StaffPerfil";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import Chamados from "./components/admin/ChamadosTemp.";
import StaffVideos from "./components/staff/StaffVideos";
import BibliotecaVideos from "./components/admin/BibliotecaVideos/BibliotecaVideos";

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
                        path="/admin/login"
                        element={<LoginAdmin />}
                    />

                    <Route
                        path="/staff/login"
                        element={<StaffLogin />}
                    />

                    <Route
                        path="/admin"
                        element={
                            <ProtectedRoute requireAdmin>
                                <AdminLayout />
                            </ProtectedRoute>
                        }
                    >
                        <Route
                            index
                            element={<AdminHome />}
                        />

                        <Route
                            path="videos"
                            element={<BibliotecaVideos />}
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
                            <ProtectedRoute requireTecnico>
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
                            path="adiantamentos"
                            element={
                                <StaffAdiantamentos />
                            }
                        />

                        <Route
                            path="perfil"
                            element={<StaffPerfil />}
                        />

                        <Route
                            path="videos"
                            element={<StaffVideos />}
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