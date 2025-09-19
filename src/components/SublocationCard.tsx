import { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { SublocationPlus } from '@/types';
import { getFeatureInfo } from '@/constants/features';

interface SublocationCardProps {
  id: string;
  title: string;
  address: string;
  price: string;
  imageUrl?: string;
  stamp?: 'new' | 'hot';
  plus?: SublocationPlus[];
  rating: number; // Obrigatório
}

const SublocationCard = ({ 
  id,
  title, 
  address, 
  price, 
  imageUrl, 
  stamp,
  plus = [],
  rating
}: SublocationCardProps) => {
  const [transform, setTransform] = useState('perspective(1000px) rotateX(0deg) rotateY(0deg)');
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;
    
    const rotateX = (mouseY / rect.height) * -30;
    const rotateY = (mouseX / rect.width) * 30;
    
    setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`);
  };

  const handleMouseLeave = () => {
    setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg)');
  };


  const renderStar = () => {
    return (
      <span className="text-sm text-yellow-400">
        ★
      </span>
    );
  };


  return (
    <Link href={`/consultorio/${id}`} className="block">
      <div 
        ref={cardRef}
        className="bg-white rounded-3xl shadow-md overflow-hidden border border-gray-200 transition-transform duration-100 ease-out cursor-pointer"
        style={{ transform }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
      {/* Imagem com tag "New", rating e favorito */}
      <div className="relative h-48 bg-gray-200">
        {imageUrl ? (
          <Image 
            src={imageUrl} 
            alt={title}
            width={300}
            height={192}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = '/office-empty.jpg';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm">Sem imagem</p>
            </div>
          </div>
        )}
        
        {/* Rating - Position absolute */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
          <div className="flex items-center">
            {renderStar()}
          </div>
          <span className="text-sm text-gray-700 font-medium">
            {rating.toFixed(1)}
          </span>
        </div>
        
        {stamp && (
          <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-sm font-medium ${
            stamp === 'new' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-orange-100 text-orange-800'
          }`}>
            {stamp === 'new' ? 'Novo!' : 'Em Alta!'}
          </div>
        )}
        
        {/* Ícone de favorito - COMENTADO */}
        {/* <button className="absolute top-3 right-3 text-white/80 hover:text-red-500 transition-colors bg-black/20 hover:bg-black/30 p-2 rounded-full cursor-pointer">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button> */}
      </div>

      {/* Conteúdo */}
      <div className="p-4">
        {/* Título e Preço */}
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900 flex-1 pr-4">{title}</h3>
          <span className="text-xl font-bold text-[#2b9af3]">R$ {price}/hora</span>
        </div>

        {/* Endereço */}
        <p className="text-gray-600 text-sm mb-4">{address}</p>

        {/* Features */}
        <div className="flex gap-2 flex-nowrap overflow-hidden">
          {plus.slice(0, 3).map((feature) => {
            const featureInfo = getFeatureInfo(feature);
            return (
              <div key={feature} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-lg text-sm flex items-center gap-1 whitespace-nowrap">
                <span>{featureInfo.icon}</span>
                <span>{featureInfo.label}</span>
              </div>
            );
          })}
          {plus.length > 3 && (
            <div className="bg-gray-100 text-gray-700 px-2 py-1 rounded-lg text-sm flex items-center gap-1 whitespace-nowrap">
              <span>+{plus.length - 3}</span>
            </div>
          )}
        </div>
      </div>
      </div>
    </Link>
  );
};

export default SublocationCard;
