import React, { useState } from 'react';
import { 
  X, 
  ShoppingBag, 
  Package, 
  Briefcase, 
  Coins, 
  Sparkles, 
  Check, 
  MapPin, 
  Utensils, 
  Gamepad2, 
  Shirt, 
  Heart 
} from 'lucide-react';
import { BackpackItem, ActiveJob } from '../simulation/GameEngine';
import { soundManager } from '../simulation/audio';

// --- CATÁLOGO DE PRODUTOS DAS LOJAS DA CIDADE ---
export const SHOP_CATALOG: BackpackItem[] = [
  // Loja de Brinquedos
  { id: 'toy_car', name: 'Carrinho de Brinquedo', category: 'brinquedo', price: 30, icon: '🏎️', description: 'Carrinho esportivo vermelho super veloz!' },
  { id: 'toy_ball', name: 'Bola de Futebol', category: 'brinquedo', price: 15, icon: '⚽', description: 'Bola macia para jogar no parque e chutar gol!' },
  { id: 'toy_kite', name: 'Pipa Colorida', category: 'brinquedo', price: 20, icon: '🪁', description: 'Pipa de arco-íris para empinar na praia com o vento!' },
  { id: 'toy_bear', name: 'Ursinho de Pelúcia', category: 'brinquedo', price: 25, icon: '🧸', description: 'Ursinho fofinho companheiro de aventuras do Theo!' },

  // Supermercado
  { id: 'food_apple', name: 'Maçã Vermelha', category: 'comida', price: 5, icon: '🍎', description: 'Fruta fresca e crocante. Restaura 100% do fôlego!' },
  { id: 'food_juice', name: 'Suco de Laranja', category: 'comida', price: 8, icon: '🧃', description: 'Suco natural geladinho para matar a sede do Theo!' },
  { id: 'food_bread', name: 'Pão Quentinho', category: 'comida', price: 6, icon: '🥖', description: 'Pão da padaria crocante por fora e macio por dentro!' },
  { id: 'food_cookie', name: 'Biscoito Estrela', category: 'comida', price: 7, icon: '🍪', description: 'Biscoito doce de chocolate com formato de estrela!' },

  // Loja de Roupas
  { id: 'cloth_gold_cap', name: 'Boné Dourado Campeão', category: 'roupa', price: 40, icon: '🧢', description: 'Boné dourado reluzente estilo Free Fire campeão!' },
  { id: 'cloth_turbo_sneakers', name: 'Tênis Turbo com Luz', category: 'roupa', price: 60, icon: '👟', description: 'Tênis esportivo com luzinhas nos calcanhares!' },
  { id: 'cloth_hero_shirt', name: 'Camiseta de Super-Herói', category: 'roupa', price: 35, icon: '👕', description: 'Camiseta azul marinho com brasão dourado!' },

  // THEO LUCCA OFICINA MECÂNICA
  { id: 'tool_wrench', name: 'Chave Inglesa de Mecânico', category: 'brinquedo', price: 18, icon: '🔧', description: 'Chave de aço cromada da Oficina Theo Lucca para consertar motores!' },
  { id: 'turbo_oil', name: 'Óleo Motor Turbo Sintético', category: 'comida', price: 12, icon: '🛢️', description: 'Óleo especial da Oficina Theo Lucca. Restaura 100% da estamina!' },
  { id: 'gold_spark', name: 'Vela de Ignição Dourada', category: 'brinquedo', price: 25, icon: '⚡', description: 'Vela turbo da Oficina Theo Lucca com faísca de alta performance!' },
];

export interface ShopModalProps {
  isOpen: boolean;
  currentMoney: number;
  onClose: () => void;
  onBuy: (item: BackpackItem) => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({
  isOpen,
  currentMoney,
  onClose,
  onBuy,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'todos' | 'brinquedo' | 'comida' | 'roupa'>('todos');

  if (!isOpen) return null;

  const filteredItems = selectedCategory === 'todos' 
    ? SHOP_CATALOG 
    : SHOP_CATALOG.filter((i) => i.category === selectedCategory);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/85 backdrop-blur-sm pointer-events-auto animate-fade-in font-sans">
      <div className="bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-2 border-purple-500 rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-[0_0_50px_rgba(168,85,247,0.35)] overflow-hidden">
        
        {/* Cabeçalho */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-600/30 border border-purple-500 flex items-center justify-center text-purple-400">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-['Rajdhani'] uppercase tracking-wider">
                Lojas da Cidade Real 3D
              </h2>
              <p className="text-[10px] text-slate-400">
                Brinquedos, Lanches e Roupas para o Theo Lucca
              </p>
            </div>
          </div>

          {/* Saldo na Carteira */}
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 bg-amber-500/20 border border-amber-500/50 rounded-full flex items-center gap-1.5 text-amber-400 font-mono font-bold text-xs">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span>R$ {currentMoney.toFixed(2)}</span>
            </div>

            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Abas de Categorias */}
        <div className="flex gap-1.5 p-3 border-b border-slate-800 bg-slate-950/40 text-xs">
          {[
            { id: 'todos', label: 'Todos os Itens', icon: Sparkles },
            { id: 'brinquedo', label: 'Brinquedos', icon: Gamepad2 },
            { id: 'comida', label: 'Mercado & Comida', icon: Utensils },
            { id: 'roupa', label: 'Roupas & Bonés', icon: Shirt },
          ].map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as any)}
                className={`flex-1 py-1.5 px-2 rounded-xl flex items-center justify-center gap-1.5 font-bold transition text-[11px] ${
                  selectedCategory === cat.id
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-400'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span className="truncate">{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Grade de Itens */}
        <div className="p-4 overflow-y-auto flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredItems.map((item) => {
            const canAfford = currentMoney >= item.price;
            return (
              <div 
                key={item.id}
                className="bg-slate-900/90 border border-slate-800 hover:border-purple-500/60 rounded-xl p-3 flex flex-col justify-between transition group"
              >
                <div className="flex items-start gap-2.5">
                  <div className="text-2xl p-2 bg-slate-950 rounded-lg border border-slate-800 flex-shrink-0 group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xs font-bold text-white truncate">{item.name}</h3>
                    <p className="text-[10px] text-slate-400 line-clamp-2 mt-0.5 leading-tight">{item.description}</p>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="font-mono font-bold text-amber-400 text-xs">
                    R$ {item.price},00
                  </div>

                  <button
                    onClick={() => onBuy(item)}
                    disabled={!canAfford}
                    className={`px-3 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1 transition ${
                      canAfford 
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow' 
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <span>Comprar</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Rodapé com Dica */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 text-center text-[10px] text-slate-400 font-mono">
          Os itens comprados são guardados diretamente na Mochila do Theo Lucca!
        </div>

      </div>
    </div>
  );
};

// --- MODAL DA MOCHILA (INVENTÁRIO DO THEO) ---
export interface BackpackModalProps {
  isOpen: boolean;
  backpack: BackpackItem[];
  onClose: () => void;
  onUseItem: (item: BackpackItem) => void;
}

export const BackpackModal: React.FC<BackpackModalProps> = ({
  isOpen,
  backpack,
  onClose,
  onUseItem,
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  if (!isOpen) return null;

  // Garante que o item selecionado seja válido
  const validIndex = Math.min(selectedIndex, Math.max(0, backpack.length - 1));
  const selectedItem = backpack.length > 0 ? backpack[validIndex] : null;

  const handleSelectItem = (idx: number) => {
    setSelectedIndex(idx);
    soundManager.playPopClick();
  };

  const handleUse = () => {
    if (!selectedItem) return;
    soundManager.playStarCollect();
    onUseItem(selectedItem);
  };

  const handleClose = () => {
    soundManager.playPopClick();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 w-screen h-screen bg-slate-950/95 backdrop-blur-md p-2 sm:p-5 flex flex-col justify-between pointer-events-auto animate-fade-in font-sans select-none">
      <div className="bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-4 border-[#854d0e] rounded-3xl w-full h-full flex flex-col shadow-[0_0_60px_rgba(245,158,11,0.35)] overflow-hidden">
        
        {/* Cabeçalho Gigante Infantil */}
        <div className="p-3.5 sm:p-5 border-b-4 border-[#854d0e] flex items-center justify-between bg-gradient-to-r from-amber-950/70 via-slate-900 to-amber-950/70">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-yellow-400 border-4 border-[#5c2e0b] flex items-center justify-center shadow-lg flex-shrink-0 animate-kid-backpack">
              <span className="text-2xl sm:text-4xl">🎒</span>
            </div>
            <div>
              <h2 className="text-xl sm:text-3xl font-black text-yellow-400 font-['Rajdhani'] uppercase tracking-wider leading-none drop-shadow">
                MOCHILA DO THEO LUCCA
              </h2>
              <p className="text-xs sm:text-sm text-amber-200/90 font-bold mt-0.5">
                {backpack.length === 0 ? 'Mochila vazia! Coloque brinquedos e comidinhas aqui!' : `${backpack.length} ${backpack.length === 1 ? 'item guardado' : 'itens guardados'}! Toque no item para escolher:`}
              </p>
            </div>
          </div>

          {/* Botão de Fechar Rápido Superior */}
          <button
            onClick={handleClose}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-rose-600 hover:bg-rose-500 border-4 border-rose-950 text-white flex items-center justify-center shadow-md active:scale-95 transition cursor-pointer"
            aria-label="Fechar Mochila"
            title="Fechar"
          >
            <X className="w-7 h-7 sm:w-8 sm:h-8 stroke-[3.5]" />
          </button>
        </div>

        {/* Conteúdo com Slots Gigantes (4 por linha) */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {backpack.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-8 space-y-4">
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-yellow-400/20 border-4 border-yellow-400/50 flex items-center justify-center text-6xl sm:text-7xl shadow-xl animate-bounce">
                🎒
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white font-['Rajdhani'] uppercase">
                A MOCHILA ESTÁ VAZIA!
              </h3>
              <p className="text-sm sm:text-base text-amber-200 max-w-md mx-auto font-medium">
                Vá até a <strong>Loja de Brinquedos</strong> ou no <strong>Mercado</strong> para comprar carrinhos, bolas, doces e roupinhas para o Theo Lucca!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-6">
              {backpack.map((item, index) => {
                const isSelected = index === validIndex;
                return (
                  <button
                    key={`${item.id}_${index}`}
                    onClick={() => handleSelectItem(index)}
                    className={`relative p-3.5 sm:p-5 rounded-3xl flex flex-col items-center justify-between text-center transition-all cursor-pointer select-none active:scale-95 min-h-[145px] sm:min-h-[185px] ${
                      isSelected
                        ? 'bg-gradient-to-b from-yellow-400/30 to-amber-500/40 border-[5px] border-yellow-400 shadow-[0_0_35px_rgba(250,204,21,0.7)] scale-[1.03] ring-4 ring-yellow-300/50'
                        : 'bg-slate-800/80 hover:bg-slate-800 border-4 border-slate-700/80 hover:border-amber-400/50 shadow-lg'
                    }`}
                  >
                    {/* Indicador de Seleção com Estrela */}
                    {isSelected && (
                      <div className="absolute -top-3.5 -right-2 px-2.5 py-0.5 bg-yellow-400 border-2 border-amber-950 rounded-full text-slate-950 font-black text-[10px] sm:text-xs shadow-md flex items-center gap-1 animate-pulse">
                        <Sparkles className="w-3.5 h-3.5 fill-current text-slate-950" />
                        <span>ESCOLHIDO</span>
                      </div>
                    )}

                    {/* Desenho Grande do Item */}
                    <div className="text-5xl sm:text-7xl my-auto filter drop-shadow-md py-1 transform transition-transform group-hover:scale-110">
                      {item.icon}
                    </div>

                    {/* Nome Grande do Item */}
                    <div className="w-full mt-2">
                      <h4 className="text-base sm:text-xl font-black text-white leading-tight font-['Rajdhani'] uppercase truncate drop-shadow">
                        {item.name}
                      </h4>
                      <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold uppercase bg-slate-950/80 text-amber-300 border border-amber-500/30">
                        {item.category === 'comida' ? '🍎 Comidinha' : (item.category === 'roupa' ? '👕 Roupinha' : '🏎️ Brinquedo')}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Barra de Ações Inferior GIGANTE (Botão USAR verde e FECHAR vermelho) */}
        <div className="p-3.5 sm:p-5 bg-slate-950 border-t-4 border-[#854d0e] flex flex-row items-center justify-center gap-3 sm:gap-8">
          {/* BOTÃO FECHAR GIGANTE VERMELHO COM X */}
          <button
            onClick={handleClose}
            className="flex-1 max-w-xs py-4 sm:py-5 px-4 sm:px-8 rounded-2xl bg-gradient-to-b from-rose-500 to-red-700 hover:from-rose-400 hover:to-red-600 border-4 border-red-950 text-white font-black text-lg sm:text-2xl shadow-[0_6px_0_#450a0a,0_10px_20px_rgba(239,68,68,0.4)] active:translate-y-1.5 active:shadow-[0_1px_0_#450a0a] flex items-center justify-center gap-2 sm:gap-3 transition cursor-pointer"
          >
            <X className="w-7 h-7 sm:w-9 sm:h-9 stroke-[3.5]" />
            <span>FECHAR</span>
          </button>

          {/* BOTÃO USAR GIGANTE VERDE */}
          {backpack.length > 0 && selectedItem && (
            <button
              onClick={handleUse}
              className="flex-1 max-w-xs py-4 sm:py-5 px-4 sm:px-8 rounded-2xl bg-gradient-to-b from-emerald-400 to-green-600 hover:from-emerald-300 hover:to-green-500 border-4 border-emerald-950 text-slate-950 font-black text-lg sm:text-2xl shadow-[0_6px_0_#064e3b,0_10px_20px_rgba(16,185,129,0.4)] active:translate-y-1.5 active:shadow-[0_1px_0_#064e3b] flex items-center justify-center gap-2 sm:gap-3 transition cursor-pointer animate-pulse"
            >
              <Check className="w-7 h-7 sm:w-9 sm:h-9 stroke-[3.5]" />
              <span>USAR AGORA!</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

// --- MODAL DE TRABALHOS DA CIDADE ---
export interface JobsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectJob: (jobId: string) => void;
}

export const JobsModal: React.FC<JobsModalProps> = ({
  isOpen,
  onClose,
  onSelectJob,
}) => {
  if (!isOpen) return null;

  const jobsList = [
    {
      id: 'pizzaria_do_bairro',
      name: '1. Entregador de Pizza',
      reward: 'R$ 20,00',
      icon: '🍕',
      desc: 'Pegue a pizza na pizzaria e leve até a casa do vizinho marcada no mapa.',
      place: 'Pizzaria do Bairro',
    },
    {
      id: 'supermercado_central',
      name: '2. Ajudante do Mercado',
      reward: 'R$ 15,00',
      icon: '📦',
      desc: 'Pegue caixas de suprimentos na doca e organize nas prateleiras.',
      place: 'Supermercado Central',
    },
    {
      id: 'parque_jardineiro',
      name: '3. Jardineiro do Parque',
      reward: 'R$ 10,00',
      icon: '🌻',
      desc: 'Regue os 3 canteiros de flores com o regador para deixá-las floridas.',
      place: 'Parque das Flores',
    },
    {
      id: 'entregador_jornal',
      name: '4. Entregador de Jornal',
      reward: 'R$ 25,00',
      icon: '📰',
      desc: 'Entregue o jornal matinal nas caixas de correio dos vizinhos.',
      place: 'Banca Central',
    },
    {
      id: 'padaria_pao_quentinho',
      name: '5. Ajudante da Padaria',
      reward: 'R$ 12,00',
      icon: '🥖',
      desc: 'Leve sacola de pães quentinhos para a Vovó Maria na praça.',
      place: 'Padaria Pão Quentinho',
    },
    {
      id: 'oficina_mecanica',
      name: '6. Mecânico da Oficina Theo Lucca',
      reward: 'R$ 25,00',
      icon: '🔧',
      desc: 'Faça a revisão completa do motor do carro prata na oficina!',
      place: 'THEO LUCCA OFICINA MECÂNICA',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/85 backdrop-blur-sm pointer-events-auto animate-fade-in font-sans">
      <div className="bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-2 border-emerald-500 rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-[0_0_50px_rgba(16,185,129,0.35)] overflow-hidden">
        
        {/* Cabeçalho */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/30 border border-emerald-500 flex items-center justify-center text-emerald-400">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-['Rajdhani'] uppercase tracking-wider">
                Trabalhos da Cidade (Ganhe R$)
              </h2>
              <p className="text-[10px] text-slate-400">
                Missões de Trabalho e Revisão na Oficina Theo Lucca para juntar moedas
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Lista dos 5 Trabalhos */}
        <div className="p-4 overflow-y-auto flex-1 space-y-2.5">
          {jobsList.map((job) => (
            <div 
              key={job.id}
              className="bg-slate-900/90 border border-slate-800 hover:border-emerald-500/70 rounded-xl p-3 flex items-center justify-between gap-3 transition"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="text-2xl p-2 bg-slate-950 rounded-lg border border-slate-800 flex-shrink-0">
                  {job.icon}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-white truncate">{job.name}</h3>
                    <span className="px-1.5 py-0.2 bg-emerald-500/20 border border-emerald-500/40 rounded text-emerald-300 font-mono text-[9px] font-bold">
                      +{job.reward}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">{job.desc}</p>
                </div>
              </div>

              <button
                onClick={() => {
                  onSelectJob(job.id);
                  onClose();
                }}
                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow flex-shrink-0 transition"
              >
                Trabalhar
              </button>
            </div>
          ))}
        </div>

        <div className="p-3 bg-slate-950 border-t border-slate-800 text-center">
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-white font-medium"
          >
            Voltar à Cidade
          </button>
        </div>

      </div>
    </div>
  );
};
