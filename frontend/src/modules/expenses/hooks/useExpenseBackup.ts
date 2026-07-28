import { useState } from 'react';
import { backupService } from '../api/backupService';

export function useExpenseBackup() {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleExport = async () => {
    setIsExporting(true);
    setError(null);
    setSuccess(null);
    try {
      const jsonData = await backupService.exportData();
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `expenses_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setSuccess('Backup exported successfully.');
    } catch (e: any) {
      setError(e.message || 'Failed to export backup.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (file: File) => {
    setIsImporting(true);
    setError(null);
    setSuccess(null);
    try {
      const text = await file.text();
      await backupService.importData(text);
      setSuccess('Backup imported and merged successfully.');
      // Optionally trigger a reload or context refresh here if needed
    } catch (e: any) {
      setError(e.message || 'Failed to import backup.');
    } finally {
      setIsImporting(false);
    }
  };

  return {
    handleExport,
    handleImport,
    isExporting,
    isImporting,
    error,
    success,
    clearMessages: () => {
      setError(null);
      setSuccess(null);
    }
  };
}
