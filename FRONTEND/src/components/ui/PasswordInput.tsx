import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  iconLeft?: React.ReactNode;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  iconLeft,
  className = '',
  id,
  value,
  onChange,
  placeholder = '••••••••',
  required,
  disabled,
  autoComplete = 'current-password',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative flex items-center">
      {iconLeft && (
        <div className="absolute left-3 flex items-center pointer-events-none text-zinc-400">
          {iconLeft}
        </div>
      )}
      <input
        id={id}
        type={showPassword ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        autoComplete={autoComplete}
        className={`w-full py-2 text-sm bg-white border border-zinc-300 rounded-lg text-zinc-900 placeholder-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 transition-colors disabled:bg-zinc-100 disabled:cursor-not-allowed ${
          iconLeft ? 'pl-9' : 'pl-3'
        } pr-10 ${className}`}
        {...props}
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setShowPassword(!showPassword)}
        disabled={disabled}
        className="absolute right-2.5 p-1 text-zinc-400 hover:text-zinc-700 transition-colors focus:outline-hidden disabled:opacity-50"
        title={showPassword ? 'Hide password' : 'Show password'}
      >
        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
};

export default PasswordInput;

