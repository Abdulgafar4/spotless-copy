"use client"

import { toast } from "sonner"
import { AlertCircle, FileX, Upload } from "lucide-react"
import { ChangeEvent, useState } from "react"
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from "./booking-types"
import { FormDescription } from "@/components/ui/form"

interface FileUploadProps {
  files: File[]
  setFiles: (files: File[]) => void
  required?: boolean
  maxFiles?: number
  maxFileSize?: number
  allowedFileTypes?: string[]
  title?: string
  description?: string
  className?: string
  compact?: boolean // For smaller UI like QuickBooking
  showPreview?: boolean
  previewCols?: number
}

export function FileUpload({ 
  files, 
  setFiles, 
  required = true,
  maxFiles = 10,
  maxFileSize = MAX_FILE_SIZE,
  allowedFileTypes = ALLOWED_FILE_TYPES,
  title = "Upload Property Photos",
  description = "Drag/Drop to Upload Property Photos",
  className = "",
  compact = false,
  showPreview = true,
  previewCols = 3
}: FileUploadProps) {
  const [fileErrors, setFileErrors] = useState<string[]>([])

  // Generate a unique filename to avoid Supabase storage conflicts
  const createUniqueFile = (file: File): File => {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 10);
    const uuid = crypto.randomUUID ? crypto.randomUUID() : `${timestamp}${randomString}`;
    const fileExt = file.name.split('.').pop();
    const uniqueName = `upload_${uuid}.${fileExt}`;
    
    return new File([file], uniqueName, { type: file.type });
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      const errors: string[] = []
      
      const validFiles = newFiles.filter(file => {
        // Check file type
        if (!allowedFileTypes.includes(file.type)) {
          errors.push(`"${file.name}" is not a valid image format. Please use JPG, PNG, or WebP.`)
          return false
        }
        
        // Check file size
        if (file.size > maxFileSize) {
          const maxSizeMB = Math.round(maxFileSize / (1024 * 1024));
          errors.push(`"${file.name}" exceeds the maximum size of ${maxSizeMB}MB.`)
          return false
        }
        
        return true
      })
      
      // Create unique files to avoid Supabase conflicts
      const uniqueFiles = validFiles.map(file => createUniqueFile(file));
      
      // Check total file limit
      if (files.length + uniqueFiles.length <= maxFiles) {
        setFiles([...files, ...uniqueFiles])
      } else {
        errors.push(`Maximum ${maxFiles} images allowed`)
      }
      
      setFileErrors(errors)
      
      if (errors.length > 0) {
        errors.forEach(error => toast.error(error))
      }
    }
  }
  
  // Remove file from the list
  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  // Get original filename for display (strip the unique prefix)
  const getDisplayName = (file: File): string => {
    // If it's one of our unique files, extract the original name
    if (file.name.startsWith('upload_')) {
      const fileExt = file.name.split('.').pop();
      return `File.${fileExt}`;
    }
    return file.name;
  }

  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  const maxSizeMB = Math.round(maxFileSize / (1024 * 1024));
  const acceptedFormats = allowedFileTypes.map(type => {
    switch(type) {
      case 'image/jpeg': return 'JPG';
      case 'image/jpg': return 'JPG';
      case 'image/png': return 'PNG';
      case 'image/webp': return 'WebP';
      default: return type.split('/')[1]?.toUpperCase() || 'Unknown';
    }
  }).join(', ');

  return (
    <div className={`${className}`}>
      {!compact && title && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {title}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className={`border-2 border-dashed border-gray-300 rounded-lg text-center ${
        compact ? 'p-4' : 'p-6'
      }`}>
        <Upload className={`text-gray-400 mb-2 mx-auto ${
          compact ? 'w-8 h-8' : 'w-12 h-12'
        }`} />
        
        <p className={`text-gray-600 mb-2 ${
          compact ? 'text-xs' : 'text-sm'
        }`}>
          {description}
          {required && <span className="text-red-500">*</span>}
        </p>
        
        <div className={`flex flex-col space-y-1 text-gray-500 mb-4 ${
          compact ? 'text-xs' : 'text-xs'
        }`}>
          <p>Maximum {maxFiles} images</p>
          <p>Accepted formats: {acceptedFormats}</p>
          <p>Maximum file size: {maxSizeMB}MB per image</p>
          {required && (
            <FormDescription className="text-xs text-red-500">
              At least one property photo is required
            </FormDescription>
          )}
        </div>
        
        <input 
          type="file" 
          id="file-upload" 
          className="hidden" 
          multiple 
          accept={allowedFileTypes.join(',')}
          onChange={handleFileChange} 
        />
        
        <label 
          htmlFor="file-upload" 
          className={`cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-md ${
            compact ? 'px-3 py-1 text-xs' : 'px-4 py-2 text-sm'
          }`}
        >
          Select Files
        </label>
      </div>
      
      {/* File List */}
      {files.length > 0 && showPreview && (
        <div className="mt-4">
          <h4 className={`font-medium mb-2 text-left ${
            compact ? 'text-xs' : 'text-sm'
          }`}>
            Selected Files ({files.length}):
          </h4>
          
          {compact ? (
            // Compact view for QuickBooking
            <div className={`grid gap-2 ${previewCols === 3 ? 'grid-cols-3' : 'grid-cols-4'}`}>
              {files.map((file, index) => (
                <div key={index} className="relative group">
                  <div className="h-16 w-full rounded-md overflow-hidden border border-gray-200">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Upload ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          ) : (
            // Detailed view for MainBookingForm
            <div className="space-y-2">
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-md overflow-hidden border border-gray-200">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                        {getDisplayName(file)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <FileX className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Simple list view for no preview */}
      {files.length > 0 && !showPreview && (
        <div className="mt-4">
          <h4 className="font-medium text-sm mb-2 text-left">Selected Files ({files.length}):</h4>
          <div className="flex flex-wrap gap-2">
            {files.map((file, index) => (
              <div key={index} className="flex items-center bg-gray-100 px-2 py-1 rounded text-xs">
                <span className="truncate max-w-xs">{getDisplayName(file)}</span>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  <FileX className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Error Display */}
      {fileErrors.length > 0 && (
        <div className="mt-4 text-left">
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-red-800">File upload issues:</h4>
                <ul className="list-disc pl-5 mt-1 text-xs text-red-700 space-y-1">
                  {fileErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}