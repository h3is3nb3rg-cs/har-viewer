/**
 * MCP Client for har-viewer
 *
 * Communicates with the MCP HTTP server to send selected API data to Cursor
 */

interface MCPRequest {
  jsonrpc: "2.0";
  method: string;
  params: any;
  id: number;
}

interface MCPResponse {
  jsonrpc: "2.0";
  result?: any;
  error?: {
    code: number;
    message: string;
  };
  id: number;
}

export interface APISelection {
  request: {
    method: string;
    url: string;
    headers: Array<{ name: string; value: string }>;
    postData?: {
      mimeType: string;
      text?: string;
    };
  };
  response: {
    status: number;
    statusText: string;
    headers: Array<{ name: string; value: string }>;
    content: {
      size: number;
      mimeType: string;
      text?: string;
    };
  };
  timings: {
    blocked?: number;
    dns?: number;
    connect?: number;
    send?: number;
    wait?: number;
    receive?: number;
    ssl?: number;
  };
  time: number;
  startedDateTime: string;
}

export class MCPClient {
  private baseUrl: string;
  private requestId = 0;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private isConnected = false;

  constructor(baseUrl: string = "http://localhost:3100/mcp") {
    this.baseUrl = baseUrl;
  }

  /**
   * Check if MCP server is reachable
   */
  async checkHealth(): Promise<boolean> {
    try {
      const healthUrl = this.baseUrl.replace("/mcp", "/health");
      const response = await fetch(healthUrl, {
        method: "GET",
      });

      if (!response.ok) {
        this.isConnected = false;
        return false;
      }

      const data = await response.json();
      this.isConnected = data.status === "ok";
      return this.isConnected;
    } catch (error) {
      console.error("[MCP Client] Health check failed:", error);
      this.isConnected = false;
      return false;
    }
  }

  /**
   * Get connection status
   */
  get connected(): boolean {
    return this.isConnected;
  }

  /**
   * Start periodic health checks
   */
  startHealthCheck(intervalMs: number = 10000): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    // Initial check
    this.checkHealth();

    // Periodic checks
    this.healthCheckInterval = setInterval(() => {
      this.checkHealth();
    }, intervalMs);
  }

  /**
   * Stop health checks
   */
  stopHealthCheck(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }

  /**
   * Call an MCP tool
   */
  async callTool(name: string, args: any): Promise<any> {
    const request: MCPRequest = {
      jsonrpc: "2.0",
      method: "tools/call",
      params: {
        name,
        arguments: args,
      },
      id: ++this.requestId,
    };

    try {
      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: MCPResponse = await response.json();

      if (result.error) {
        throw new Error(`MCP Error (${result.error.code}): ${result.error.message}`);
      }

      return result.result;
    } catch (error) {
      console.error("[MCP Client] Tool call failed:", error);
      throw error;
    }
  }

  /**
   * Send the currently selected API call to Cursor
   */
  async sendSelectionToCursor(entry: any): Promise<{ success: boolean; message: string }> {
    try {
      // Extract only the data we need
      const selection: APISelection = {
        request: {
          method: entry.request.method,
          url: entry.request.url,
          headers: entry.request.headers,
          postData: entry.request.postData,
        },
        response: {
          status: entry.response.status,
          statusText: entry.response.statusText,
          headers: entry.response.headers,
          content: entry.response.content,
        },
        timings: entry.timings,
        time: entry.time,
        startedDateTime: entry.startedDateTime,
      };

      // Call the set_current_selection tool
      const result = await this.callTool("set_current_selection", { selection });

      // Extract success message
      const message =
        result?.content?.[0]?.text || "API selection sent to Cursor successfully!";

      return {
        success: true,
        message,
      };
    } catch (error) {
      console.error("[MCP Client] Failed to send selection:", error);

      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to send to Cursor. Is the MCP server running?";

      return {
        success: false,
        message: errorMessage,
      };
    }
  }
}

// Singleton instance
export const mcpClient = new MCPClient();

// Start health checks on creation
if (typeof window !== "undefined") {
  mcpClient.startHealthCheck();
}
