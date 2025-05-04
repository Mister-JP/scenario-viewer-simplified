// src/utils/logger.ts
export function log(step: string, details?: any) {
    const timestamp = new Date().toISOString();
    console.log(`\x1b[36m[${timestamp}] STEP: ${step}\x1b[0m`);
    if (details) {
      console.log(`\x1b[90m${JSON.stringify(details, null, 2)}\x1b[0m`);
    }
  }
  
  export function error(step: string, error?: any) {
    const timestamp = new Date().toISOString();
    console.error(`\x1b[31m[${timestamp}] ERROR: ${step}\x1b[0m`);
    if (error) {
      console.error(error);
    }
  }
  
  export function success(step: string, details?: any) {
    const timestamp = new Date().toISOString();
    console.log(`\x1b[32m[${timestamp}] SUCCESS: ${step}\x1b[0m`);
    if (details) {
      console.log(`\x1b[90m${JSON.stringify(details, null, 2)}\x1b[0m`);
    }
  }