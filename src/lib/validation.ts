/**
 * Valida se um CPF é válido usando o algoritmo oficial brasileiro
 * @param cpf - CPF com ou sem formatação (apenas números ou com pontos e hífen)
 * @returns true se o CPF for válido, false caso contrário
 */
export function isValidCPF(cpf: string): boolean {
  // Remove caracteres não numéricos
  const cleanCPF = cpf.replace(/\D/g, '');
  
  // Verifica se tem 11 dígitos
  if (cleanCPF.length !== 11) {
    return false;
  }
  
  // Verifica se todos os dígitos são iguais (CPFs inválidos como 111.111.111-11)
  if (/^(\d)\1{10}$/.test(cleanCPF)) {
    return false;
  }
  
  // Calcula o primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let remainder = sum % 11;
  const firstDigit = remainder < 2 ? 0 : 11 - remainder;
  
  // Verifica o primeiro dígito
  if (parseInt(cleanCPF.charAt(9)) !== firstDigit) {
    return false;
  }
  
  // Calcula o segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  remainder = sum % 11;
  const secondDigit = remainder < 2 ? 0 : 11 - remainder;
  
  // Verifica o segundo dígito
  if (parseInt(cleanCPF.charAt(10)) !== secondDigit) {
    return false;
  }
  
  return true;
}

/**
 * Valida se um CNPJ é válido usando o algoritmo oficial brasileiro
 * @param cnpj - CNPJ com ou sem formatação (apenas números ou com pontos, barra e hífen)
 * @returns true se o CNPJ for válido, false caso contrário
 */
export function isValidCNPJ(cnpj: string): boolean {
  // Remove caracteres não numéricos
  const cleanCNPJ = cnpj.replace(/\D/g, '');
  
  // Verifica se tem 14 dígitos
  if (cleanCNPJ.length !== 14) {
    return false;
  }
  
  // Verifica se todos os dígitos são iguais (CNPJs inválidos como 11.111.111/1111-11)
  if (/^(\d)\1{13}$/.test(cleanCNPJ)) {
    return false;
  }
  
  // Calcula o primeiro dígito verificador
  let sum = 0;
  let weight = 2;
  for (let i = 11; i >= 0; i--) {
    sum += parseInt(cleanCNPJ.charAt(i)) * weight;
    weight = weight === 9 ? 2 : weight + 1;
  }
  let remainder = sum % 11;
  const firstDigit = remainder < 2 ? 0 : 11 - remainder;
  
  // Verifica o primeiro dígito
  if (parseInt(cleanCNPJ.charAt(12)) !== firstDigit) {
    return false;
  }
  
  // Calcula o segundo dígito verificador
  sum = 0;
  weight = 2;
  for (let i = 12; i >= 0; i--) {
    sum += parseInt(cleanCNPJ.charAt(i)) * weight;
    weight = weight === 9 ? 2 : weight + 1;
  }
  remainder = sum % 11;
  const secondDigit = remainder < 2 ? 0 : 11 - remainder;
  
  // Verifica o segundo dígito
  if (parseInt(cleanCNPJ.charAt(13)) !== secondDigit) {
    return false;
  }
  
  return true;
}

/**
 * Valida se um email tem formato válido
 * @param email - Email para validar
 * @returns true se o email for válido, false caso contrário
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valida se um telefone tem formato válido (10 ou 11 dígitos)
 * @param phone - Telefone para validar
 * @returns true se o telefone for válido, false caso contrário
 */
export function isValidPhone(phone: string): boolean {
  const cleanPhone = phone.replace(/\D/g, '');
  return cleanPhone.length >= 10 && cleanPhone.length <= 11;
}
