// File validation utilities

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_EXTENSIONS = [
  'pdf', 'doc', 'docx', 'txt', 'xlsx', 'xls', 'ppt', 'pptx', 
  'jpg', 'jpeg', 'png', 'gif'
];

// Magic numbers (file signatures) for validation
const FILE_SIGNATURES = {
  'pdf': [0x25, 0x50, 0x44, 0x46], // %PDF
  'png': [0x89, 0x50, 0x4E, 0x47],
  'jpg': [0xFF, 0xD8, 0xFF],
  'gif': [0x47, 0x49, 0x46],
  'docx': [0x50, 0x4B, 0x03, 0x04], // ZIP-based
  'xlsx': [0x50, 0x4B, 0x03, 0x04], // ZIP-based
  'pptx': [0x50, 0x4B, 0x03, 0x04], // ZIP-based
};

// Check file signature (magic number)
const checkFileSignature = async (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = (e) => {
      const arr = new Uint8Array(e.target.result).subarray(0, 4);
      const extension = file.name.split('.').pop().toLowerCase();
      
      // For text files, we can't check signature easily
      if (extension === 'txt') {
        resolve(true);
        return;
      }
      
      // Check if file signature matches
      const signature = FILE_SIGNATURES[extension];
      if (!signature) {
        resolve(true); // Unknown type, let it pass
        return;
      }
      
      const matches = signature.every((byte, index) => arr[index] === byte);
      resolve(matches);
    };
    reader.readAsArrayBuffer(file.slice(0, 4));
  });
};

// Validate file
export const validateFile = async (file) => {
  const errors = [];
  
  // Check if file exists
  if (!file) {
    return { valid: false, errors: ['No file provided'] };
  }
  
  // Check file size
  if (file.size === 0) {
    return { 
      valid: false, 
      errors: ['File is empty'],
      scenario: 'EMPTY_FILE'
    };
  }
  
  if (file.size > MAX_FILE_SIZE) {
    errors.push(`File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`);
  }
  
  // Check file extension
  const extension = file.name.split('.').pop().toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    errors.push(`File type .${extension} is not supported`);
  }
  
  // Check file signature (detect corrupted/fake files)
  const signatureValid = await checkFileSignature(file);
  if (!signatureValid) {
    return {
      valid: false,
      errors: [`File appears to be corrupted or not a valid .${extension} file`],
      scenario: 'CORRUPTED_FILE'
    };
  }
  
  // Check for suspicious file names
  const suspiciousPatterns = ['.exe', '.bat', '.cmd', '.sh', '.ps1'];
  if (suspiciousPatterns.some(pattern => file.name.toLowerCase().includes(pattern))) {
    return {
      valid: false,
      errors: ['File appears to be unsafe or executable'],
      scenario: 'UNSAFE_FILE'
    };
  }
  
  if (errors.length > 0) {
    return { valid: false, errors };
  }
  
  return { valid: true, errors: [] };
};

// Validate multiple files
export const validateFiles = async (files) => {
  const results = await Promise.all(
    files.map(async (file) => ({
      file,
      validation: await validateFile(file)
    }))
  );
  
  return results;
};

// Generate default summary based on scenario
export const generateDefaultSummary = (scenario, fileName = 'document') => {
  const summaries = {
    EMPTY_FILE: {
      title: '⚠️ Empty File Detected',
      summary: `The file "${fileName}" appears to be empty and contains no content to summarize.\n\n**Possible reasons:**\n• The file was not saved properly\n• The file is corrupted\n• The file format is not readable\n\n**Recommendation:** Please check the original file and try uploading again.`,
      type: 'warning'
    },
    CORRUPTED_FILE: {
      title: '❌ Corrupted File Detected',
      summary: `The file "${fileName}" appears to be corrupted or damaged.\n\n**Issue Details:**\n• File signature does not match the file extension\n• The file structure is invalid\n• Content cannot be reliably extracted\n\n**Recommendation:** Try to repair the file or upload a different version.`,
      type: 'error'
    },
    UNSAFE_FILE: {
      title: '🛡️ Unsafe File Detected',
      summary: `The file "${fileName}" has been flagged as potentially unsafe.\n\n**Security Concerns:**\n• File may contain executable code\n• File type is not permitted for security reasons\n• Suspicious file extension detected\n\n**Action Required:** For your security, this file cannot be processed. Please only upload document files (PDF, Word, Excel, etc.).`,
      type: 'error'
    },
    NO_FILES: {
      title: '📄 No Files Uploaded',
      summary: `No files have been uploaded yet.\n\n**To get started:**\n1. Click the upload area or drag files\n2. Select one or more documents\n3. Choose your summary preferences\n4. Click "Summarize" to generate insights\n\n**Supported formats:** PDF, Word, Excel, PowerPoint, Images, Text files`,
      type: 'info'
    },
    PROCESSING_ERROR: {
      title: '⚠️ Processing Error',
      summary: `An error occurred while processing "${fileName}".\n\n**Common causes:**\n• File format is not fully supported\n• File contains encrypted or password-protected content\n• Network connection issue\n\n**Recommendation:** Try uploading the file again or convert it to a different format.`,
      type: 'error'
    }
  };
  
  return summaries[scenario] || summaries.NO_FILES;
};