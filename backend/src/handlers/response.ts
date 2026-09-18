import { APIGatewayProxyResult } from "aws-lambda";

export function apiResponse(statusCode: number, body: unknown): APIGatewayProxyResult {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type,Authorization,X-Requested-With",
      "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    },
    body: JSON.stringify(body),
  };
}

export function apiError(statusCode: number, message: string): APIGatewayProxyResult {
  return apiResponse(statusCode, {
    success: false,
    error: message,
  });
}
