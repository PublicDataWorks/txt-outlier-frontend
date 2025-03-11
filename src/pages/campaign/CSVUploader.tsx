import { Upload, File, X } from 'lucide-react';
import { useState, useRef } from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface CsvUploaderProps {
  onUpload: (recipients: string[]) => void;
  recipientCount: number;
}

export function CsvUploader({ onUpload }: CsvUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (selectedFile: File) => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setError(null);

    try {
      // Check if it's a CSV file
      if (!selectedFile.name.endsWith('.csv')) {
        setError('Please upload a CSV file');
        setFile(null);
        setIsProcessing(false);
        return;
      }

      // Read the CSV file
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
        setFile(selectedFile);
        onUpload(lines);
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
    setFile(null);
    setError(null);
    setUploadSuccess(false);
    onUpload([]);
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
          ) : file ? (
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2">
                <File className="h-5 w-5" />
                <span className="text-sm font-medium">{file.name}</span>
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
