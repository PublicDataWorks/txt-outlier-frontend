import { Upload, File, X } from 'lucide-react';
import { useState, useRef } from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface CsvUploaderProps {
  onUpload: (file: File, recipientCount: number) => void;
  currentFile: File | null;
}

export function CsvUploader({ onUpload, currentFile }: CsvUploaderProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [recipientCount, setRecipientCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (selectedFile: File) => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setError(null);

    try {
      // Check if it's a CSV file
      if (!selectedFile.name.endsWith('.csv')) {
        setError('Please upload a CSV file');
        setIsProcessing(false);
        return;
      }

      // Read the CSV file to count recipients
      const text = await selectedFile.text();

      // Split by new line and filter out empty lines
      const lines = text
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

      if (lines.length === 0) {
        setError('No recipients found in the CSV file');
        setUploadSuccess(false);
      } else {
        setRecipientCount(lines.length);
        onUpload(selectedFile, lines.length);
        setUploadSuccess(true);
      }
    } catch (err) {
      setError('Failed to parse the CSV file');
      console.error(err);
      setUploadSuccess(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      await processFile(selectedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      await processFile(droppedFile);
    }
  };

  const clearFile = () => {
    setError(null);
    setUploadSuccess(false);
    setRecipientCount(0);
    onUpload(null as any, 0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-md p-6 text-center ${
          error
            ? 'border-red-300'
            : uploadSuccess
              ? 'border-green-300'
              : 'border-gray-300'
        } hover:border-gray-400 cursor-pointer transition-colors`}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".csv"
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center space-y-2">
          {isProcessing ? (
            <div className="text-sm text-gray-600">Processing file...</div>
          ) : currentFile ? (
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2">
                <File className="h-5 w-5" />
                <span className="text-sm font-medium">{currentFile.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearFile();
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              {recipientCount > 0 && (
                <p className="text-xs text-gray-600">
                  {recipientCount.toLocaleString()} recipients
                </p>
              )}
            </div>
          ) : (
            <>
              <Upload className="h-8 w-8 text-gray-400" />
              <div className="text-sm text-gray-600">
                <p>
                  <span className="font-semibold">Click to upload</span> or drag
                  and drop
                </p>
                <p className="text-xs text-gray-400">
                  CSV with one phone number per line
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
