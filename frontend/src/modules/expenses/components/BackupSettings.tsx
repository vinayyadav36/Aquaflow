import { useRef } from 'react';
import { useExpenseBackup } from '../hooks/useExpenseBackup';

export function BackupSettings() {
  const { handleExport, handleImport, isExporting, isImporting, error, success, clearMessages } = useExpenseBackup();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImport(file);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Data Backup & Restore</h3>
      <p className="text-sm text-gray-600 mb-6">
        Export your expenses data for safekeeping or import an existing backup. Data is stored locally on this device.
      </p>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm mb-4">
          {error}
          <button onClick={clearMessages} className="ml-2 font-bold underline">Dismiss</button>
        </div>
      )}

      {success && (
        <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm mb-4">
          {success}
          <button onClick={clearMessages} className="ml-2 font-bold underline">Dismiss</button>
        </div>
      )}

      <div className="flex gap-4">
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50"
        >
          {isExporting ? 'Exporting...' : 'Export Backup'}
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isImporting}
          className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          {isImporting ? 'Importing...' : 'Import Backup'}
        </button>
        <input
          type="file"
          accept=".json"
          ref={fileInputRef}
          onChange={onFileChange}
          className="hidden"
        />
      </div>
    </div>
  );
}
