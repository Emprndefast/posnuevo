import * as React from 'react';
import { cn } from '../../lib/utils';

export function Accordion({ children, className, ...props }) {
  return (
    <div className={cn('space-y-2', className)} {...props}>
      {children}
    </div>
  );
}

export function AccordionItem({ value, children }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div>
      {React.Children.map(children, (child) =>
        React.cloneElement(child, {
          open,
          setOpen,
        })
      )}
    </div>
  );
}

export function AccordionTrigger({ children, open, setOpen }) {
  return (
    <button
      type="button"
      className={cn('w-full flex items-center justify-between py-2 font-medium')}
      onClick={() => setOpen(!open)}
    >
      {children}
      <span>{open ? '▲' : '▼'}</span>
    </button>
  );
}

export function AccordionContent({ children, open }) {
  return open ? <div className="pt-2">{children}</div> : null;
}
