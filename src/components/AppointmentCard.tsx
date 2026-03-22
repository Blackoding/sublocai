import React, { useCallback, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Appointment } from "@/types";
import Button from "@/components/Button";

interface AppointmentCardProps {
  appointment: Appointment;
  onUpdateStatus?: (
    appointmentId: string,
    newStatus: "pending" | "confirmed" | "cancelled" | "completed",
  ) => void;
  viewerUserType?: "professional" | "company";
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  onUpdateStatus,
  viewerUserType,
}) => {
  const router = useRouter();
  const [isDownloadingReceipt, setIsDownloadingReceipt] = useState(false);
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Pendente";
      case "confirmed":
        return "Confirmado";
      case "cancelled":
        return "Cancelado";
      case "completed":
        return "Concluído";
      default:
        return status;
    }
  };

  const formatDate = (date: string) => {
    try {
      // Se a data já está no formato YYYY-MM-DD, usar diretamente
      if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = date.split("-");
        return `${day}/${month}/${year}`;
      }

      // Caso contrário, tentar converter
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        return date; // Retornar a string original se não conseguir converter
      }

      return dateObj.toLocaleDateString("pt-BR");
    } catch (error) {
      console.error("Erro ao formatar data:", error, "Data original:", date);
      return date; // Retornar a string original em caso de erro
    }
  };

  const formatTime = (time: string) => {
    if (!time) return "N/A";
    return time.substring(0, 5);
  };

  const getDayOfWeek = (date: string) => {
    try {
      const days = [
        "Domingo",
        "Segunda",
        "Terça",
        "Quarta",
        "Quinta",
        "Sexta",
        "Sábado",
      ];

      // Se a data está no formato YYYY-MM-DD, criar Date diretamente
      if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = date.split("-").map(Number);
        const dateObj = new Date(year, month - 1, day); // month é 0-indexed
        return days[dateObj.getDay()];
      }

      // Caso contrário, tentar converter normalmente
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        return "Data inválida";
      }

      return days[dateObj.getDay()];
    } catch (error) {
      console.error(
        "Erro ao obter dia da semana:",
        error,
        "Data original:",
        date,
      );
      return "Data inválida";
    }
  };

  const getUserDisplayName = () => {
    if (!appointment.users) return "Usuário não encontrado";

    if (appointment.users.userType === "company") {
      return (
        appointment.users.companyName ||
        appointment.users.tradeName ||
        "Empresa sem nome"
      );
    } else {
      return appointment.users.fullName || "Profissional sem nome";
    }
  };

  const getUserTypeText = () => {
    if (!appointment.users) return "";
    return appointment.users.userType === "company"
      ? "Empresa"
      : "Profissional";
  };

  const getMainTitle = () => {
    if (viewerUserType === "professional") {
      return (
        appointment.clinic_company_name || appointment.clinic_title || "Espaço"
      );
    }
    return getUserDisplayName();
  };

  const getSubtitle = () => {
    if (viewerUserType === "professional") {
      return `${appointment.clinic_title || "Sala"} • Agendamento #${appointment.id.substring(0, 8)}`;
    }
    return `${getUserTypeText()} • Agendamento #${appointment.id.substring(0, 8)}`;
  };

  const getAppointmentDateStart = (): Date | null => {
    if (!appointment.date || !appointment.date.match(/^\d{4}-\d{2}-\d{2}$/))
      return null;
    const [year, month, day] = appointment.date.split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  const canProfessionalCancel = (): boolean => {
    const appointmentDate = getAppointmentDateStart();
    if (!appointmentDate) return false;
    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    return appointmentDate > todayStart;
  };

  const hasAppointmentDateTimePassed = (): boolean => {
    if (!appointment.date || !appointment.time) return false;
    if (!appointment.date.match(/^\d{4}-\d{2}-\d{2}$/)) return false;
    const [year, month, day] = appointment.date.split("-").map(Number);
    const [hour, minute] = appointment.time.split(":").map(Number);
    if (
      Number.isNaN(year) ||
      Number.isNaN(month) ||
      Number.isNaN(day) ||
      Number.isNaN(hour) ||
      Number.isNaN(minute)
    ) {
      return false;
    }
    const appointmentDateTime = new Date(
      year,
      month - 1,
      day,
      hour,
      minute,
      0,
      0,
    );
    return appointmentDateTime.getTime() <= Date.now();
  };

  const isProfessionalViewer = viewerUserType === "professional";
  const clinicHref = appointment.clinic_id
    ? `/consultorio/${appointment.clinic_id}`
    : "";
  const showConfirmButton =
    !isProfessionalViewer && appointment.status === "pending";
  const showCancelButton = isProfessionalViewer
    ? (appointment.status === "pending" ||
        appointment.status === "confirmed") &&
      canProfessionalCancel()
    : appointment.status === "pending";
  const showCompleteButton =
    isProfessionalViewer &&
    appointment.status === "confirmed" &&
    hasAppointmentDateTimePassed();

  const openChat = () => {
    const draftMessage = `Olá! Sobre o agendamento de ${formatDate(appointment.date)} às ${formatTime(appointment.time)}${appointment.clinic_title ? ` no espaço ${appointment.clinic_title}` : ""}.`;
    router.push({
      pathname: "/chat",
      query: {
        appointmentId: appointment.id,
        draft: draftMessage,
      },
    });
  };

  const formatCurrency = (value: number): string => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const getReceiptStatusText = (status: Appointment["status"]): string => {
    if (status === "confirmed") return "Agendamento confirmado";
    if (status === "completed") return "Agendamento concluído";
    if (status === "pending") return "Agendamento pendente";
    return "Agendamento cancelado";
  };

  const getReceiptMainName = (): string => {
    return getMainTitle();
  };

  const getReceiptFavorecidoName = (): string => {
    return appointment.clinic_company_name || "Não informado";
  };

  const getReceiptFavorecidoCnpj = (): string => {
    return appointment.clinic_cnpj || "Não informado";
  };

  const getReceiptFavorecidoAddress = (): string => {
    return appointment.clinic_address || "Não informado";
  };

  const getReceiptInlineText = (value: string, maxLength: number): string => {
    if (value.length <= maxLength) return value;
    return `${value.slice(0, maxLength - 3)}...`;
  };

  const fetchCompanyDetailsByClinic = async (): Promise<{
    companyName: string;
    cnpj: string;
    address: string;
  } | null> => {
    if (!appointment.clinic_id) return null;
    const response = await fetch("/api/clinics/company-details", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ clinicId: appointment.clinic_id }),
    });

    if (!response.ok) return null;
    const json = (await response.json()) as {
      data?: {
        companyName?: string;
        cnpj?: string;
        address?: string;
      };
    };

    if (!json.data) return null;
    return {
      companyName: json.data.companyName || "",
      cnpj: json.data.cnpj || "",
      address: json.data.address || "",
    };
  };

  const drawRoundedRect = (
    context: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
  ) => {
    context.beginPath();
    context.moveTo(x + radius, y);
    context.lineTo(x + width - radius, y);
    context.quadraticCurveTo(x + width, y, x + width, y + radius);
    context.lineTo(x + width, y + height - radius);
    context.quadraticCurveTo(
      x + width,
      y + height,
      x + width - radius,
      y + height,
    );
    context.lineTo(x + radius, y + height);
    context.quadraticCurveTo(x, y + height, x, y + height - radius);
    context.lineTo(x, y + radius);
    context.quadraticCurveTo(x, y, x + radius, y);
    context.closePath();
  };

  const downloadReceipt = useCallback(async () => {
    if (typeof window === "undefined" || isDownloadingReceipt) return;
    setIsDownloadingReceipt(true);

    try {
      const companyDetails =
        !appointment.clinic_company_name ||
        !appointment.clinic_cnpj ||
        !appointment.clinic_address
          ? await fetchCompanyDetailsByClinic()
          : null;
      const receiptFavorecidoName =
        appointment.clinic_company_name ||
        companyDetails?.companyName ||
        "Não informado";
      const receiptFavorecidoCnpj =
        appointment.clinic_cnpj || companyDetails?.cnpj || "Não informado";
      const receiptFavorecidoAddress =
        appointment.clinic_address ||
        companyDetails?.address ||
        "Não informado";

      const width = 1080;
      const height = 1920;
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");

      if (!context) {
        setIsDownloadingReceipt(false);
        return;
      }

      context.fillStyle = "#f4f7fb";
      context.fillRect(0, 0, width, height);

      const cardX = 72;
      const cardY = 150;
      const cardWidth = width - 144;
      const cardHeight = 1580;

      context.fillStyle = "#ffffff";
      drawRoundedRect(context, cardX, cardY, cardWidth, cardHeight, 34);
      context.fill();

      context.fillStyle = "#2b9af3";
      drawRoundedRect(context, cardX, cardY, cardWidth, 180, 34);
      context.fill();
      context.fillRect(cardX, cardY + 140, cardWidth, 40);

      context.fillStyle = "#ffffff";
      context.font = "bold 46px Arial, sans-serif";
      context.textAlign = "left";
      context.fillText("Comprovante de Agendamento", cardX + 48, cardY + 78);

      context.font = "28px Arial, sans-serif";
      context.fillStyle = "#dff0ff";
      context.fillText("Sublease", cardX + 48, cardY + 126);

      const lineX = cardX + 48;
      const lineWidth = cardWidth - 96;
      let currentY = cardY + 278;

      const writeLine = (
        label: string,
        value: string,
        isHighlight = false,
        highlightColor: string = "#111827",
      ) => {
        context.fillStyle = "#6b7280";
        context.font = "28px Arial, sans-serif";
        context.fillText(label, lineX, currentY);
        context.fillStyle = isHighlight ? highlightColor : "#1f2937";
        context.font = isHighlight
          ? "bold 54px Arial, sans-serif"
          : "bold 34px Arial, sans-serif";
        context.textAlign = "right";
        context.fillText(value, lineX + lineWidth, currentY);
        context.textAlign = "left";
        currentY += isHighlight ? 108 : 86;
      };

      const getWrappedLines = (
        text: string,
        maxWidth: number,
        font: string,
        maxLines: number,
      ): string[] => {
        context.font = font;
        const words = text.split(" ").filter(Boolean);
        const lines: string[] = [];
        let currentLine = "";

        for (const word of words) {
          const candidate = currentLine ? `${currentLine} ${word}` : word;
          if (context.measureText(candidate).width <= maxWidth) {
            currentLine = candidate;
            continue;
          }

          if (currentLine) lines.push(currentLine);
          currentLine = word;
          if (lines.length === maxLines - 1) break;
        }

        if (currentLine && lines.length < maxLines) {
          lines.push(currentLine);
        }

        if (lines.length === 0) return [text];

        const consumedWords = lines.join(" ").split(" ").length;
        if (consumedWords < words.length) {
          const lastIndex = lines.length - 1;
          let lastLine = lines[lastIndex];
          while (
            context.measureText(`${lastLine}...`).width > maxWidth &&
            lastLine.length > 0
          ) {
            lastLine = lastLine.slice(0, -1).trimEnd();
          }
          lines[lastIndex] = `${lastLine}...`;
        }

        return lines;
      };

      const writeMultilineRightValue = (
        label: string,
        value: string,
        maxLines = 2,
      ) => {
        context.fillStyle = "#6b7280";
        context.font = "28px Arial, sans-serif";
        context.fillText(label, lineX, currentY);

        const valueFont = "bold 34px Arial, sans-serif";
        const valueColumnX = lineX + lineWidth * 0.5;
        const maxValueWidth = lineX + lineWidth - valueColumnX;
        const lines = getWrappedLines(
          value,
          maxValueWidth,
          valueFont,
          maxLines,
        );
        const lineHeight = 42;
        const startY = currentY - (lines.length - 1) * (lineHeight / 2);

        context.fillStyle = "#1f2937";
        context.font = valueFont;
        context.textAlign = "right";
        lines.forEach((line, index) => {
          context.fillText(
            line,
            lineX + lineWidth,
            startY + index * lineHeight,
          );
        });
        context.textAlign = "left";
        currentY += 86 + (lines.length - 1) * 46;
      };

      writeLine("Valor", formatCurrency(appointment.value), true);
      writeLine(
        "Data",
        `${formatDate(appointment.date)} (${getDayOfWeek(appointment.date)})`,
      );
      writeLine("Horário", formatTime(appointment.time));
      writeLine("Sala", appointment.clinic_title || "Não informada");
      writeLine("CNPJ favorecido", receiptFavorecidoCnpj);
      writeMultilineRightValue("Nome favorecido", receiptFavorecidoName);
      writeMultilineRightValue(
        "Endereço favorecido",
        receiptFavorecidoAddress,
        3,
      );
      writeLine(
        "ID da transação",
        `SUB-${appointment.id.substring(0, 8).toUpperCase()}`,
      );

      context.fillStyle = "#6b7280";
      context.font = "28px Arial, sans-serif";
      context.fillText("Status", lineX, currentY);

      const statusText = getReceiptStatusText(appointment.status);
      context.font = "bold 26px Arial, sans-serif";
      const statusMetrics = context.measureText(statusText);
      const badgeWidth = Math.max(220, statusMetrics.width + 56);
      const badgeHeight = 54;
      const badgeX = lineX + lineWidth - badgeWidth;
      const badgeY = currentY - 36;

      context.fillStyle = "#dcfce7";
      drawRoundedRect(context, badgeX, badgeY, badgeWidth, badgeHeight, 22);
      context.fill();

      context.fillStyle = "#15803d";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText(
        statusText,
        badgeX + badgeWidth / 2,
        badgeY + badgeHeight / 2,
      );
      context.textAlign = "left";
      context.textBaseline = "alphabetic";
      currentY += 86;

      context.strokeStyle = "#e5e7eb";
      context.lineWidth = 2;
      context.beginPath();
      context.moveTo(lineX, currentY + 12);
      context.lineTo(lineX + lineWidth, currentY + 12);
      context.stroke();

      currentY += 84;

      context.fillStyle = "#9ca3af";
      context.font = "24px Arial, sans-serif";
      context.textAlign = "center";
      context.fillText(
        "Comprovante emitido por Sublease",
        width / 2,
        height - 84,
      );

      const safeDate = appointment.date.replace(/-/g, "");
      const link = document.createElement("a");
      link.download = `comprovante-agendamento-${appointment.id.substring(0, 8)}-${safeDate}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } finally {
      setIsDownloadingReceipt(false);
    }
  }, [appointment, isDownloadingReceipt]);

  return (
    <div className="p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div>
              {isProfessionalViewer && clinicHref ? (
                <>
                  <Link
                    href={clinicHref}
                    className="text-lg font-medium text-gray-900 hover:text-[#2b9af3] transition-colors"
                  >
                    {getMainTitle()}
                  </Link>
                  <p className="text-sm text-gray-500">
                    <Link
                      href={clinicHref}
                      className="hover:text-[#2b9af3] transition-colors"
                    >
                      {getSubtitle()}
                    </Link>
                  </p>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-medium text-gray-900">
                    {getMainTitle()}
                  </h3>
                  <p className="text-sm text-gray-500">{getSubtitle()}</p>
                </>
              )}
            </div>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}
            >
              {getStatusText(appointment.status)}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <span className="font-medium">Data:</span>{" "}
              {formatDate(appointment.date)} ({getDayOfWeek(appointment.date)})
            </div>
            <div>
              <span className="font-medium">Horário:</span>{" "}
              {formatTime(appointment.time)}
            </div>
          </div>

          <div className="mt-2 text-sm text-gray-600">
            <span className="font-medium">Valor:</span> R${" "}
            {appointment.value.toFixed(2)}
          </div>

          {appointment.notes && (
            <div className="mt-2 text-sm text-gray-600">
              <span className="font-medium">Observações:</span>{" "}
              {appointment.notes}
            </div>
          )}
        </div>

        <div className="mt-4 lg:mt-0 lg:ml-6">
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              onClick={openChat}
              className="bg-[#2b9af3] hover:bg-[#1e7ce6] text-white border-[#2b9af3] hover:border-[#1e7ce6]"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 10h8M8 14h5m8 6-3.464-1.732A9.953 9.953 0 0112 19c-4.97 0-9-3.582-9-8s4.03-8 9-8 9 3.582 9 8a7.948 7.948 0 01-2.138 5.357L21 20z"
                />
              </svg>
              Enviar Mensagem
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={downloadReceipt}
              disabled={isDownloadingReceipt}
              className="text-[#2b9af3] border-[#2b9af3]"
            >
              {isDownloadingReceipt ? "Gerando..." : "Baixar Comprovante"}
            </Button>

            {showConfirmButton && (
              <Button
                size="sm"
                onClick={() => onUpdateStatus?.(appointment.id, "confirmed")}
              >
                Confirmar
              </Button>
            )}

            {showCancelButton && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onUpdateStatus?.(appointment.id, "cancelled")}
                className="text-red-600 hover:text-red-700 hover:border-red-300"
              >
                Cancelar
              </Button>
            )}

            {showCompleteButton && (
              <Button
                size="sm"
                onClick={() => onUpdateStatus?.(appointment.id, "completed")}
              >
                Marcar como Concluído
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentCard;
