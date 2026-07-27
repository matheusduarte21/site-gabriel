import {
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { Button } from "../../ui/Button";

interface EstoquePaginacaoProps {
    paginaAtual: number;
    totalPaginas: number;
    totalResultados: number;
    limite: number;
    onChange: (pagina: number) => void;
}

const EstoquePaginacao = ({
    paginaAtual,
    totalPaginas,
    totalResultados,
    limite,
    onChange,
}: EstoquePaginacaoProps) => {
    if (totalResultados === 0) {
        return null;
    }

    const inicio =
        (paginaAtual - 1) * limite + 1;

    const fim = Math.min(
        paginaAtual * limite,
        totalResultados
    );

    return (
        <div className="mt-5 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm text-muted-foreground">
                Mostrando{" "}
                <span className="font-medium text-foreground">
                    {inicio}
                </span>{" "}
                a{" "}
                <span className="font-medium text-foreground">
                    {fim}
                </span>{" "}
                de{" "}
                <span className="font-medium text-foreground">
                    {totalResultados}
                </span>{" "}
                resultados
            </span>

            <div className="flex flex-wrap items-center gap-1.5">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={paginaAtual === 1}
                    onClick={() =>
                        onChange(
                            Math.max(
                                1,
                                paginaAtual - 1
                            )
                        )
                    }
                    className="h-8 w-8 rounded-lg p-0"
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>

                {Array.from(
                    {
                        length: Math.max(
                            totalPaginas,
                            1
                        ),
                    },
                    (_, index) => index + 1
                ).map((pagina) => (
                    <Button
                        key={pagina}
                        type="button"
                        variant={
                            pagina === paginaAtual
                                ? "default"
                                : "outline"
                        }
                        size="sm"
                        onClick={() =>
                            onChange(pagina)
                        }
                        className="h-8 w-8 rounded-lg p-0 text-xs"
                    >
                        {pagina}
                    </Button>
                ))}

                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={
                        paginaAtual >=
                        totalPaginas
                    }
                    onClick={() =>
                        onChange(
                            Math.min(
                                totalPaginas,
                                paginaAtual + 1
                            )
                        )
                    }
                    className="h-8 w-8 rounded-lg p-0"
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
};

export default EstoquePaginacao;
