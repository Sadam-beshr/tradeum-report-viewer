
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subvalue?: string;
  icon?: ReactNode;
  isProfit?: boolean;
  isLoss?: boolean;
  className?: string;
}

const StatCard = ({
  title,
  value,
  subvalue,
  icon,
  isProfit = false,
  isLoss = false,
  className,
}: StatCardProps) => {
  return (
    <div className={cn('stat-card flex flex-col', className)}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-muted-foreground">{title}</span>
        {icon && <span>{icon}</span>}
      </div>
      <div className="flex flex-col gap-1">
        <h3 
          className={cn(
            'text-3xl font-bold', 
            isProfit && 'text-profit',
            isLoss && 'text-loss'
          )}
        >
          {value}
        </h3>
        {subvalue && (
          <p className="text-sm text-muted-foreground">{subvalue}</p>
        )}
      </div>
    </div>
  );
};

export default StatCard;
