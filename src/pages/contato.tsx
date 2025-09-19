import { useState } from 'react';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Select from '@/components/Select';
import { useContact } from '@/services/contactService';

const ContatoPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    topic: '',
    subject: '',
    message: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Use the contact hook
  const { submitContactMessage, isLoading, error: contactError } = useContact();

  // Opções para o select "Sobre o que você quer falar"
  const topicOptions = [
    { value: 'duvidas', label: 'Dúvidas' },
    { value: 'especialidade', label: 'Especialidade' },
    { value: 'suporte', label: 'Suporte Técnico' },
    { value: 'parceria', label: 'Parceria' },
    { value: 'sugestao', label: 'Sugestão' },
    { value: 'reclamacao', label: 'Reclamação' },
    { value: 'outros', label: 'Outros' }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpa erro do campo quando usuário começa a digitar
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validação do nome
    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    // Validação do email
    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Digite um email válido';
    }

    // Validação do telefone
    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefone é obrigatório';
    }

    // Validação do tópico
    if (!formData.topic.trim()) {
      newErrors.topic = 'Selecione sobre o que você quer falar';
    }

    // Validação do assunto
    if (!formData.subject.trim()) {
      newErrors.subject = 'Assunto é obrigatório';
    }

    // Validação da mensagem
    if (!formData.message.trim()) {
      newErrors.message = 'Mensagem é obrigatória';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Mensagem deve ter pelo menos 10 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      console.log('🚀 handleSubmit iniciado');
      console.log('📝 Dados do formulário:', formData);
      
      const result = await submitContactMessage({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        topic: formData.topic,
        subject: formData.subject,
        message: formData.message
      });

      console.log('📧 Resultado do envio:', result);

      if (result.success) {
        // Clear form after success
        setFormData({
          name: '',
          email: '',
          phone: '',
          topic: '',
          subject: '',
          message: ''
        });
        
        alert(result.message || 'Mensagem enviada com sucesso! Entraremos em contato em breve.');
      } else {
        console.error('❌ Erro no envio:', result.error);
        alert(`Erro ao enviar mensagem: ${result.error || 'Tente novamente.'}`);
      }
    } catch (error) {
      console.error('💥 Erro inesperado no handleSubmit:', error);
      alert(`Erro ao enviar mensagem: ${error instanceof Error ? error.message : 'Tente novamente.'}`);
    }
  };

  const handleWhatsAppClick = () => {
    const message = `Olá! Gostaria de entrar em contato sobre a plataforma de sublocação de consultórios.`;
    const whatsappUrl = `https://wa.me/5561982030380?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header da página */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Entre em Contato</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Estamos aqui para ajudar! Entre em contato conosco para tirar suas dúvidas, 
            fazer sugestões ou obter suporte sobre nossa plataforma de sublocação de consultórios.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Informações de contato */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Informações de Contato</h2>
              
              {/* Email */}
              <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Email</h3>
                    <p className="text-gray-600">edsonpinheiroliveira@gmail.com</p>
                    <a 
                      href="mailto:edsonpinheiroliveira@gmail.com"
                      className="text-[#2b9af3] hover:text-[#1e7ce6] transition-colors text-sm"
                    >
                      Enviar email
                    </a>
                  </div>
                </div>
              </div>

              {/* Telefone/WhatsApp */}
              <div className="bg-white rounded-2xl shadow-md p-6">
                <div className="flex items-center gap-4">
                  <div className="bg-green-100 p-3 rounded-full">
                    <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">WhatsApp</h3>
                    <p className="text-gray-600">(61) 98203-0380</p>
                    <Button
                      onClick={handleWhatsAppClick}
                      variant="whatsapp"
                      size="sm"
                      className="mt-2"
                    >
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                      </svg>
                      Conversar no WhatsApp
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Horário de atendimento */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Horário de Atendimento</h3>
              <div className="space-y-2 text-gray-600">
                <p><span className="font-medium">Segunda a Sexta:</span> 8h às 18h</p>
                <p><span className="font-medium">Sábado:</span> 8h às 12h</p>
                <p><span className="font-medium">Domingo:</span> Fechado</p>
              </div>
            </div>
          </div>

          {/* Formulário de contato */}
          <div>
            <div className="bg-white rounded-2xl shadow-md p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Envie sua Mensagem</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Nome */}
                <Input
                  label="Nome completo"
                  value={formData.name}
                  onChange={(value) => handleInputChange('name', value)}
                  placeholder="Seu nome completo"
                  required
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}

                {/* Email */}
                <Input
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(value) => handleInputChange('email', value)}
                  placeholder="seu@email.com"
                  required
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}

                {/* Telefone */}
                <Input
                  label="Telefone"
                  value={formData.phone}
                  onChange={(value) => handleInputChange('phone', value)}
                  placeholder="(00) 00000-0000"
                  mask="phone"
                  required
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                )}

                {/* Tópico */}
                <Select
                  label="Sobre o que você quer falar?"
                  options={topicOptions}
                  value={formData.topic}
                  onChange={(value) => handleInputChange('topic', value)}
                  placeholder="Selecione uma opção"
                />
                {errors.topic && (
                  <p className="text-red-500 text-sm mt-1">{errors.topic}</p>
                )}

                {/* Assunto */}
                <Input
                  label="Assunto"
                  value={formData.subject}
                  onChange={(value) => handleInputChange('subject', value)}
                  placeholder="Qual o assunto da sua mensagem?"
                  required
                />
                {errors.subject && (
                  <p className="text-red-500 text-sm mt-1">{errors.subject}</p>
                )}

                {/* Mensagem */}
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    Mensagem
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    placeholder="Descreva sua dúvida, sugestão ou solicitação..."
                    rows={6}
                    className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-left focus:outline-none focus:ring-2 focus:ring-[#2b9af3] focus:border-[#2b9af3] shadow-sm hover:border-gray-300 transition-colors duration-200 cursor-pointer text-[#333] placeholder-gray-500"
                    required
                  />
                  {errors.message && (
                    <p className="text-red-500 text-sm mt-1">{errors.message}</p>
                  )}
                  <p className="text-gray-500 text-sm mt-1">
                    {formData.message.length}/10 caracteres mínimos
                  </p>
                </div>

                {/* Error message from hook */}
                {contactError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-red-600 text-sm">{contactError}</p>
                  </div>
                )}

                {/* Botão de envio */}
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? 'Enviando...' : 'Enviar Mensagem'}
                </Button>
              </form>
            </div>
          </div>
        </div>

        {/* Seção adicional */}
        <div className="mt-16 text-center">
          <div className="bg-white rounded-2xl shadow-md p-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              Por que escolher nossa plataforma?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Segurança</h4>
                <p className="text-gray-600 text-sm">
                  Todos os consultórios são verificados e os proprietários são validados para garantir sua segurança.
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Rapidez</h4>
                <p className="text-gray-600 text-sm">
                  Encontre e reserve consultórios em minutos, com processo simplificado e eficiente.
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Suporte</h4>
                <p className="text-gray-600 text-sm">
                  Nossa equipe está sempre disponível para ajudar e resolver qualquer dúvida que você tenha.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContatoPage;
