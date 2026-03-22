import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Modal from "@/components/Modal";
import UserTypeSelector from "@/components/UserTypeSelector";
import Select from "@/components/Select";
import {
  SPECIALTIES,
  getSpecialtyRegistrationCode,
  isSpecialtyRegistrationRequired,
} from "@/constants/specialties";
import { isValidCPF, isValidCNPJ } from "@/lib/validation";
import { useAuthStore } from "@/stores/authStore";
import { useToastStore } from "@/stores/toastStore";

type PaymentMethod = "pix" | "card";

const CadastrarPage = () => {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const showToast = useToastStore((state) => state.showToast);
  const [formData, setFormData] = useState({
    // Campos comuns
    email: "",
    telefone: "",
    senha: "",
    confirmarSenha: "",
    tipoUsuario: "professional" as "professional" | "company" | null,

    // Campos específicos para profissional
    nomeCompleto: "",
    cpf: "",
    dataNascimento: "",
    especialidade: "",
    crm: "",

    // Campos específicos para empresa
    razaoSocial: "",
    nomeFantasia: "",
    cnpj: "",
    responsavel: "",
    cpfResponsavel: "",
    planoEmpresa: "basic" as "free" | "basic" | "pro",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showEmailConfirmationModal, setShowEmailConfirmationModal] =
    useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentPlan, setPaymentPlan] = useState<"basic" | "pro" | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [activePaymentMethod, setActivePaymentMethod] =
    useState<PaymentMethod | null>(null);
  const [isLoadingPix, setIsLoadingPix] = useState(false);
  const [isLoadingCardCheckout, setIsLoadingCardCheckout] = useState(false);
  const [pixCode, setPixCode] = useState("");
  const [pixQrSrc, setPixQrSrc] = useState("");
  const [pixExpiresAt, setPixExpiresAt] = useState("");
  const [createdUserId, setCreatedUserId] = useState<string | null>(null);

  // Refs para os campos do formulário
  const fieldRefs = {
    // Campos comuns
    email: useRef<HTMLInputElement>(null),
    telefone: useRef<HTMLInputElement>(null),
    senha: useRef<HTMLInputElement>(null),
    confirmarSenha: useRef<HTMLInputElement>(null),

    // Campos específicos para profissional
    nomeCompleto: useRef<HTMLInputElement>(null),
    cpf: useRef<HTMLInputElement>(null),
    dataNascimento: useRef<HTMLInputElement>(null),
    crm: useRef<HTMLInputElement>(null),

    // Campos específicos para empresa
    razaoSocial: useRef<HTMLInputElement>(null),
    nomeFantasia: useRef<HTMLInputElement>(null),
    cnpj: useRef<HTMLInputElement>(null),
    responsavel: useRef<HTMLInputElement>(null),
    cpfResponsavel: useRef<HTMLInputElement>(null),
  };

  // Clear errors when user starts typing
  useEffect(() => {
    if (error) {
      setError(null);
    }
  }, [formData]);

  // Função de validação de CPF para uso em tempo real
  const validateCPF = (cpf: string): string | null => {
    if (!cpf.trim()) {
      return null; // Não mostra erro se estiver vazio (será validado no submit)
    }

    const cpfNumbers = cpf.replace(/\D/g, "");
    if (cpfNumbers.length < 11) {
      return "CPF deve ter 11 dígitos";
    }

    if (!isValidCPF(cpf)) {
      return "CPF inválido";
    }

    return null; // CPF válido
  };

  // Função de validação de CNPJ para uso em tempo real
  const validateCNPJ = (cnpj: string): string | null => {
    if (!cnpj.trim()) {
      return null; // Não mostra erro se estiver vazio (será validado no submit)
    }

    const cnpjNumbers = cnpj.replace(/\D/g, "");
    if (cnpjNumbers.length < 14) {
      return "CNPJ deve ter 14 dígitos";
    }

    if (!isValidCNPJ(cnpj)) {
      return "CNPJ inválido";
    }

    return null; // CNPJ válido
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validação do tipo de usuário
    if (!formData.tipoUsuario) {
      newErrors.tipoUsuario = "Selecione o tipo de conta";
    }

    // Validações específicas para profissional
    if (formData.tipoUsuario === "professional") {
      // Nome completo
      if (!formData.nomeCompleto.trim()) {
        newErrors.nomeCompleto = "Nome completo é obrigatório";
      } else if (formData.nomeCompleto.trim().length < 2) {
        newErrors.nomeCompleto = "Nome deve ter pelo menos 2 caracteres";
      }

      // CPF
      if (!formData.cpf.trim()) {
        newErrors.cpf = "CPF é obrigatório";
      } else if (!isValidCPF(formData.cpf)) {
        newErrors.cpf = "CPF inválido";
      }

      // Data de nascimento
      if (!formData.dataNascimento.trim()) {
        newErrors.dataNascimento = "Data de nascimento é obrigatória";
      } else {
        const birthDate = new Date(formData.dataNascimento);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        if (age < 18) {
          newErrors.dataNascimento = "Você deve ter pelo menos 18 anos";
        }
      }

      // Especialidade
      if (!formData.especialidade.trim()) {
        newErrors.especialidade = "Categoria é obrigatória";
      }

      if (
        formData.especialidade &&
        isSpecialtyRegistrationRequired(formData.especialidade)
      ) {
        if (!formData.crm.trim()) {
          const registrationCode = getSpecialtyRegistrationCode(
            formData.especialidade,
          );
          newErrors.crm = `${registrationCode} é obrigatório`;
        } else if (formData.crm.trim().length < 4) {
          const registrationCode = getSpecialtyRegistrationCode(
            formData.especialidade,
          );
          newErrors.crm = `${registrationCode} deve ter pelo menos 4 caracteres`;
        }
      }
    }

    // Validações específicas para empresa
    if (formData.tipoUsuario === "company") {
      if (!formData.planoEmpresa) {
        newErrors.planoEmpresa = "Selecione um plano para sua empresa";
      }

      // Razão Social
      if (!formData.razaoSocial.trim()) {
        newErrors.razaoSocial = "Razão social é obrigatória";
      } else if (formData.razaoSocial.trim().length < 2) {
        newErrors.razaoSocial = "Razão social deve ter pelo menos 2 caracteres";
      }

      // Nome Fantasia
      if (!formData.nomeFantasia.trim()) {
        newErrors.nomeFantasia = "Nome fantasia é obrigatório";
      } else if (formData.nomeFantasia.trim().length < 2) {
        newErrors.nomeFantasia =
          "Nome fantasia deve ter pelo menos 2 caracteres";
      }

      // CNPJ
      if (!formData.cnpj.trim()) {
        newErrors.cnpj = "CNPJ é obrigatório";
      } else if (!isValidCNPJ(formData.cnpj)) {
        newErrors.cnpj = "CNPJ inválido";
      }

      // Responsável
      if (!formData.responsavel.trim()) {
        newErrors.responsavel = "Nome do responsável é obrigatório";
      } else if (formData.responsavel.trim().length < 2) {
        newErrors.responsavel =
          "Nome do responsável deve ter pelo menos 2 caracteres";
      }

      // CPF do Responsável
      if (!formData.cpfResponsavel.trim()) {
        newErrors.cpfResponsavel = "CPF do responsável é obrigatório";
      } else if (!isValidCPF(formData.cpfResponsavel)) {
        newErrors.cpfResponsavel = "CPF inválido";
      }
    }

    // Validação do email (comum para ambos)
    if (!formData.email.trim()) {
      newErrors.email = "Email é obrigatório";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Formato de email inválido";
    }

    // Validação do telefone (comum para ambos)
    if (!formData.telefone.trim()) {
      newErrors.telefone = "Telefone é obrigatório";
    } else {
      const phoneNumbers = formData.telefone.replace(/\D/g, "");
      if (phoneNumbers.length < 10 || phoneNumbers.length > 11) {
        newErrors.telefone = "Telefone deve ter 10 ou 11 dígitos";
      }
    }

    // Validação da senha (comum para ambos)
    if (!formData.senha.trim()) {
      newErrors.senha = "Senha é obrigatória";
    } else if (formData.senha.length < 6) {
      newErrors.senha = "Senha deve ter pelo menos 6 caracteres";
    }

    // Validação da confirmação de senha (comum para ambos)
    if (!formData.confirmarSenha.trim()) {
      newErrors.confirmarSenha = "Confirmação de senha é obrigatória";
    } else if (formData.senha !== formData.confirmarSenha) {
      newErrors.confirmarSenha = "Senhas não coincidem";
    }

    setErrors(newErrors);

    // Se há erros, fazer scroll para o primeiro campo com erro
    if (Object.keys(newErrors).length > 0) {
      const firstErrorField = Object.keys(
        newErrors,
      )[0] as keyof typeof fieldRefs;
      const fieldRef = fieldRefs[firstErrorField];

      if (fieldRef?.current) {
        // Aguardar um pouco para garantir que o estado foi atualizado
        setTimeout(() => {
          fieldRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
          fieldRef.current?.focus();
        }, 100);
      }
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    setShowTermsModal(true);
  };

  const handleConfirmRegistration = async () => {
    console.log("🚀 handleConfirmRegistration iniciado");
    setShowTermsModal(false);
    setIsLoading(true);
    setError(null);

    try {
      console.log("📝 Dados do formulário:", formData);

      // Importar o authUtils dinamicamente
      const { authUtils } = await import("@/services/authService");
      console.log("✅ authUtils importado com sucesso");

      // Preparar dados baseados no tipo de usuário
      const signUpData = {
        email: formData.email,
        phone: formData.telefone,
        password: formData.senha,
        userType: formData.tipoUsuario as "professional" | "company",
        ...(formData.tipoUsuario === "professional"
          ? {
              fullName: formData.nomeCompleto,
              cpf: formData.cpf,
              birthDate: formData.dataNascimento,
              specialty: formData.especialidade,
              registrationCode: formData.crm || undefined,
            }
          : {
              companyName: formData.razaoSocial,
              tradeName: formData.nomeFantasia,
              cnpj: formData.cnpj,
              responsibleName: formData.responsavel,
              responsibleCpf: formData.cpfResponsavel,
              planEmpresa: formData.planoEmpresa,
            }),
      };

      const { user, error: authError } = await authUtils.signUp(signUpData);

      console.log("📧 Resultado do signUp:", { user, authError });

      if (authError || !user) {
        console.error("❌ Erro no cadastro:", authError);
        setError(`Erro ao criar conta: ${authError || "Erro desconhecido"}`);
        setErrors({
          email: "Erro ao criar conta. Tente novamente.",
          senha: "Erro ao criar conta. Tente novamente.",
        });
      } else {
        console.log("✅ Cadastro bem-sucedido:", user);
        const selectedPlan =
          formData.tipoUsuario === "company" &&
          (formData.planoEmpresa === "basic" || formData.planoEmpresa === "pro")
            ? formData.planoEmpresa
            : null;

        setCreatedUserId(user.id);

        if (selectedPlan) {
          setPaymentError(null);
          setPaymentPlan(selectedPlan);
          setShowPaymentModal(true);
          setShowEmailConfirmationModal(false);
        } else {
          setShowEmailConfirmationModal(true);
        }
      }
    } catch (error) {
      console.error("💥 Erro inesperado no handleConfirmRegistration:", error);
      setError(
        `Erro ao criar conta: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
      );
      setErrors({
        email: "Erro ao criar conta. Tente novamente.",
        senha: "Erro ao criar conta. Tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelRegistration = () => {
    setShowTermsModal(false);
  };

  const handleEmailConfirmationClose = () => {
    setShowEmailConfirmationModal(false);
    router.push("/entrar");
  };

  const resetPaymentFlow = useCallback(() => {
    setActivePaymentMethod(null);
    setPaymentError(null);
    setIsLoadingPix(false);
    setIsLoadingCardCheckout(false);
    setPixCode("");
    setPixQrSrc("");
    setPixExpiresAt("");
  }, []);

  const createAbacatePayment = useCallback(
    async (method: PaymentMethod) => {
      if (!paymentPlan) throw new Error("Plano não selecionado");
      const response = await fetch("/api/payments/abacate/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plan: paymentPlan,
          method,
          userId: createdUserId || user?.id || undefined,
        }),
      });

      const json = (await response.json()) as {
        data?:
          | {
              method: "card";
              checkoutUrl: string;
            }
          | {
              method: "pix";
              pixQrCodeId: string;
              brCode: string;
              brCodeBase64: string;
              expiresAt?: string;
            };
        error?: string;
      };

      if (!response.ok || !json.data) {
        throw new Error(json.error || "Falha ao gerar pagamento");
      }

      return json.data;
    },
    [paymentPlan, createdUserId, user?.id],
  );

  const handleCopyPixCode = useCallback(async () => {
    if (!pixCode) return;
    try {
      await navigator.clipboard.writeText(pixCode);
      showToast("Código Pix copiado com sucesso!", "success");
    } catch {
      showToast("Não foi possível copiar o código Pix.", "error");
    }
  }, [pixCode, showToast]);

  const openPaymentCheckout = useCallback(
    async (method: PaymentMethod) => {
      if (!paymentPlan) return;
      setPaymentError(null);
      setPixCode("");
      setPixQrSrc("");
      setPixExpiresAt("");

      if (method === "pix") {
        setActivePaymentMethod("pix");
        setIsLoadingPix(true);
      } else {
        setActivePaymentMethod("card");
        setIsLoadingCardCheckout(true);
      }

      try {
        const data = await createAbacatePayment(method);
        if (method === "pix") {
          if (data.method !== "pix")
            throw new Error("Resposta inválida para PIX");
          setPixCode(data.brCode);
          setPixQrSrc(data.brCodeBase64);
          setPixExpiresAt(data.expiresAt || "");
          setIsLoadingPix(false);
          return;
        }

        if (data.method !== "card")
          throw new Error("Resposta inválida para cartão");
        window.location.href = data.checkoutUrl;
      } catch (error) {
        setPaymentError(
          error instanceof Error ? error.message : "Falha ao gerar pagamento",
        );
      } finally {
        setIsLoadingPix(false);
        setIsLoadingCardCheckout(false);
      }
    },
    [createAbacatePayment, paymentPlan],
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header da página */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Criar Conta</h1>
          <p className="text-gray-600">
            Preencha os dados abaixo para criar sua conta
          </p>
        </div>

        {/* Seletor de Tipo de Usuário */}
        <div className="bg-white rounded-3xl shadow-md p-8 mb-6">
          <UserTypeSelector
            selectedType={formData.tipoUsuario}
            onTypeChange={(type) => handleInputChange("tipoUsuario", type)}
            error={errors.tipoUsuario}
          />
        </div>

        {/* Formulário */}
        <div className="bg-white rounded-3xl shadow-md p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campos específicos para Profissional */}
            {formData.tipoUsuario === "professional" && (
              <>
                {/* Seção de Dados Pessoais */}
                <div className="border-b border-gray-200 pb-4 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Dados Pessoais
                  </h3>
                  <p className="text-sm text-gray-600">
                    Suas informações pessoais
                  </p>
                </div>

                <Input
                  ref={fieldRefs.nomeCompleto}
                  label="Nome completo"
                  value={formData.nomeCompleto}
                  onChange={(value) => handleInputChange("nomeCompleto", value)}
                  placeholder="Seu nome completo"
                  required
                />
                {errors.nomeCompleto && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.nomeCompleto}
                  </p>
                )}

                <Input
                  ref={fieldRefs.cpf}
                  label="CPF"
                  value={formData.cpf}
                  onChange={(value) => handleInputChange("cpf", value)}
                  placeholder="000.000.000-00"
                  mask="cpf"
                  required
                  validate={validateCPF}
                  showValidationError={true}
                />
                {errors.cpf && (
                  <p className="text-red-500 text-sm mt-1">{errors.cpf}</p>
                )}

                <Input
                  ref={fieldRefs.dataNascimento}
                  label="Data de nascimento"
                  type="date"
                  value={formData.dataNascimento}
                  onChange={(value) =>
                    handleInputChange("dataNascimento", value)
                  }
                  required
                />
                {errors.dataNascimento && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.dataNascimento}
                  </p>
                )}

                {/* Seção de Registro Profissional */}
                <div className="border-t border-gray-200 pt-6 mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Registro Profissional
                  </h3>
                </div>

                <Select
                  label="Categoria"
                  options={SPECIALTIES}
                  value={formData.especialidade}
                  onChange={(value) =>
                    handleInputChange("especialidade", value)
                  }
                  placeholder="Selecione sua categoria"
                />
                {errors.especialidade && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.especialidade}
                  </p>
                )}

                {/* Input de registro profissional - só aparece quando especialidade for selecionada */}
                {formData.especialidade &&
                  isSpecialtyRegistrationRequired(formData.especialidade) && (
                    <Input
                      ref={fieldRefs.crm}
                      label={`${getSpecialtyRegistrationCode(formData.especialidade)}`}
                      value={formData.crm}
                      onChange={(value) => handleInputChange("crm", value)}
                      placeholder={`Seu número de ${getSpecialtyRegistrationCode(formData.especialidade)}`}
                      required
                    />
                  )}
                {errors.crm && (
                  <p className="text-red-500 text-sm mt-1">{errors.crm}</p>
                )}
              </>
            )}

            {/* Campos específicos para Empresa */}
            {formData.tipoUsuario === "company" && (
              <>
                <div className="border-b border-gray-200 pb-4 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Dados da Empresa
                  </h3>
                  <p className="text-sm text-gray-600">
                    Informações da sua clínica ou instituição
                  </p>
                </div>

                <div className="border-t border-gray-200 pt-6 mt-6">
                  <h4 className="text-md font-semibold text-gray-900 mb-4">
                    Plano para Empresa
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          planoEmpresa: "free",
                        }))
                      }
                      className={`p-4 rounded-2xl border transition-colors text-left ${
                        formData.planoEmpresa === "free"
                          ? "border-[#2b9af3] bg-blue-50"
                          : "border-gray-200 bg-white hover:bg-gray-50"
                      }`}
                    >
                      <div className="text-sm text-gray-500">Gratuito</div>
                      <div className="text-2xl font-bold text-gray-900 mt-1">
                        R$0
                      </div>
                      <div className="text-xs text-gray-500 mt-1">/mês</div>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          planoEmpresa: "basic",
                        }))
                      }
                      className={`p-4 rounded-2xl border transition-colors text-left ${
                        formData.planoEmpresa === "basic"
                          ? "border-[#2b9af3] bg-blue-50"
                          : "border-gray-200 bg-white hover:bg-gray-50"
                      }`}
                    >
                      <div className="text-sm text-gray-500">Básico</div>
                      <div className="text-2xl font-bold text-gray-900 mt-1">
                        R$39
                      </div>
                      <div className="text-xs text-gray-500 mt-1">/mês</div>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          planoEmpresa: "pro",
                        }))
                      }
                      className={`p-4 rounded-2xl border transition-colors text-left ${
                        formData.planoEmpresa === "pro"
                          ? "border-[#2b9af3] bg-blue-50"
                          : "border-gray-200 bg-white hover:bg-gray-50"
                      }`}
                    >
                      <div className="text-sm text-gray-500">Avançado</div>
                      <div className="text-2xl font-bold text-gray-900 mt-1">
                        R$79
                      </div>
                      <div className="text-xs text-gray-500 mt-1">/mês</div>
                    </button>
                  </div>

                  {errors.planoEmpresa && (
                    <p className="text-red-500 text-sm mt-2">
                      {errors.planoEmpresa}
                    </p>
                  )}
                </div>

                <Input
                  ref={fieldRefs.razaoSocial}
                  label="Razão Social"
                  value={formData.razaoSocial}
                  onChange={(value) => handleInputChange("razaoSocial", value)}
                  placeholder="Nome oficial da empresa"
                  required
                />
                {errors.razaoSocial && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.razaoSocial}
                  </p>
                )}

                <Input
                  ref={fieldRefs.nomeFantasia}
                  label="Nome Fantasia"
                  value={formData.nomeFantasia}
                  onChange={(value) => handleInputChange("nomeFantasia", value)}
                  placeholder="Nome comercial da empresa"
                  required
                />
                {errors.nomeFantasia && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.nomeFantasia}
                  </p>
                )}

                <Input
                  ref={fieldRefs.cnpj}
                  label="CNPJ"
                  value={formData.cnpj}
                  onChange={(value) => handleInputChange("cnpj", value)}
                  placeholder="00.000.000/0000-00"
                  mask="cnpj"
                  required
                  validate={validateCNPJ}
                  showValidationError={true}
                />
                {errors.cnpj && (
                  <p className="text-red-500 text-sm mt-1">{errors.cnpj}</p>
                )}

                <div className="border-t border-gray-200 pt-6 mt-6">
                  <h4 className="text-md font-semibold text-gray-900 mb-4">
                    Dados do Responsável
                  </h4>

                  <div className="space-y-6">
                    <Input
                      ref={fieldRefs.responsavel}
                      label="Nome do Responsável"
                      value={formData.responsavel}
                      onChange={(value) =>
                        handleInputChange("responsavel", value)
                      }
                      placeholder="Nome completo do responsável"
                      required
                    />
                    {errors.responsavel && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.responsavel}
                      </p>
                    )}

                    <Input
                      ref={fieldRefs.cpfResponsavel}
                      label="CPF do Responsável"
                      value={formData.cpfResponsavel}
                      onChange={(value) =>
                        handleInputChange("cpfResponsavel", value)
                      }
                      placeholder="000.000.000-00"
                      mask="cpf"
                      required
                      validate={validateCPF}
                      showValidationError={true}
                    />
                    {errors.cpfResponsavel && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.cpfResponsavel}
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Campos comuns */}
            <div className="border-t border-gray-200 pt-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Dados de Acesso
              </h3>
            </div>

            <Input
              ref={fieldRefs.email}
              label="Email"
              type="email"
              value={formData.email}
              onChange={(value) => handleInputChange("email", value)}
              placeholder="seuemail@exemplo.com"
              required
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}

            <Input
              ref={fieldRefs.telefone}
              label="Telefone"
              value={formData.telefone}
              onChange={(value) => handleInputChange("telefone", value)}
              placeholder="(11) 99999-9999"
              mask="phone"
              required
            />
            {errors.telefone && (
              <p className="text-red-500 text-sm mt-1">{errors.telefone}</p>
            )}

            <Input
              ref={fieldRefs.senha}
              label="Senha"
              type="password"
              value={formData.senha}
              onChange={(value) => handleInputChange("senha", value)}
              placeholder="••••••••"
              required
            />
            {errors.senha && (
              <p className="text-red-500 text-sm mt-1">{errors.senha}</p>
            )}

            <Input
              ref={fieldRefs.confirmarSenha}
              label="Confirmar Senha"
              type="password"
              value={formData.confirmarSenha}
              onChange={(value) => handleInputChange("confirmarSenha", value)}
              placeholder="••••••••"
              required
            />
            {errors.confirmarSenha && (
              <p className="text-red-500 text-sm mt-1">
                {errors.confirmarSenha}
              </p>
            )}

            {/* Global error message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              Cadastrar
            </Button>
          </form>

          {/* Link para login */}
          <div className="text-center mt-6 pt-6 border-t border-gray-200">
            <div className="text-gray-600">
              Já tem uma conta?{" "}
              <Link
                href="/entrar"
                className="text-[#2b9af3] hover:text-[#1e7ce6] font-medium transition-colors"
              >
                Faça login
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Termos de Uso */}
      <Modal
        isOpen={showTermsModal}
        onClose={handleCancelRegistration}
        title="Termos de Uso"
        subtitle="Leia e aceite nossos termos para continuar"
        size="md"
        primaryButton={{
          text: "Continuar Cadastro",
          onClick: handleConfirmRegistration,
          loading: isLoading,
          disabled: isLoading,
        }}
        secondaryButton={{
          text: "Cancelar",
          onClick: handleCancelRegistration,
        }}
      >
        <div className="space-y-4 text-sm text-gray-700">
          <div>
            Ao criar uma conta na plataforma Sublease, você concorda com nossos{" "}
            <Link
              href="/termos-de-uso"
              target="_blank"
              className="text-[#2b9af3] hover:text-[#1e7ce6] underline transition-colors duration-200"
            >
              Termos de Uso
            </Link>{" "}
            e{" "}
            <Link
              href="/politica-privacidade"
              target="_blank"
              className="text-[#2b9af3] hover:text-[#1e7ce6] underline transition-colors duration-200"
            >
              Política de Privacidade
            </Link>
            .
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">
              Principais pontos:
            </h3>
            <ul className="list-disc list-inside text-blue-800 space-y-1">
              <li>Seus dados serão protegidos conforme a LGPD</li>
              <li>Você é responsável pelas informações fornecidas</li>
              <li>A plataforma atua como intermediária</li>
              <li>Você pode cancelar sua conta a qualquer momento</li>
            </ul>
          </div>

          <p>Para ler os termos completos, clique nos links acima.</p>
        </div>
      </Modal>

      {/* Modal de Confirmação de E-mail */}
      <Modal
        isOpen={showEmailConfirmationModal}
        onClose={handleEmailConfirmationClose}
        title="Confirme seu e-mail"
        subtitle="Verificação necessária para ativar sua conta"
        size="md"
        primaryButton={{
          text: "Entendi",
          onClick: handleEmailConfirmationClose,
          loading: false,
        }}
      >
        <div className="text-center py-4">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-6">
            <svg
              className="h-8 w-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>

          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Verificação de e-mail enviada!
          </h3>

          <div className="space-y-4 text-sm text-gray-600">
            <p>Enviamos um e-mail de confirmação para:</p>
            <p className="font-semibold text-gray-900 bg-gray-50 p-3 rounded-lg">
              {formData.email}
            </p>
            <p>
              <strong>Próximos passos:</strong>
            </p>
            <ul className="text-left space-y-2 bg-blue-50 p-4 rounded-lg">
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">1.</span>
                Verifique sua caixa de entrada (e spam)
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">2.</span>
                Clique no link de confirmação no e-mail
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">3.</span>
                Volte aqui e faça login com suas credenciais
              </li>
            </ul>
            <p className="text-xs text-gray-500">
              Não recebeu o e-mail? Verifique sua pasta de spam ou aguarde
              alguns minutos.
            </p>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          resetPaymentFlow();
          setShowEmailConfirmationModal(true);
        }}
        title="Assinatura do Plano"
        subtitle="Finalize o pagamento via PIX ou Cartão de crédito"
        size="md"
      >
        <div className="space-y-4">
          <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
            Plano selecionado:{" "}
            <span className="font-semibold text-gray-900">
              {paymentPlan === "pro" ? "Avançado" : "Básico"}
            </span>
          </div>

          {activePaymentMethod === null && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button
                onClick={() => openPaymentCheckout("pix")}
                variant="primary"
                size="lg"
                className="w-full bg-black text-white hover:bg-black"
              >
                Pagar via PIX
              </Button>

              <Button
                onClick={() => openPaymentCheckout("card")}
                variant="secondary"
                size="lg"
                className="w-full bg-gray-900 text-white hover:bg-gray-900"
              >
                Pagar via Cartão de crédito
              </Button>
            </div>
          )}

          {activePaymentMethod === "pix" && (
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
              {isLoadingPix ? (
                <p className="text-sm text-gray-700">Gerando PIX...</p>
              ) : pixQrSrc ? (
                <div className="flex flex-col sm:flex-row gap-6 items-start">
                  <div className="flex items-center justify-center rounded-xl border border-gray-200 bg-white p-4">
                    <img
                      src={pixQrSrc}
                      alt="QR Code Pix"
                      className="w-[240px] h-[240px]"
                    />
                  </div>

                  <div className="flex-1 w-full">
                    {pixCode ? (
                      <div className="bg-white rounded-xl border border-gray-200 p-4">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              Copie e cole o código
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              O código pode conter caracteres especiais.
                            </p>
                          </div>
                          <Button
                            onClick={handleCopyPixCode}
                            variant="primary"
                            size="md"
                            className="bg-[#2b9af3] hover:bg-[#1e7ce6] text-white border-[#2b9af3] hover:border-[#1e7ce6] shrink-0"
                          >
                            Copiar
                          </Button>
                        </div>

                        <div className="mt-4">
                          <input
                            readOnly
                            value={pixCode}
                            onFocus={(e) => e.currentTarget.select()}
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
                          />
                        </div>

                        {pixExpiresAt && (
                          <p className="text-xs text-gray-500 mt-3">
                            Expira em:{" "}
                            {new Date(pixExpiresAt).toLocaleString("pt-BR")}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-700">
                        Código Pix não configurado no momento.
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-700">
                  QR Code Pix não configurado no momento.
                </p>
              )}
            </div>
          )}

          {activePaymentMethod === "card" && (
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
              <div className="flex flex-col gap-3">
                <p className="text-sm text-gray-700">
                  Você será redirecionado na mesma aba para o checkout seguro da
                  AbacatePay.
                </p>
                <Button
                  onClick={() => openPaymentCheckout("card")}
                  disabled={isLoadingCardCheckout}
                  variant="primary"
                  size="lg"
                  className="bg-black hover:bg-black text-white border-black disabled:bg-gray-300 disabled:text-gray-600 disabled:border-gray-300"
                >
                  {isLoadingCardCheckout
                    ? "Gerando checkout..."
                    : "Pagar com cartão"}
                </Button>
              </div>
            </div>
          )}

          {paymentError && (
            <p className="text-red-600 text-sm">{paymentError}</p>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default CadastrarPage;
