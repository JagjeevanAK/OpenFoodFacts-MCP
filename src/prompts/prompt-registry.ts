import { GetPromptRequestSchema, Prompt } from "@modelcontextprotocol/sdk/types.js";
import { rootsRegistry } from "../roots/index.js";
import { projectRoot } from "../config/server-config.js";
import fs from 'fs';
import path from 'path';

interface ExtendedPrompt extends Prompt {
  developerOnly?: boolean;
}

export const PROMPTS: Record<string, ExtendedPrompt> = {
  "analyze-product": {
    name: "analyze-product",
    description: "Analyze a food product based on its barcode",
    arguments: [
      {
        name: "barcode",
        description: "The product barcode (EAN, UPC, etc.)",
        required: true
      }
    ]
  },
  "compare-products": {
    name: "compare-products",
    description: "Compare nutrition information between two products",
    arguments: [
      {
        name: "barcode1",
        description: "First product barcode",
        required: true
      },
      {
        name: "barcode2",
        description: "Second product barcode",
        required: true
      }
    ]
  },
  "check-additives": {
    name: "check-additives",
    description: "Check if a product contains questionable additives",
    arguments: [
      {
        name: "barcode",
        description: "The product barcode (EAN, UPC, etc.)",
        required: true
      }
    ]
  },

  // Developer-focused prompts - only available in developer mode
  "debug-perl-code": {
    name: "debug-perl-code",
    description: "Get help debugging Perl code in the Open Food Facts codebase",
    developerOnly: true,
    arguments: [
      {
        name: "errorMessage",
        description: "The error message or unexpected behavior",
        required: true
      },
      {
        name: "filePath",
        description: "Path to the Perl file with the issue (relative to project root)",
        required: true
      }
    ]
  },
  "explain-codebase-structure": {
    name: "explain-codebase-structure",
    description: "Explain the structure and organization of the Open Food Facts codebase",
    developerOnly: true,
    arguments: [
      {
        name: "component",
        description: "Specific component you want to understand (e.g., api, product, taxonomy)",
        required: false
      }
    ]
  },
  "implement-feature": {
    name: "implement-feature",
    description: "Get guidance on implementing a new feature in Open Food Facts",
    developerOnly: true,
    arguments: [
      {
        name: "featureDescription",
        description: "Description of the feature you want to implement",
        required: true
      },
      {
        name: "component",
        description: "Which component will the feature be part of",
        required: false
      }
    ]
  },
  "optimize-mongodb-query": {
    name: "optimize-mongodb-query",
    description: "Get suggestions to optimize MongoDB queries for better performance",
    developerOnly: true,
    arguments: [
      {
        name: "query",
        description: "The MongoDB query you want to optimize",
        required: true
      }
    ]
  },
  "refactor-code": {
    name: "refactor-code",
    description: "Get suggestions on refactoring code for better readability and maintainability",
    developerOnly: true,
    arguments: [
      {
        name: "filePath",
        description: "Path to the file you want to refactor",
        required: true
      },
      {
        name: "codeSnippet",
        description: "The specific code snippet you want to refactor",
        required: false
      }
    ]
  },
  "create-unit-test": {
    name: "create-unit-test", 
    description: "Generate a unit test for a specific function or module",
    developerOnly: true,
    arguments: [
      {
        name: "functionName",
        description: "The name of the function or module to test",
        required: true
      },
      {
        name: "filePath",
        description: "Path to the file containing the function",
        required: false
      }
    ]
  },
  "review-pr": {
    name: "review-pr",
    description: "Get help reviewing a pull request",
    developerOnly: true,
    arguments: [
      {
        name: "prDescription",
        description: "Description or summary of the PR",
        required: true
      },
      {
        name: "changedFiles",
        description: "List of files changed in the PR",
        required: false
      }
    ]
  },
  "investigate-bug": {
    name: "investigate-bug",
    description: "Systematic approach to investigate a bug in the codebase",
    developerOnly: true,
    arguments: [
      {
        name: "bugDescription",
        description: "Description of the bug including any error messages",
        required: true
      },
      {
        name: "reproduceSteps",
        description: "Steps to reproduce the bug",
        required: false
      }
    ]
  },
  "api-usage-example": {
    name: "api-usage-example",
    description: "Get example code for using the Open Food Facts API",
    arguments: [
      {
        name: "endpoint",
        description: "The API endpoint you want to use (e.g., /product, /search)",
        required: true
      },
      {
        name: "language",
        description: "Programming language for the example (e.g., JavaScript, Python, Perl)",
        required: true
      }
    ]
  },
  "document-code": {
    name: "document-code",
    description: "Generate documentation for code or functions",
    developerOnly: true,
    arguments: [
      {
        name: "filePath",
        description: "Path to the file you want to document",
        required: true
      },
      {
        name: "functionName",
        description: "Specific function to document (optional)",
        required: false
      }
    ]
  },

  // Documentation-inspired prompts
  "docker-debug-guide": {
    name: "docker-debug-guide",
    description: "Get help with Docker-related debugging tasks in Open Food Facts",
    developerOnly: true,
    arguments: [
      {
        name: "issue",
        description: "Specific Docker issue you're facing (e.g., logs, permissions, restarting)",
        required: true
      }
    ]
  },
  "enhance-packaging-data": {
    name: "enhance-packaging-data",
    description: "Get guidance on working with packaging data structure in Open Food Facts",
    developerOnly: true,
    arguments: [
      {
        name: "component",
        description: "Specific aspect of packaging data you're working with (e.g., shape, material, recycling)",
        required: false
      },
      {
        name: "feature",
        description: "Feature you're trying to implement related to packaging data",
        required: false
      }
    ]
  },
  "contribute-knowledge-panel": {
    name: "contribute-knowledge-panel",
    description: "Get guidance on creating or modifying knowledge panels",
    developerOnly: true,
    arguments: [
      {
        name: "panelType",
        description: "Type of knowledge panel you want to create (e.g., nutrition, environmental, contribution)",
        required: true
      },
      {
        name: "elements",
        description: "Elements you want to include in the panel (e.g., text, image, map)",
        required: false
      }
    ]
  },
  "setup-dev-environment": {
    name: "setup-dev-environment",
    description: "Get help setting up or troubleshooting your development environment",
    developerOnly: true,
    arguments: [
      {
        name: "flavor",
        description: "Project flavor (openfoodfacts, openbeautyfacts, openpetfoodfacts, openproductsfacts)",
        required: false
      },
      {
        name: "issue",
        description: "Specific setup issue you're encountering",
        required: false
      }
    ]
  },
  "mongodb-query-help": {
    name: "mongodb-query-help",
    description: "Get help with MongoDB queries for Open Food Facts data",
    developerOnly: true,
    arguments: [
      {
        name: "collection",
        description: "MongoDB collection you're working with (e.g., products, categories)",
        required: false
      },
      {
        name: "operation",
        description: "Operation you want to perform (e.g., find, update, aggregate)",
        required: false
      },
      {
        name: "example",
        description: "Example query or objective you're trying to achieve",
        required: true
      }
    ]
  },
  "data-quality-control": {
    name: "data-quality-control",
    description: "Get guidance on implementing data quality controls for Open Food Facts contributions",
    developerOnly: true,
    arguments: [
      {
        name: "dataType",
        description: "Type of data you want to validate (e.g., nutritional values, ingredients, images)",
        required: true
      },
      {
        name: "context",
        description: "Where the control will be implemented (e.g., mobile app, website, API)",
        required: false
      }
    ]
  },
  "taxonomy-guide": {
    name: "taxonomy-guide",
    description: "Get guidance on working with Open Food Facts taxonomies",
    developerOnly: true,
    arguments: [
      {
        name: "taxonomyName",
        description: "Name of taxonomy (e.g., packaging_materials, additives, categories)",
        required: true
      },
      {
        name: "task",
        description: "What you're trying to accomplish with the taxonomy",
        required: false
      }
    ]
  },
  "perl-debugging": {
    name: "perl-debugging",
    description: "Get help with debugging Perl code in the Product Opener codebase",
    developerOnly: true,
    arguments: [
      {
        name: "module",
        description: "Perl module you're working with (e.g., ProductOpener::Tags, ProductOpener::Packaging)",
        required: false
      },
      {
        name: "error",
        description: "Error message or unexpected behavior",
        required: true
      },
      {
        name: "context",
        description: "What you were trying to accomplish",
        required: false
      }
    ]
  },
  "apache-config-help": {
    name: "apache-config-help",
    description: "Get help with Apache configuration for Open Food Facts server",
    developerOnly: true,
    arguments: [
      {
        name: "issue",
        description: "Specific Apache issue or configuration need",
        required: true
      }
    ]
  },
  "implement-api-endpoint": {
    name: "implement-api-endpoint",
    description: "Get guidance on implementing a new API endpoint",
    developerOnly: true,
    arguments: [
      {
        name: "endpoint",
        description: "Endpoint path or name you want to implement",
        required: true
      },
      {
        name: "functionality",
        description: "What the endpoint should do",
        required: true
      },
      {
        name: "method",
        description: "HTTP method (GET, POST, PUT, etc.)",
        required: false
      }
    ]
  },

  // Project Setup & Development Environment prompts
  "setup-local-environment": {
    name: "setup-local-environment",
    description: "Get step-by-step help setting up a local development environment for Open Food Facts",
    developerOnly: true,
    arguments: [
      {
        name: "os",
        description: "Your operating system (e.g., MacOS, Windows, Linux, WSL)",
        required: true
      },
      {
        name: "issue",
        description: "Specific setup issue you're encountering (optional)",
        required: false
      }
    ]
  },
  "docker-makefile-help": {
    name: "docker-makefile-help",
    description: "Get help with Docker and Makefile commands for Open Food Facts development",
    developerOnly: true,
    arguments: [
      {
        name: "command",
        description: "The Makefile command or Docker operation you need help with",
        required: true
      },
      {
        name: "error",
        description: "Error message you're encountering (if applicable)",
        required: false
      }
    ]
  },
  "resolve-common-setup-errors": {
    name: "resolve-common-setup-errors",
    description: "Get solutions for common errors encountered during project setup",
    developerOnly: true,
    arguments: [
      {
        name: "errorType",
        description: "Type of error (e.g., docker, perl, database, grep, network, permissions)",
        required: true
      },
      {
        name: "errorMessage",
        description: "The specific error message you're seeing",
        required: false
      }
    ]
  },
  "gitpod-workflow": {
    name: "gitpod-workflow",
    description: "Get help with using Gitpod for Open Food Facts development",
    developerOnly: true,
    arguments: [
      {
        name: "issue",
        description: "Specific Gitpod issue or workflow question",
        required: true
      }
    ]
  },
  "development-workflows": {
    name: "development-workflows",
    description: "Get guidance on common development workflows for Open Food Facts",
    developerOnly: true,
    arguments: [
      {
        name: "workflow",
        description: "The development workflow you need help with (e.g., testing, debugging, logging)",
        required: true
      }
    ]
  },

  // API Usage prompts
  "api-authentication-guide": {
    name: "api-authentication-guide",
    description: "Get help with API authentication for Open Food Facts",
    developerOnly: true,
    arguments: [
      {
        name: "operation",
        description: "The operation you're trying to perform (read, write, image upload)",
        required: true
      },
      {
        name: "context",
        description: "The context of your API usage (app, website, script)",
        required: false
      }
    ]
  },
  "api-image-operations": {
    name: "api-image-operations",
    description: "Get guidance on handling product images with the Open Food Facts API",
    developerOnly: true,
    arguments: [
      {
        name: "operation",
        description: "The operation you want to perform (upload, download, retrieve)",
        required: true
      },
      {
        name: "scale",
        description: "The scale of your operation (single images, bulk download)",
        required: false
      }
    ]
  },
  "api-country-language-usage": {
    name: "api-country-language-usage",
    description: "Get help with country and language parameters in the Open Food Facts API",
    developerOnly: true,
    arguments: [
      {
        name: "useCase",
        description: "Your specific use case or question about localization",
        required: true
      }
    ]
  },
  "product-data-contribution": {
    name: "product-data-contribution", 
    description: "Get guidance on contributing product data through the API",
    developerOnly: true,
    arguments: [
      {
        name: "dataType",
        description: "Type of data you want to contribute (basic info, nutrition, ingredients, images)",
        required: true
      },
      {
        name: "implementationContext",
        description: "Context of your implementation (mobile app, website, script)",
        required: false
      }
    ]
  },
  "search-api-usage": {
    name: "search-api-usage",
    description: "Get help with using the Open Food Facts search API",
    developerOnly: true,
    arguments: [
      {
        name: "searchType",
        description: "Type of search you want to perform (e.g., by category, by nutrient, by additives)",
        required: true
      },
      {
        name: "sortingFiltering",
        description: "Sorting or filtering needs",
        required: false
      }
    ]
  },
  "api-response-fields-guide": {
    name: "api-response-fields-guide",
    description: "Get explanation of specific API response fields",
    developerOnly: true,
    arguments: [
      {
        name: "fieldGroup",
        description: "Field group you need explained (e.g., nutriments, nutriscore_data, images)",
        required: true
      }
    ]
  },
  "api-error-troubleshooting": {
    name: "api-error-troubleshooting",
    description: "Troubleshoot API errors you're encountering",
    developerOnly: true,
    arguments: [
      {
        name: "statusCode",
        description: "HTTP status code or error message",
        required: true
      },
      {
        name: "endpoint",
        description: "The API endpoint you're working with",
        required: false
      }
    ]
  },
  "caching-api-data": {
    name: "caching-api-data",
    description: "Get guidance on efficiently caching Open Food Facts data",
    developerOnly: true,
    arguments: [
      {
        name: "dataType",
        description: "Type of data you're caching (product info, images, taxonomy)",
        required: true
      },
      {
        name: "language",
        description: "Programming language or environment you're using",
        required: false
      }
    ]
  }
};

// Export the available prompts for listing
export const availablePrompts = Object.values(PROMPTS);

/**
 * Filter prompts to only include those available in standard mode (non-developer mode)
 * @param prompts List of prompts to filter
 * @returns Filtered prompts that are available in standard mode
 */
export function filterPromptsForStandardMode(prompts: ExtendedPrompt[]): ExtendedPrompt[] {
  return prompts.filter(prompt => !prompt.developerOnly);
}

/**
 * Try to read file content from a given path relative to project root
 */
async function tryReadFile(relativePath: string): Promise<string | null> {
  try {
    const fullPath = path.join(projectRoot, relativePath);
    if (fs.existsSync(fullPath)) {
      return fs.readFileSync(fullPath, 'utf8');
    }
    return null;
  } catch (error) {
    console.error(`Error reading file ${relativePath}:`, error);
    return null;
  }
}

// Handle getting a specific prompt with arguments
export async function getPromptMessages(promptName: string, args?: Record<string, string>) {
  // Product analysis prompts
  if (promptName === "analyze-product") {
    const barcode = args?.barcode || "";
    return [
      {
        role: "user",
        content: {
          type: "text",
          text: `Analyze the nutritional information and ingredients of product with barcode ${barcode}. Provide insights on the nutritional quality, potential allergens, and how balanced the product is.`
        }
      }
    ];
  }
  
  if (promptName === "compare-products") {
    const barcode1 = args?.barcode1 || "";
    const barcode2 = args?.barcode2 || "";
    return [
      {
        role: "user",
        content: {
          type: "text",
          text: `Compare the nutritional information and ingredients of products with barcodes ${barcode1} and ${barcode2}. Identify which product is healthier and explain why.`
        }
      }
    ];
  }
  
  if (promptName === "check-additives") {
    const barcode = args?.barcode || "";
    return [
      {
        role: "user",
        content: {
          type: "text",
          text: `Check the product with barcode ${barcode} for additives. List any additives found, categorize them by their potential health impacts, and provide alternatives if they are concerning.`
        }
      }
    ];
  }

  // Developer-focused prompts
  if (promptName === "debug-perl-code") {
    const errorMessage = args?.errorMessage || "";
    const filePath = args?.filePath || "";
    
    // Try to read the file content
    const fileContent = await tryReadFile(filePath);
    
    const messages = [
      {
        role: "user",
        content: {
          type: "text",
          text: `I need help debugging a Perl issue in the Open Food Facts codebase. Here's the error message:\n\n${errorMessage}\n\nThe issue is in file: ${filePath}`
        }
      }
    ];
    
    // If we successfully read the file, add its content
    if (fileContent) {
      messages.push({
        role: "user",
        content: {
          type: "text",
          text: `Here's the content of the file:\n\n\`\`\`perl\n${fileContent}\n\`\`\`\n\nPlease help me identify the issue, explain what's causing it, and suggest how to fix it.`
        }
      });
    } else {
      messages.push({
        role: "user",
        content: {
          type: "text",
          text: `I couldn't locate or read the file content. Based on the error message, please suggest possible causes and solutions. Also, suggest where in the Open Food Facts codebase this issue might be occurring based on the error message.`
        }
      });
    }
    
    return messages;
  }
  
  if (promptName === "explain-codebase-structure") {
    const component = args?.component || "";
    let text = `Please explain the structure and organization of the Open Food Facts codebase`;
    
    if (component) {
      text += `, particularly focusing on the '${component}' component`;
    }
    
    text += `. Include information about:\n
1. Main directories and their purposes
2. Key files and their roles
3. How different components interact with each other
4. The flow of data through the system`;
    
    if (component) {
      text += `\n5. How the '${component}' component works and integrates with other parts of the system
6. Best practices for modifying or extending the '${component}' component`;
    }
    
    return [
      {
        role: "user",
        content: {
          type: "text",
          text
        }
      }
    ];
  }
  
  if (promptName === "implement-feature") {
    const featureDescription = args?.featureDescription || "";
    const component = args?.component || "unspecified component";
    
    return [
      {
        role: "user",
        content: {
          type: "text",
          text: `I want to implement the following feature in the Open Food Facts project: "${featureDescription}"\n\nThis feature will be part of the ${component} component.\n\nPlease provide a detailed implementation plan including:\n\n1. Files that need to be created or modified\n2. Required data models or database changes\n3. API endpoints that need to be added or modified\n4. UI components to create or update (if applicable)\n5. Suggested implementation steps in order\n6. Potential challenges and how to address them\n7. Testing strategy for this feature`
        }
      }
    ];
  }
  
  if (promptName === "optimize-mongodb-query") {
    const query = args?.query || "";
    
    return [
      {
        role: "user",
        content: {
          type: "text",
          text: `I need to optimize this MongoDB query for the Open Food Facts database:\n\n\`\`\`\n${query}\n\`\`\`\n\nPlease analyze it and suggest optimizations considering:\n\n1. Query structure and potential improvements\n2. Index recommendations\n3. Ways to reduce the amount of data processed\n4. How to make it more efficient for large datasets\n5. Common MongoDB performance pitfalls to avoid`
        }
      }
    ];
  }
  
  if (promptName === "refactor-code") {
    const filePath = args?.filePath || "";
    const codeSnippet = args?.codeSnippet || "";
    
    // Try to read the file content if no code snippet was provided
    let fileContent = "";
    if (!codeSnippet && filePath) {
      const content = await tryReadFile(filePath);
      if (content) {
        fileContent = content;
      }
    }
    
    const codeToRefactor = codeSnippet || fileContent || "No code provided";
    const fileExtension = path.extname(filePath).substring(1) || "unknown";
    
    return [
      {
        role: "user",
        content: {
          type: "text",
          text: `I want to refactor this ${fileExtension} code from the Open Food Facts project (file: ${filePath || "unknown"}):\n\n\`\`\`${fileExtension}\n${codeToRefactor}\n\`\`\`\n\nPlease suggest refactoring improvements focusing on:\n\n1. Code readability and maintainability\n2. Performance optimizations\n3. Following best practices for ${fileExtension} code\n4. Reducing duplication and improving reusability\n5. Better error handling and edge case management\n6. Improving the structure and organization`
        }
      }
    ];
  }
  
  if (promptName === "create-unit-test") {
    const functionName = args?.functionName || "";
    const filePath = args?.filePath || "";
    
    // Try to read the file content if provided
    let fileContent = "";
    if (filePath) {
      const content = await tryReadFile(filePath);
      if (content) {
        fileContent = content;
      }
    }
    
    const messages = [
      {
        role: "user",
        content: {
          type: "text",
          text: `I need to create unit tests for the function '${functionName}' in the Open Food Facts project.`
        }
      }
    ];
    
    if (fileContent) {
      const fileExtension = path.extname(filePath).substring(1) || "unknown";
      messages.push({
        role: "user",
        content: {
          type: "text",
          text: `Here's the source code:\n\n\`\`\`${fileExtension}\n${fileContent}\n\`\`\`\n\nPlease create comprehensive unit tests for the '${functionName}' function, covering:\n\n1. Happy path scenarios\n2. Edge cases and error conditions\n3. Input validation\n4. Any potential integration points\n\nUse the appropriate testing framework for ${fileExtension} files in the Open Food Facts project.`
        }
      });
    } else {
      messages.push({
        role: "user",
        content: {
          type: "text",
          text: `I couldn't provide the file content, but I need a template for unit tests for the '${functionName}' function. Please provide a general testing structure and examples of what should be tested, including typical edge cases for functions of this type in a food products database. Also suggest what testing framework would be most appropriate for this function in the Open Food Facts codebase.`
        }
      });
    }
    
    return messages;
  }
  
  if (promptName === "review-pr") {
    const prDescription = args?.prDescription || "";
    const changedFiles = args?.changedFiles || "";
    
    return [
      {
        role: "user",
        content: {
          type: "text",
          text: `I'm reviewing a pull request for the Open Food Facts project with the following description:\n\n"${prDescription}"\n\nThe PR changes these files:\n${changedFiles || "(No specific files listed)"}\n\nPlease help me review this PR by providing:\n\n1. A checklist of things to verify in the code\n2. Potential issues to look for specific to these kinds of changes\n3. Testing suggestions to ensure the changes work correctly\n4. Security considerations if applicable\n5. Performance implications to consider\n6. Documentation requirements\n7. Questions I should ask the PR author`
        }
      }
    ];
  }
  
  if (promptName === "investigate-bug") {
    const bugDescription = args?.bugDescription || "";
    const reproduceSteps = args?.reproduceSteps || "";
    
    return [
      {
        role: "user",
        content: {
          type: "text",
          text: `I'm investigating a bug in the Open Food Facts project with the following description:\n\n"${bugDescription}"\n\n${reproduceSteps ? `Steps to reproduce:\n${reproduceSteps}\n\n` : ""}Please provide a systematic approach to investigate this bug, including:\n\n1. Initial diagnostic steps\n2. Key areas of the codebase to examine\n3. Possible root causes based on the symptoms\n4. Logging or debugging techniques specific to this issue\n5. Potential fixes to try\n6. How to verify the fix works correctly`
        }
      }
    ];
  }
  
  if (promptName === "api-usage-example") {
    const endpoint = args?.endpoint || "";
    const language = args?.language || "";
    
    return [
      {
        role: "user",
        content: {
          type: "text",
          text: `Please provide example code in ${language} for using the Open Food Facts API endpoint '${endpoint}'.\n\nInclude:\n\n1. How to make the request properly\n2. Required parameters and their formats\n3. How to handle the response\n4. Error handling\n5. A complete working example\n6. Any rate limiting considerations\n7. Best practices for using this endpoint`
        }
      }
    ];
  }
  
  if (promptName === "document-code") {
    const filePath = args?.filePath || "";
    const functionName = args?.functionName || "";
    
    // Try to read the file content
    const fileContent = await tryReadFile(filePath);
    
    const messages = [
      {
        role: "user",
        content: {
          type: "text",
          text: `I need to generate documentation for ${functionName ? `the '${functionName}' function in` : ""} the file '${filePath}' in the Open Food Facts project.`
        }
      }
    ];
    
    if (fileContent) {
      const fileExtension = path.extname(filePath).substring(1) || "unknown";
      messages.push({
        role: "user",
        content: {
          type: "text",
          text: `Here's the code to document:\n\n\`\`\`${fileExtension}\n${fileContent}\n\`\`\`\n\nPlease generate comprehensive documentation ${functionName ? `focused on the '${functionName}' function` : "for this code"}, including:\n\n1. Overall purpose and functionality\n2. Parameters/arguments with descriptions and types\n3. Return values and their formats\n4. Exceptions/errors that might be thrown\n5. Usage examples\n6. Any important notes or caveats\n7. Related functions or modules\n\nProvide the documentation in a format appropriate for ${fileExtension} files in the Open Food Facts project.`
        }
      });
    } else {
      messages.push({
        role: "user", 
        content: {
          type: "text",
          text: `I couldn't provide the file content. Please provide a documentation template for what would typically be needed for a ${functionName ? `'${functionName}' function` : "source file"} in the Open Food Facts project, including the key sections that should be covered and the format that would be most appropriate.`
        }
      });
    }
    
    return messages;
  }
  
  // Documentation-inspired prompts
  if (promptName === "docker-debug-guide") {
    const issue = args?.issue || "";
    
    return [
      {
        role: "user",
        content: {
          type: "text",
          text: `I'm working on the Open Food Facts server project and having Docker-related issues with: "${issue}". Based on the project's Docker development documentation, please provide:\n\n1. Potential causes of this issue\n2. Step-by-step debugging approach\n3. Relevant Docker commands for diagnostics\n4. Typical solutions based on the Open Food Facts Docker setup\n5. Where to find relevant logs for this issue\n6. How to fix this without breaking the development environment`
        }
      }
    ];
  }
  
  if (promptName === "enhance-packaging-data") {
    const component = args?.component || "general packaging data";
    const feature = args?.feature || "";
    
    return [
      {
        role: "user", 
        content: {
          type: "text",
          text: `I'm working on enhancing the packaging data structure in Open Food Facts${feature ? `, specifically implementing: "${feature}"` : ""}, focusing on ${component}. Based on the project's packaging documentation, please help me with:\n\n1. The current data structure for ${component} in the Open Food Facts database\n2. How packaging data is parsed and processed in the Open Food Facts codebase\n3. Key files and functions I should modify\n4. How to properly integrate with existing taxonomies\n5. Best practices for handling edge cases\n6. Testing approach for my changes\n7. Documentation updates needed`
        }
      }
    ];
  }
  
  if (promptName === "contribute-knowledge-panel") {
    const panelType = args?.panelType || "";
    const elements = args?.elements || "standard panel elements";
    
    return [
      {
        role: "user",
        content: {
          type: "text",
          text: `I want to create or modify a "${panelType}" knowledge panel for Open Food Facts containing ${elements}. Based on the Knowledge Panels documentation, please provide:\n\n1. The structure and format of knowledge panels in Open Food Facts\n2. Key files I need to modify to create a new ${panelType} panel\n3. How to properly implement the panel elements I want (${elements})\n4. How to test my knowledge panel implementation\n5. Integration with the API response structure\n6. Typical pitfalls to avoid\n7. Examples of similar knowledge panels I can reference`
        }
      }
    ];
  }
  
  if (promptName === "setup-dev-environment") {
    const flavor = args?.flavor || "openfoodfacts";
    const issue = args?.issue || "general setup";
    
    return [
      {
        role: "user",
        content: {
          type: "text",
          text: `I'm trying to set up a development environment for the ${flavor} project but having issues with ${issue}. Based on the Docker development documentation, please help with:\n\n1. The correct setup process for ${flavor} development environment\n2. Common causes of "${issue}" problems during setup\n3. Environment variables I should check\n4. Docker configuration that might need adjustment\n5. Directories and files I should verify\n6. Commands to restart services or rebuild containers\n7. Debugging steps for this specific issue`
        }
      }
    ];
  }
  
  if (promptName === "mongodb-query-help") {
    const collection = args?.collection || "products";
    const operation = args?.operation || "find";
    const example = args?.example || "";
    
    return [
      {
        role: "user",
        content: {
          type: "text",
          text: `I need help creating a MongoDB ${operation} query for the ${collection} collection in Open Food Facts to ${example}. Please help me with:\n\n1. The correct MongoDB query structure for this operation\n2. How to efficiently query by the fields relevant to my task\n3. How this data is structured in the Open Food Facts database\n4. Performance considerations for this query\n5. How to run this query in the Open Food Facts development environment\n6. Common pitfalls to avoid\n7. A complete working example of the query`
        }
      }
    ];
  }
  
  if (promptName === "data-quality-control") {
    const dataType = args?.dataType || "";
    const context = args?.context || "general context";
    
    return [
      {
        role: "user",
        content: {
          type: "text",
          text: `I want to implement data quality controls for ${dataType} in the ${context} for Open Food Facts contributions. Based on the data quality documentation, please help me with:\n\n1. Common validation issues for ${dataType} data in Open Food Facts\n2. Suggested validation rules for ${dataType}\n3. How to implement these validations in ${context}\n4. Examples of similar validations in the Open Food Facts codebase\n5. Edge cases I should consider\n6. How to provide user feedback for validation errors\n7. Testing strategy for these validations`
        }
      }
    ];
  }
  
  if (promptName === "taxonomy-guide") {
    const taxonomyName = args?.taxonomyName || "";
    const task = args?.task || "working with taxonomy";
    
    return [
      {
        role: "user",
        content: {
          type: "text",
          text: `I'm ${task} with the ${taxonomyName} taxonomy in Open Food Facts. Please help me understand:\n\n1. The structure and purpose of the ${taxonomyName} taxonomy\n2. Key files related to this taxonomy in the codebase\n3. How this taxonomy is used in the Open Food Facts system\n4. How to properly reference taxonomy entries in code\n5. Best practices for extending or modifying this taxonomy\n6. Common operations and patterns when working with taxonomies\n7. How taxonomy changes affect the product database`
        }
      }
    ];
  }
  
  if (promptName === "perl-debugging") {
    const module = args?.module || "General Perl code";
    const error = args?.error || "";
    const context = args?.context || "general task";
    
    return [
      {
        role: "user",
        content: {
          type: "text",
          text: `I'm working with ${module} in the Open Food Facts codebase, trying to ${context}, but I'm encountering this error or issue:\n\n"${error}"\n\nBased on the Project Opener Perl code documentation, please help me with:\n\n1. Likely causes of this error in the context of Open Food Facts\n2. Debugging approach specific to this module and error\n3. Relevant modules and functions I should examine\n4. Logging techniques to get more information\n5. Similar patterns in the codebase I can reference\n6. Potential fixes with code examples\n7. How to test that my fix works correctly`
        }
      }
    ];
  }
  
  if (promptName === "apache-config-help") {
    const issue = args?.issue || "";
    
    return [
      {
        role: "user",
        content: {
          type: "text",
          text: `I need help with Apache configuration in the Open Food Facts server for: "${issue}". Please provide guidance on:\n\n1. Relevant Apache configuration files in the Open Food Facts codebase\n2. How to modify Apache configuration for this specific need\n3. Environment variables and settings that might affect this configuration\n4. How to test Apache configuration changes\n5. How to restart Apache after changes (within Docker)\n6. Common pitfalls to avoid\n7. Security considerations for these changes`
        }
      }
    ];
  }
  
  if (promptName === "implement-api-endpoint") {
    const endpoint = args?.endpoint || "";
    const functionality = args?.functionality || "";
    const method = args?.method || "GET";
    
    return [
      {
        role: "user",
        content: {
          type: "text",
          text: `I want to implement a new ${method} API endpoint "${endpoint}" in Open Food Facts that will ${functionality}. Please provide guidance on:\n\n1. The file structure and location for adding new API endpoints\n2. Examples of similar endpoints I can reference\n3. How to properly structure the request and response\n4. Required authentication and permissions\n5. Error handling best practices\n6. How to test this endpoint\n7. Documentation updates needed`
        }
      }
    ];
  }
  
  if (promptName === "setup-local-environment") {
    const os = args?.os || "unknown";
    const issue = args?.issue || "general setup";
    
    return [
      {
        role: "user",
        content: {
          type: "text",
          text: `I need help setting up a local development environment for Open Food Facts on ${os}, specifically with ${issue}. Based on the project documentation, please provide:\n\n1. The precise prerequisites I need to install on ${os}\n2. Step-by-step instructions for cloning and setting up the repository\n3. Common issues encountered on ${os} during setup and their solutions\n4. Required environment variables or configuration files\n5. How to verify my setup is working correctly\n6. Development workflow recommendations after setup\n7. Troubleshooting steps if I encounter issues with ${issue}`
        }
      }
    ];
  }
  
  if (promptName === "docker-makefile-help") {
    const command = args?.command || "";
    const error = args?.error || "";
    
    return [
      {
        role: "user",
        content: {
          type: "text",
          text: `I need help with the '${command}' command in the Open Food Facts project${error ? `, and I'm seeing this error: "${error}"` : ""}. Based on the project documentation, please provide:\n\n1. The purpose of the '${command}' command\n2. The correct syntax and parameters\n3. Common issues that might cause errors with this command${error ? `\n4. Specific solutions to the error: "${error}"` : ""}\n5. Related commands I should know about\n6. Examples of proper usage in different contexts\n7. What should happen when the command runs successfully`
        }
      }
    ];
  }

  if (promptName === "resolve-common-setup-errors") {
    const errorType = args?.errorType || "";
    const errorMessage = args?.errorMessage || "";
    
    return [
      {
        role: "user",
        content: {
          type: "text",
          text: `I'm encountering a ${errorType} error during Open Food Facts project setup${errorMessage ? `: "${errorMessage}"` : ""}. Based on the project documentation, please provide:\n\n1. Common causes of ${errorType} errors in the Open Food Facts setup\n2. Step-by-step troubleshooting process\n3. Specific solutions to try${errorMessage ? ` for the error message: "${errorMessage}"` : ""}\n4. How to verify if the solution worked\n5. Preventive measures to avoid similar errors in the future\n6. If these solutions don't work, what additional information should I gather\n7. Where to get further help if needed`
        }
      }
    ];
  }

  if (promptName === "gitpod-workflow") {
    const issue = args?.issue || "";
    
    return [
      {
        role: "user",
        content: {
          type: "text",
          text: `I need help with using Gitpod for Open Food Facts development, specifically with: "${issue}". Based on the project documentation, please provide:\n\n1. How to properly configure Gitpod for Open Food Facts development\n2. Specific guidance on handling "${issue}" in Gitpod\n3. Commands and workflows specific to the Gitpod environment\n4. How to access my development instance via SSH tunnel\n5. Common Gitpod-specific issues and their solutions\n6. Best practices for using Gitpod with Open Food Facts\n7. Limitations of using Gitpod I should be aware of`
        }
      }
    ];
  }
  
  if (promptName === "development-workflows") {
    const workflow = args?.workflow || "";
    
    return [
      {
        role: "user",
        content: {
          type: "text",
          text: `I need help with the "${workflow}" development workflow in the Open Food Facts project. Based on the project documentation, please provide:\n\n1. Overview of the "${workflow}" workflow in Open Food Facts\n2. The necessary tools and environment setup\n3. Step-by-step guide to perform this workflow\n4. Common issues encountered and their solutions\n5. Best practices specific to this workflow\n6. How this workflow integrates with other parts of development\n7. Examples of successful implementation`
        }
      }
    ];
  }
  
  if (promptName === "api-authentication-guide") {
    const operation = args?.operation || "";
    const context = args?.context || "general usage";
    
    return [
      {
        role: "user",
        content: {
          type: "text",
          text: `I need help with authentication for ${operation} operations in the Open Food Facts API for my ${context}. Based on the API documentation, please provide:\n\n1. The authentication requirements for ${operation} operations\n2. The correct way to authenticate in the context of ${context}\n3. Code examples showing proper authentication\n4. Common authentication errors and how to fix them\n5. Security best practices to follow\n6. How to handle authentication for multiple users\n7. API rate limits and considerations related to authentication`
        }
      }
    ];
  }
  
  if (promptName === "api-image-operations") {
    const operation = args?.operation || "";
    const scale = args?.scale || "individual images";
    
    return [
      {
        role: "user",
        content: {
          type: "text",
          text: `I need help with ${operation} product images at ${scale} scale using the Open Food Facts API. Based on the API documentation, please provide:\n\n1. The recommended approach for ${operation} ${scale}\n2. The specific API endpoints and parameters needed\n3. Authentication requirements for image operations\n4. Code examples showing proper implementation\n5. Best practices for image handling in this context\n6. Common issues and their solutions\n7. Performance considerations for ${scale}`
        }
      }
    ];
  }
  
  if (promptName === "api-country-language-usage") {
    const useCase = args?.useCase || "";
    
    return [
      {
        role: "user",
        content: {
          type: "text",
          text: `I need help with country and language parameters in the Open Food Facts API for the following use case: "${useCase}". Based on the API documentation, please provide:\n\n1. How to properly use country (cc) and language (lc) parameters in API requests\n2. How these parameters affect the API response\n3. Best practices for handling multilingual products\n4. Examples showing proper usage for my use case\n5. Common mistakes to avoid when using these parameters\n6. How to handle products available in multiple countries\n7. Performance considerations related to localization parameters`
        }
      }
    ];
  }
  
  if (promptName === "product-data-contribution") {
    const dataType = args?.dataType || "";
    const implementationContext = args?.implementationContext || "general context";
    
    return [
      {
        role: "user",
        content: {
          type: "text",
          text: `I want to contribute ${dataType} to Open Food Facts through the API in my ${implementationContext}. Based on the API documentation, please provide:\n\n1. The correct API endpoints and methods for contributing ${dataType}\n2. Required authentication and parameters\n3. Data validation and quality control best practices\n4. How to handle multilingual data\n5. Examples showing proper implementation in ${implementationContext}\n6. Common errors and how to avoid them\n7. How to verify my contributions were successful`
        }
      }
    ];
  }
  
  if (promptName === "search-api-usage") {
    const searchType = args?.searchType || "";
    const sortingFiltering = args?.sortingFiltering || "basic needs";
    
    return [
      {
        role: "user",
        content: {
          type: "text",
          text: `I need help using the Open Food Facts search API to perform ${searchType} searches with ${sortingFiltering}. Based on the API documentation, please provide:\n\n1. The correct API endpoints for ${searchType} searches\n2. Required and optional parameters for effective searching\n3. How to implement ${sortingFiltering} in my searches\n4. Pagination and result limiting best practices\n5. Code examples showing proper implementation\n6. Common search limitations and how to work around them\n7. Performance optimization strategies for search operations`
        }
      }
    ];
  }
  
  if (promptName === "api-response-fields-guide") {
    const fieldGroup = args?.fieldGroup || "";
    
    return [
      {
        role: "user",
        content: {
          type: "text",
          text: `I need to understand the ${fieldGroup} fields in the Open Food Facts API response. Based on the API documentation, please provide:\n\n1. Complete explanation of all fields in the ${fieldGroup} group\n2. The data types and formats for each field\n3. How these fields are calculated or determined\n4. Common use cases for these fields\n5. How to correctly interpret the values\n6. Common issues or edge cases with these fields\n7. Examples showing typical values and their meaning`
        }
      }
    ];
  }
  
  if (promptName === "api-error-troubleshooting") {
    const statusCode = args?.statusCode || "";
    const endpoint = args?.endpoint || "general API endpoint";
    
    return [
      {
        role: "user",
        content: {
          type: "text",
          text: `I'm getting a ${statusCode} error when using the ${endpoint} in the Open Food Facts API. Based on the API documentation, please provide:\n\n1. What this error typically means in the context of ${endpoint}\n2. Common causes of this error\n3. Step-by-step troubleshooting process\n4. How to fix the issue\n5. How to prevent similar errors in the future\n6. Examples of correct usage that avoids this error\n7. If this error persists, what additional information should I gather`
        }
      }
    ];
  }
  
  if (promptName === "caching-api-data") {
    const dataType = args?.dataType || "";
    const language = args?.language || "general programming language";
    
    return [
      {
        role: "user",
        content: {
          type: "text",
          text: `I need guidance on efficiently caching ${dataType} from the Open Food Facts API using ${language}. Based on the API documentation, please provide:\n\n1. Recommended caching strategies for ${dataType}\n2. Data structure recommendations for ${language}\n3. How to handle data updates and synchronization\n4. Best practices for cache invalidation\n5. Code examples in ${language} showing implementation\n6. Performance considerations and optimization techniques\n7. How to properly share modified data back to Open Food Facts`
        }
      }
    ];
  }
  
  throw new Error(`Prompt implementation not found for ${promptName}`);
}