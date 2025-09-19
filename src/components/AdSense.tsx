import Banner from "./Banner";

const AdSense = () => {
  return (
    <div className="w-full mx-auto px-8 py-8 flex flex-col lg:flex-row gap-4">
      <Banner 
        value="+5" 
        legend="Regiões cobertas" 
        align="left"
        textColor="text-gray-800"
        className="bg-gray-100"
      />

      <Banner 
        value="+100" 
        legend="Consultórios cadastrados" 
        align="left"
        className="bg-[url('/office-empty.jpg')] bg-cover bg-no-repeat bg-gray-600/60 bg-center bg-blend-multiply"
        textColor="text-white"
      />

      <Banner 
        value="+2300" 
        legend="Sublocações realizadas" 
        align="left"
        className="bg-gray-900"
        textColor="text-white"
      />
    </div>
  );
};

export default AdSense;
