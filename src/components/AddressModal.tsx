import React from 'react';
import { UserAddress } from '../types';

interface Props {
  isOpen: boolean;
  addresses: UserAddress[];
  selectedAddress: UserAddress;
  onSelect: (address: UserAddress) => void;
  onClose: () => void;
}

export const AddressModal: React.FC<Props> = ({ isOpen, addresses, selectedAddress, onSelect, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl p-6 w-full max-w-sm space-y-4 max-h-[80vh] overflow-y-auto">
        <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">Select Address</h3>
        <div className="space-y-3">
          {addresses.map((addr) => (
            <button
              key={addr.id}
              onClick={() => onSelect(addr)}
              className={`w-full text-left p-4 rounded-2xl border ${selectedAddress.id === addr.id ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-900/30' : 'border-slate-200 dark:border-slate-700'}`}
            >
              <p className="font-bold text-xs">{addr.fullName}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">{addr.house}, {addr.area}, {addr.city}</p>
            </button>
          ))}
        </div>
        <button onClick={onClose} className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 text-white dark:text-slate-200 font-bold text-xs">Close</button>
      </div>
    </div>
  );
};
