'use client';
import { ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';

export default function Button({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={clsx(
        'rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-black disabled:opacity-50',
        className
      )}
    />
  );
}
