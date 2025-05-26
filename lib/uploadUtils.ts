import { supabase } from "@/lib/supabaseClient"
import { v4 as uuidv4 } from "uuid" // You'll need to install this package

/**
 * Uploads an image to Supabase Storage and returns the public URL
 * @param file The file to upload
 * @param bucket The storage bucket to upload to (MUST already exist in your Supabase project)
 * @param folder The folder within the bucket
 * @returns The public URL of the uploaded image
 */
export async function uploadServiceImage(
    file: File,
    knownBucketName = "services" // IMPORTANT: Use the exact bucket name from your Supabase dashboard
  ): Promise<string> {
    try {
      // Generate a unique filename
      const fileExt = file.name.split(".").pop() || "jpg"
      const fileName = `${uuidv4()}.${fileExt}`
      
      // Skip folder structure - upload directly to bucket root to avoid path issues
      const filePath = fileName
      
      // Direct upload attempt - don't check buckets first
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(knownBucketName)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true // Use upsert to avoid conflicts
        })
      
      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message || "Unknown error"}`)
      }
      
      // Get the public URL for the file
      const { data: urlData } = supabase.storage
        .from(knownBucketName)
        .getPublicUrl(filePath)
      
      if (!urlData?.publicUrl) {
        throw new Error("Failed to get public URL for uploaded file")
      }
      
      return urlData.publicUrl
    } catch (error) {
      throw error
    }
  }
/**
 * Deletes an image from Supabase Storage
 * @param url The public URL of the image to delete
 * @param bucket The storage bucket the image is stored in
 * @returns A boolean indicating whether the deletion was successful
 */
export async function deleteServiceImage(
  url: string,
  bucket = "services" // Changed from "service-images" to "services" to match the bucket name above
): Promise<boolean> {
  try {
    // Extract the file path from the URL
    const urlObj = new URL(url)
    const pathParts = urlObj.pathname.split("/")
    
    // Find the bucket index in the path
    const bucketIndex = pathParts.indexOf(bucket)
    
    if (bucketIndex === -1) {
      return false
    }
    
    const filePath = pathParts.slice(bucketIndex + 1).join("/")

    // Delete the file from Supabase Storage
    const { error } = await supabase.storage.from(bucket).remove([filePath])

    if (error) {
      throw error
    }

    return true
  } catch (error) {
    return false
  }
}

export const generateUniqueFileName = (originalFile: File, bookingRef?: string, index?: number): string => {
  // Get file extension
  const fileExtension = originalFile.name.split('.').pop()?.toLowerCase() || 'jpg';
  
  // Generate multiple layers of uniqueness
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 15);
  const uuid = crypto.randomUUID ? crypto.randomUUID() : `${timestamp}_${randomId}`;
  const bookingPrefix = bookingRef ? `${bookingRef}_` : '';
  const indexSuffix = typeof index === 'number' ? `_${index}` : '';
  
  // Create ultra-unique filename
  const uniqueFileName = `${bookingPrefix}${uuid}${indexSuffix}_${timestamp}.${fileExtension}`;
  
  console.log(`📸 Generated unique filename: ${originalFile.name} → ${uniqueFileName}`);
  
  return uniqueFileName;
};

export const createUniqueFile = (originalFile: File, bookingRef?: string, index?: number): File => {
  const uniqueFileName = generateUniqueFileName(originalFile, bookingRef, index);
  
  return new File([originalFile], uniqueFileName, {
    type: originalFile.type,
    lastModified: originalFile.lastModified
  });
};