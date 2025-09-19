interface Consultorio {
  cep?: string;
  street?: string;
  number?: string;
  neighborhood?: string;
  complement?: string;
  city: string;
  state: string;
}

interface AvailabilityItem {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
}

export const formatDetailedAddress = (consultorio: Consultorio) => {
  const parts = [];
  
  // Rua e número
  if (consultorio.street && consultorio.number) {
    parts.push(`${consultorio.street}, ${consultorio.number}`);
  } else if (consultorio.street) {
    parts.push(consultorio.street);
  }
  
  // Complemento (se existir)
  if (consultorio.complement) {
    parts.push(consultorio.complement);
  }
  
  // Bairro
  if (consultorio.neighborhood) {
    parts.push(consultorio.neighborhood);
  }
  
  // Cidade e estado
  if (consultorio.city && consultorio.state) {
    parts.push(`${consultorio.city}, ${consultorio.state}`);
  } else if (consultorio.city) {
    parts.push(consultorio.city);
  }
  
  // CEP (se existir)
  if (consultorio.cep) {
    parts.push(`CEP: ${consultorio.cep}`);
  }
  
  return parts.length > 0 ? parts.join(' - ') : 'Endereço não informado';
};

export const formatAvailability = (availability: AvailabilityItem[]) => {
  if (!availability || availability.length === 0) return null;

  // Agrupar por dia da semana
  const groupedByDay: { [key: string]: { startTime: string; endTime: string }[] } = {};
  
  availability.forEach(item => {
    if (!groupedByDay[item.day]) {
      groupedByDay[item.day] = [];
    }
    groupedByDay[item.day].push({
      startTime: item.startTime,
      endTime: item.endTime
    });
  });

  // Traduzir dias da semana
  const dayTranslations: { [key: string]: string } = {
    'segunda': 'Segunda-feira',
    'terca': 'Terça-feira',
    'quarta': 'Quarta-feira',
    'quinta': 'Quinta-feira',
    'sexta': 'Sexta-feira',
    'sabado': 'Sábado',
    'domingo': 'Domingo'
  };

  return Object.entries(groupedByDay).map(([day, times]) => {
    const dayName = dayTranslations[day] || day;
    const timeRanges = times.map(time => `${time.startTime} às ${time.endTime}`).join(', ');
    return `${dayName}: ${timeRanges}`;
  }).join('\n');
};
