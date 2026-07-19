import Icon from '@/components/ui/icon';

const OrnateDivider = ({ className = '' }: { className?: string }) => {
  return (
    <div className={`flex items-center justify-center gap-4 ${className}`}>
      <span className="h-px w-16 md:w-32 bg-gradient-to-r from-transparent to-gold/60" />
      <Icon name="Shield" size={18} className="text-gold" />
      <span className="h-px w-16 md:w-32 bg-gradient-to-l from-transparent to-gold/60" />
    </div>
  );
};

export default OrnateDivider;
