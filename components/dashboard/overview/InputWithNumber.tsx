"use client";

import React from "react";
import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";

interface InputWithNumberProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  onChange: (value: number) => void;
  error?: string;
}

export function InputWithNumber({
  icon,
  label,
  value,
  onChange,
  error
}: InputWithNumberProps) {
  const handleIncrement = () => {
    onChange(value + 1);
  };

  const handleDecrement = () => {
    if (value > 0) {
      onChange(value - 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10);
    if (!isNaN(newValue) && newValue >= 0) {
      onChange(newValue);
    }
  };

  return (
    <div className="space-y-1">
      <div className="text-xs font-medium flex items-center">
        {icon}
        <span className="ml-1">{label}</span>
      </div>
      <div className="flex">
        <button
          type="button"
          onClick={handleDecrement}
          className="flex items-center justify-center h-9 w-9 bg-gray-100 rounded-l-md hover:bg-gray-200"
        >
          <Minus className="h-3 w-3" />
        </button>
        <Input
          type="number"
          min={0}
          value={value}
          onChange={handleInputChange}
          className="h-9 text-center rounded-none border-x-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <button
          type="button"
          onClick={handleIncrement}
          className="flex items-center justify-center h-9 w-9 bg-gray-100 rounded-r-md hover:bg-gray-200"
        >
          <Plus className="h-3 w-3" />
        </button>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}