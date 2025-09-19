interface UseGoogleMapsReturn {
  isLoaded: boolean;
  error: string | null;
}

export const useGoogleMaps = (): UseGoogleMapsReturn => {
  // Temporariamente desabilitado para resolver problemas de build
  return {
    isLoaded: false,
    error: 'Google Maps temporariamente indisponível'
  };
};