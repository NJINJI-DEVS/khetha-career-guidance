import { useId, useState } from 'react';

export function DocumentPicker({ label, hint, value, onChange }) {
  const id = useId();
  const [error, setError] = useState('');
  return <div>
    <label htmlFor={id} className="text-xs font-medium text-slate-700">{label}</label>
    <input id={id} type="file" accept=".pdf,.png,.jpg,.jpeg" className="mt-2 block w-full rounded-xl border border-dashed p-3 text-xs"
      onChange={(event) => {
        const file = event.target.files?.[0];
        setError('');
        if (!file) return;
        if (file.size > 5 * 1024 * 1024 || !/\.(pdf|png|jpe?g)$/i.test(file.name)) {
          setError('Choose a PDF, PNG or JPEG no larger than 5 MB.');
          event.target.value = ''; onChange(null); return;
        }
        onChange(file);
      }} />
    <p className="mt-1 text-[11px] text-slate-600">{value ? `${value.name} — ready to submit` : `PDF, PNG or JPEG, up to 5 MB. ${hint || ''}`}</p>
    {error && <p role="alert" className="text-xs text-red-700">{error}</p>}
  </div>;
}
