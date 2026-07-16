import ExcelJS from "exceljs";

export type PeriodoRelatorio = string | "todos";

export const converterNumero = (
    valor: number | string | null | undefined
): number => {
    if (
        valor === null ||
        valor === undefined ||
        valor === ""
    ) {
        return 0;
    }

    if (typeof valor === "number") {
        return Number.isFinite(valor) ? valor : 0;
    }

    const valorNormalizado = valor
        .trim()
        .replace(/\s/g, "")
        .replace(/\.(?=\d{3}(?:\D|$))/g, "")
        .replace(",", ".");

    const numero = Number(valorNormalizado);

    return Number.isFinite(numero) ? numero : 0;
};

export const converterDataExcel = (
    valor: string | null | undefined
): Date | null => {
    if (!valor) {
        return null;
    }

    const dataSemHorario = valor.split("T")[0];
    const partes = dataSemHorario.split("-");

    if (partes.length !== 3) {
        return null;
    }

    const [ano, mes, dia] = partes.map(Number);

    if (!ano || !mes || !dia) {
        return null;
    }

    return new Date(ano, mes - 1, dia);
};

export const formatarPeriodoRelatorio = (
    periodo: PeriodoRelatorio
): string => {
    if (periodo === "todos") {
        return "Todos os períodos";
    }

    const [ano, mes] = periodo.split("-").map(Number);

    const data = new Date(ano, mes - 1, 1);

    const texto = new Intl.DateTimeFormat("pt-BR", {
        month: "long",
        year: "numeric",
    }).format(data);

    return texto.charAt(0).toUpperCase() + texto.slice(1);
};

export const nomePeriodoArquivo = (
    periodo: PeriodoRelatorio
): string => {
    return periodo === "todos" ? "Todos_Periodos" : periodo;
};

export const sanitizarNomeArquivo = (
    nome: string
): string => {
    return nome
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[<>:"/\\|?*]/g, "")
        .replace(/\s+/g, "_")
        .replace(/_+/g, "_");
};

export const aplicarTituloPlanilha = (
    worksheet: ExcelJS.Worksheet,
    titulo: string,
    subtitulo: string,
    totalColunas: number
) => {
    const ultimaColuna =
        worksheet.getColumn(totalColunas).letter;

    worksheet.mergeCells(`A1:${ultimaColuna}1`);
    worksheet.mergeCells(`A2:${ultimaColuna}2`);

    const tituloCell = worksheet.getCell("A1");
    const subtituloCell = worksheet.getCell("A2");

    tituloCell.value = titulo;
    subtituloCell.value = subtitulo;

    tituloCell.font = {
        bold: true,
        size: 18,
        color: {
            argb: "FFFFFFFF",
        },
    };

    tituloCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: {
            argb: "FF073B4C",
        },
    };

    tituloCell.alignment = {
        vertical: "middle",
        horizontal: "left",
    };

    subtituloCell.font = {
        size: 11,
        color: {
            argb: "FF475569",
        },
    };

    subtituloCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: {
            argb: "FFEFF6FF",
        },
    };

    subtituloCell.alignment = {
        vertical: "middle",
        horizontal: "left",
    };

    worksheet.getRow(1).height = 30;
    worksheet.getRow(2).height = 22;
};

export const aplicarCabecalhoTabela = (
    worksheet: ExcelJS.Worksheet,
    linhaCabecalho: number,
    colunas: string[]
) => {
    const row = worksheet.getRow(linhaCabecalho);

    row.values = colunas;
    row.height = 26;

    row.eachCell({
        includeEmpty: true,
    }, (cell:any) => {
        cell.font = {
            bold: true,
            size: 10,
            color: {
                argb: "FFFFFFFF",
            },
        };

        cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: {
                argb: "FF2563EB",
            },
        };

        cell.alignment = {
            vertical: "middle",
            horizontal: "center",
            wrapText: true,
        };

        cell.border = {
            top: {
                style: "thin",
                color: {
                    argb: "FFCBD5E1",
                },
            },
            left: {
                style: "thin",
                color: {
                    argb: "FFCBD5E1",
                },
            },
            bottom: {
                style: "thin",
                color: {
                    argb: "FFCBD5E1",
                },
            },
            right: {
                style: "thin",
                color: {
                    argb: "FFCBD5E1",
                },
            },
        };
    });
};

export const configurarTabelaExcel = (
    worksheet: ExcelJS.Worksheet,
    linhaCabecalho: number,
    totalColunas: number
) => {
    worksheet.views = [
        {
            state: "frozen",
            ySplit: linhaCabecalho,
        },
    ];

    worksheet.autoFilter = {
        from: {
            row: linhaCabecalho,
            column: 1,
        },
        to: {
            row: linhaCabecalho,
            column: totalColunas,
        },
    };

    worksheet.pageSetup = {
        orientation: "landscape",
        fitToPage: true,
        fitToWidth: 1,
        fitToHeight: 0,
        paperSize: 9,
        margins: {
            left: 0.3,
            right: 0.3,
            top: 0.5,
            bottom: 0.5,
            header: 0.2,
            footer: 0.2,
        },
    };
};

export const aplicarBordasTabela = (
    worksheet: ExcelJS.Worksheet,
    linhaInicial: number
) => {
    for (
        let numeroLinha = linhaInicial;
        numeroLinha <= worksheet.rowCount;
        numeroLinha += 1
    ) {
        const row = worksheet.getRow(numeroLinha);

        row.eachCell({
            includeEmpty: true,
        }, (cell:any) => {
            cell.border = {
                top: {
                    style: "thin",
                    color: {
                        argb: "FFE2E8F0",
                    },
                },
                left: {
                    style: "thin",
                    color: {
                        argb: "FFE2E8F0",
                    },
                },
                bottom: {
                    style: "thin",
                    color: {
                        argb: "FFE2E8F0",
                    },
                },
                right: {
                    style: "thin",
                    color: {
                        argb: "FFE2E8F0",
                    },
                },
            };

            cell.alignment = {
                vertical: "middle",
                wrapText: true,
            };
        });

        if (numeroLinha % 2 === 0) {
            row.eachCell({
                includeEmpty: true,
            }, (cell:any) => {
                if (!cell.fill || cell.fill.type !== "pattern") {
                    cell.fill = {
                        type: "pattern",
                        pattern: "solid",
                        fgColor: {
                            argb: "FFF8FAFC",
                        },
                    };
                }
            });
        }
    }
};

export const ajustarLargurasColunas = (
    worksheet: ExcelJS.Worksheet,
    linhaCabecalho = 4
) => {
    for (
        let numeroColuna = 1;
        numeroColuna <= worksheet.columnCount;
        numeroColuna += 1
    ) {
        const column =
            worksheet.getColumn(numeroColuna);

        let maiorTamanho = 10;

        for (
            let numeroLinha = linhaCabecalho;
            numeroLinha <= worksheet.rowCount;
            numeroLinha += 1
        ) {
            const valor =
                worksheet.getCell(
                    numeroLinha,
                    numeroColuna
                ).value;

            let texto = "";

            if (valor instanceof Date) {
                texto = "00/00/0000";
            } else if (
                typeof valor === "object" &&
                valor !== null &&
                "text" in valor
            ) {
                texto = String(
                    (
                        valor as {
                            text?: string;
                        }
                    ).text ?? ""
                );
            } else {
                texto = String(valor ?? "");
            }

            maiorTamanho = Math.max(
                maiorTamanho,
                texto.length
            );
        }

        column.width = Math.min(
            Math.max(maiorTamanho + 2, 12),
            45
        );
    }
};

export const aplicarFormatoMoeda = (
    worksheet: ExcelJS.Worksheet,
    colunas: number[]
) => {
    colunas.forEach((numeroColuna) => {
        (worksheet.getColumn(numeroColuna) as any).numFmt =
            'R$ #,##0.00;[Red]-R$ #,##0.00';
    });
};

export const aplicarFormatoPercentual = (
    worksheet: ExcelJS.Worksheet,
    colunas: number[]
) => {
    colunas.forEach((numeroColuna) => {
        (worksheet.getColumn(numeroColuna) as any).numFmt =
            "0.00%";
    });
};

export const aplicarFormatoData = (
    worksheet: ExcelJS.Worksheet,
    colunas: number[]
) => {
    colunas.forEach((numeroColuna) => {
        (worksheet.getColumn(numeroColuna) as any).numFmt =
            "dd/mm/yyyy";
    });
};

export const baixarWorkbook = async (
    workbook: ExcelJS.Workbook,
    nomeArquivo: string
) => {
    const buffer =
        await workbook.xlsx.writeBuffer();

    const blob = new Blob(
        [buffer as unknown as BlobPart],
        {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = `${sanitizarNomeArquivo(
        nomeArquivo
    )}.xlsx`;

    document.body.appendChild(link);

    link.click();
    link.remove();

    window.setTimeout(() => {
        URL.revokeObjectURL(url);
    }, 1000);
};