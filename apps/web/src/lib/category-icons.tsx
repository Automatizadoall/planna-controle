import {
  Utensils,
  Car,
  Home,
  Clapperboard,
  HeartPulse,
  BookOpen,
  ShoppingCart,
  Smartphone,
  Plane,
  Gift,
  Dumbbell,
  CircleDot,
  Wine,
  Briefcase,
  Laptop,
  TrendingUp,
  Wallet,
  Banknote,
  Gamepad,
  // Goal icons
  Target,
  GraduationCap,
  Gem,
  Baby,
  Palmtree,
  Guitar,
  PiggyBank,
  Camera,
  Music,
  Globe,
} from 'lucide-react';

// Mapeamento de ícones para categorias e metas
export const CATEGORY_ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  // Categorias
  'lucide:utensils': Utensils,
  'lucide:car': Car,
  'lucide:home': Home,
  'lucide:clapperboard': Clapperboard,
  'lucide:heart-pulse': HeartPulse,
  'lucide:book-open': BookOpen,
  'lucide:shopping-cart': ShoppingCart,
  'lucide:smartphone': Smartphone,
  'lucide:plane': Plane,
  'lucide:gift': Gift,
  'lucide:dumbbell': Dumbbell,
  'lucide:football': CircleDot,
  'lucide:wine': Wine,
  'lucide:briefcase': Briefcase,
  'lucide:laptop': Laptop,
  'lucide:trending-up': TrendingUp,
  'lucide:wallet': Wallet,
  'lucide:banknote': Banknote,
  'lucide:gamepad': Gamepad,
  // Metas
  'lucide:target': Target,
  'lucide:graduation-cap': GraduationCap,
  'lucide:gem': Gem,
  'lucide:baby': Baby,
  'lucide:palmtree': Palmtree,
  'lucide:guitar': Guitar,
  'lucide:piggy-bank': PiggyBank,
  'lucide:camera': Camera,
  'lucide:music': Music,
  'lucide:globe': Globe,
};

export function CategoryIcon({ icon, className }: { icon: string; className?: string }) {
  // Se for um ícone no formato "lucide:xxx", usa o mapeamento
  if (icon?.startsWith('lucide:')) {
    const Comp = CATEGORY_ICON_MAP[icon];
    if (Comp) return <Comp className={className} />;
  }
  
  // Caso contrário, assume que é um emoji ou texto e exibe diretamente (retrocompatível)
  return <span className={className}>{icon || '📦'}</span>;
}
