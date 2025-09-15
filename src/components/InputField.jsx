import React from 'react';

const InputField = ({ 
  label, 
  type = 'text', 
  name, 
  value, 
  onChange, 
  error, 
  required = false,
  placeholder,
  children
}) => {
  return (
    <div className="mb-6">
      <label htmlFor={name} className="block text-sm font-bold text-gray-300 mb-3 uppercase tracking-wide">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {children ? (
        children
      ) : (
        <input
          type={type}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`gaming-input w-full p-4 rounded-lg focus:ring-2 focus:ring-orange-500 transition-all duration-300 ${
            error ? 'border-red-500 bg-red-900/20' : ''
          }`}
          required={required}
        />
      )}
      {error && (
        <p className="mt-2 text-sm text-red-400 flex items-center animate-bounce-in">
          <span className="mr-2 text-lg">⚠️</span>
          {error}
        </p>
      )}
    </div>
  );
};

export default InputField;