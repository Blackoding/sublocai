import React from 'react';
import Link from 'next/link';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo e Descrição */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-4 mb-4">
              <span className="text-2xl font-bold text-[#2b9af3]">Logo</span>
            </div>
            <p className="text-gray-300 mb-6 max-w-md">
              Conectamos profissionais da saúde com consultórios disponíveis para sublocação, 
              oferecendo flexibilidade e rentabilidade para todos.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://wa.me/5561982030380" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-full transition-colors duration-200"
                title="WhatsApp"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                </svg>
              </a>
              <a 
                href="mailto:edsonpinheiroliveira@gmail.com" 
                className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full transition-colors duration-200"
                title="Email"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Links Rápidos */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Links Rápidos</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/sublocar" className="text-gray-300 hover:text-[#2b9af3] transition-colors duration-200">
                  Buscar Consultórios
                </Link>
              </li>
              <li>
                <Link href="/anunciar" className="text-gray-300 hover:text-[#2b9af3] transition-colors duration-200">
                  Anunciar Consultório
                </Link>
              </li>
              <li>
                <Link href="/como-funciona" className="text-gray-300 hover:text-[#2b9af3] transition-colors duration-200">
                  Como Funciona
                </Link>
              </li>
              <li>
                <Link href="/contato" className="text-gray-300 hover:text-[#2b9af3] transition-colors duration-200">
                  Contato
                </Link>
              </li>
            </ul>
          </div>

          {/* Suporte */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Suporte</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/entrar" className="text-gray-300 hover:text-[#2b9af3] transition-colors duration-200">
                  Entrar
                </Link>
              </li>
              <li>
                <Link href="/cadastrar" className="text-gray-300 hover:text-[#2b9af3] transition-colors duration-200">
                  Cadastrar
                </Link>
              </li>
              <li>
                <a 
                  href="https://wa.me/5561982030380" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-[#2b9af3] transition-colors duration-200"
                >
                  WhatsApp
                </a>
              </li>
              <li>
                <a 
                  href="mailto:edsonpinheiroliveira@gmail.com" 
                  className="text-gray-300 hover:text-[#2b9af3] transition-colors duration-200"
                >
                  Email
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Linha divisória */}
        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2024 Sublease. Todos os direitos reservados.
            </div>
            <div className="flex space-x-6 text-sm">
              <Link href="/politica-privacidade" className="text-gray-400 hover:text-[#2b9af3] transition-colors duration-200">
                Política de Privacidade
              </Link>
              <Link href="/termos-de-uso" className="text-gray-400 hover:text-[#2b9af3] transition-colors duration-200">
                Termos de Uso
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
