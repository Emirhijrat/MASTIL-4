/**
 * Utility functions for error handling and formatting
 */

// Define type for React ErrorInfo without importing from React
type ErrorInfo = {
  componentStack: string;
};

/**
 * Formats an error into a structured string for reporting
 */
export function formatErrorForReporting(
  error: Error | unknown,
  errorInfo?: ErrorInfo | null,
  additionalInfo: Record<string, string> = {}
): string {
  const timestamp = new Date().toISOString();
  const userAgent = navigator.userAgent;
  
  // Get version from package.json
  const gameVersion = '1.0.4'; // From package.json
  
  // Handle case where error is not an Error object
  const errorObject = error instanceof Error 
    ? error 
    : new Error(String(error));

  let formattedError = `JAVASCRIPT ERROR REPORT:
-------------------------
Timestamp: ${timestamp}
Error Message: ${errorObject.message}
Error Name: ${errorObject.name}
--- Stack Trace ---
${errorObject.stack || 'No stack trace available'}`;

  // Add React component stack if available
  if (errorInfo?.componentStack) {
    formattedError += `
--- React Component Stack ---
${errorInfo.componentStack}`;
  }

  // Add any additional info
  if (Object.keys(additionalInfo).length > 0) {
    formattedError += `
--- Additional Information ---`;
    
    for (const [key, value] of Object.entries(additionalInfo)) {
      formattedError += `
${key}: ${value}`;
    }
  }

  formattedError += `
-------------------------
Game Version: ${gameVersion}
User Agent: ${userAgent}`;

  return formattedError;
}

/**
 * Copies formatted error text to clipboard
 */
export function copyErrorToClipboard(
  error: Error | unknown,
  errorInfo?: ErrorInfo | null
): Promise<boolean> {
  const formattedError = formatErrorForReporting(error, errorInfo);
  
  return navigator.clipboard.writeText(formattedError)
    .then(() => true)
    .catch((err) => {
      console.error('Failed to copy error to clipboard:', err);
      return false;
    });
} 