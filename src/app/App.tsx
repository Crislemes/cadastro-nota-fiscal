import newLogo from 'figma:asset/786834e75101b538aab0e9516f2cbde17c88d320.png';

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-8">
      <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full p-8">
        {/* Cabeçalho com ícone */}
        <div className="flex items-start gap-4 mb-6">
          <div className="flex-shrink-0">
            <img src={newLogo} alt="A&C Serviços Automotivos" className="w-24 h-24 object-contain" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl text-blue-600 mb-1">A&C CENTRO AUTOMOTIVO</h1>
            <p className="text-lg text-gray-700">NOTA FISCAL DE SERVIÇO</p>
            <p className="text-sm text-gray-500">Serviços Mecânicos</p>
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-blue-200 via-blue-300 to-blue-200 mb-6"></div>

        {/* Informações de Contato - Movido para o início */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <h2 className="text-sm font-medium text-blue-900 mb-2">INFORMAÇÕES DE CONTATO</h2>
          <div className="space-y-1 text-sm text-gray-700">
            <p>Alessandro da Silva | (31) 9.9911-2667</p>
            <p>amlsilmana77@gmail.com</p>
            <p className="text-xs text-gray-500 mt-2">A&C Centro Automotivo - Sistema de Gestão de Notas Fiscais</p>
          </div>
        </div>

        {/* Data de Emissão */}
        <div className="text-right mb-6">
          <span className="text-sm text-gray-500">Data de Emissão: </span>
          <span className="text-sm text-gray-700">15/02/2026</span>
        </div>

        {/* Dados do Cliente */}
        <div className="mb-6">
          <h2 className="text-base font-medium text-gray-800 mb-2 pb-2 border-b border-gray-200">
            DADOS DO CLIENTE
          </h2>
          <p className="text-sm text-gray-700">Nome: André Paes</p>
        </div>

        {/* Dados do Veículo */}
        <div className="mb-6">
          <h2 className="text-base font-medium text-gray-800 mb-2 pb-2 border-b border-gray-200">
            DADOS DO VEÍCULO
          </h2>
          <p className="text-sm text-gray-700">Placa: PUZ4H49 | Ano: 2015 | Modelo: VWGOL CL MC</p>
        </div>

        {/* Peças Utilizadas */}
        <div className="mb-6">
          <h2 className="text-base font-medium text-gray-800 mb-3 pb-2 border-b border-gray-200">
            PEÇAS UTILIZADAS
          </h2>
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-700 font-medium">Descrição</th>
                  <th className="text-center px-4 py-3 text-gray-700 font-medium w-20">Qtd</th>
                  <th className="text-right px-4 py-3 text-gray-700 font-medium w-28">Valor Unit.</th>
                  <th className="text-right px-4 py-3 text-gray-700 font-medium w-28">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-700">Aditivo concentrado</td>
                  <td className="px-4 py-3 text-center text-gray-700">2</td>
                  <td className="px-4 py-3 text-right text-gray-700">R$ 35,75</td>
                  <td className="px-4 py-3 text-right text-gray-700">R$ 71,50</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-700">Água desmineralizada</td>
                  <td className="px-4 py-3 text-center text-gray-700">2</td>
                  <td className="px-4 py-3 text-right text-gray-700">R$ 5,00</td>
                  <td className="px-4 py-3 text-right text-gray-700">R$ 10,00</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-700">Reservatório</td>
                  <td className="px-4 py-3 text-center text-gray-700">1</td>
                  <td className="px-4 py-3 text-right text-gray-700">R$ 79,47</td>
                  <td className="px-4 py-3 text-right text-gray-700">R$ 79,47</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Totais */}
        <div className="space-y-3 mb-6">
          <div className="flex justify-between items-center px-4">
            <span className="text-sm text-gray-600">Total das Peças:</span>
            <span className="text-sm text-gray-800">R$ 160,97</span>
          </div>
          <div className="flex justify-between items-center px-4">
            <span className="text-sm text-gray-600">Mão de Obra:</span>
            <span className="text-sm text-gray-800">R$ 150,00</span>
          </div>
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg px-4 py-4 flex justify-between items-center">
            <span className="text-lg font-medium">VALOR TOTAL:</span>
            <span className="text-2xl font-semibold">R$ 310,97</span>
          </div>
        </div>

        {/* Observações */}
        <div className="bg-amber-50 border-l-4 border-amber-400 rounded-r-lg p-4">
          <h2 className="text-sm font-medium text-amber-900 mb-1">OBSERVAÇÕES</h2>
          <p className="text-sm text-amber-800">Troca reservatório do radiador.</p>
        </div>

        {/* Rodapé */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-blue-600 font-medium mb-1">AGRADECEMOS A PREFERÊNCIA!</p>
        </div>
      </div>
    </div>
  );
}