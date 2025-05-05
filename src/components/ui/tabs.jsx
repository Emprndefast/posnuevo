import * as React from 'react';

export function Tabs({ value, onValueChange, children, className }) {
  return (
    <div className={className}>
      {React.Children.map(children, (child) =>
        React.cloneElement(child, {
          isActive: child.props.value === value,
          onClick: () => onValueChange(child.props.value),
        })
      )}
    </div>
  );
}

export function Tab({ value, icon, children, isActive, onClick }) {
  return (
    <button
      className={`px-4 py-2 border-b-2 ${isActive ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-primary'}`}
      onClick={onClick}
      type="button"
    >
      {icon}
      <span className="ml-2">{children}</span>
    </button>
  );
}
