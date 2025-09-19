/**
 * Serviço para consulta de CEP usando APIs gratuitas
 * Utiliza a API ViaCEP como principal e fallback para outras APIs
 */

export interface CepData {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}

export interface CepError {
  erro: boolean;
  message: string;
}

/**
 * Consulta dados de um CEP usando a API ViaCEP
 * @param cep - CEP a ser consultado (formato: 00000-000 ou 00000000)
 * @returns Promise com os dados do CEP ou erro
 */
export async function consultarCep(cep: string): Promise<CepData | CepError> {
  try {
    // Remove caracteres não numéricos do CEP
    const cepLimpo = cep.replace(/\D/g, '');
    
    // Valida se o CEP tem 8 dígitos
    if (cepLimpo.length !== 8) {
      return {
        erro: true,
        message: 'CEP deve conter 8 dígitos'
      };
    }

    // Tenta primeiro com a API ViaCEP
    const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
    
    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.status}`);
    }

    const data: CepData = await response.json();

    // Verifica se o CEP foi encontrado
    if (data.erro) {
      return {
        erro: true,
        message: 'CEP não encontrado'
      };
    }

    return data;

  } catch (error) {
    console.error('Erro ao consultar CEP:', error);
    
    // Fallback para outras APIs em caso de erro
    return await consultarCepFallback(cep);
  }
}

/**
 * Função de fallback que tenta outras APIs de CEP
 * @param cep - CEP a ser consultado
 * @returns Promise com os dados do CEP ou erro
 */
async function consultarCepFallback(cep: string): Promise<CepData | CepError> {
  try {
    const cepLimpo = cep.replace(/\D/g, '');
    
    // Tenta com a API do OpenCEP
    const response = await fetch(`https://opencep.com/v1/${cepLimpo}`);
    
    if (!response.ok) {
      throw new Error(`Erro na requisição fallback: ${response.status}`);
    }

    const data = await response.json();

    if (data.erro) {
      return {
        erro: true,
        message: 'CEP não encontrado em nenhuma API'
      };
    }

    // Converte o formato da API OpenCEP para o formato padrão
    return {
      cep: data.cep,
      logradouro: data.address || '',
      complemento: data.complement || '',
      bairro: data.district || '',
      localidade: data.city || '',
      uf: data.state || '',
      ibge: data.ibge || '',
      gia: '',
      ddd: data.ddd || '',
      siafi: ''
    };

  } catch (error) {
    console.error('Erro no fallback de consulta de CEP:', error);
    
    return {
      erro: true,
      message: 'Erro ao consultar CEP. Tente novamente mais tarde.'
    };
  }
}

/**
 * Valida se um CEP está no formato correto
 * @param cep - CEP a ser validado
 * @returns true se o CEP é válido, false caso contrário
 */
export function validarCep(cep: string): boolean {
  const cepLimpo = cep.replace(/\D/g, '');
  return cepLimpo.length === 8 && /^\d{8}$/.test(cepLimpo);
}

/**
 * Formata um CEP para o padrão 00000-000
 * @param cep - CEP a ser formatado
 * @returns CEP formatado ou string vazia se inválido
 */
export function formatarCep(cep: string): string {
  const cepLimpo = cep.replace(/\D/g, '');
  
  if (cepLimpo.length === 8) {
    return `${cepLimpo.slice(0, 5)}-${cepLimpo.slice(5)}`;
  }
  
  return cepLimpo;
}

/**
 * Remove formatação de um CEP, deixando apenas números
 * @param cep - CEP a ser limpo
 * @returns CEP apenas com números
 */
export function limparCep(cep: string): string {
  return cep.replace(/\D/g, '');
}
