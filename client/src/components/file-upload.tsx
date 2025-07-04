import { useState } from "react";
import { Upload, FileCode, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FileUploadProps {
  label: string;
  icon?: React.ReactNode;
  onFileSelect: (file: File) => void;
  accept?: string;
  className?: string;
}

export default function FileUpload({ label, icon, onFileSelect, accept = "*", className = "" }: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      onFileSelect(file);
    }
  };

  return (
    <div className={`file-upload-area p-6 rounded-xl space-y-4 ${className}`}>
      <div className="text-center">
        {icon || <FileCode className="w-16 h-16 text-gray-400 mx-auto mb-4" />}
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {label}
        </label>
        <div className="flex items-center justify-center">
          <Button
            type="button"
            className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-6 rounded-lg transition-colors shadow-lg"
            onClick={() => document.getElementById(`file-${label.replace(/\s+/g, '-').toLowerCase()}`)?.click()}
          >
            <Upload className="w-4 h-4 mr-2" />
            Parcourir...
          </Button>
          <input
            id={`file-${label.replace(/\s+/g, '-').toLowerCase()}`}
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
        <span className={`block mt-2 text-sm ${selectedFile ? 'text-green-400' : 'text-gray-400'}`}>
          {selectedFile ? selectedFile.name : 'Aucun fichier choisi'}
        </span>
      </div>
    </div>
  );
}
