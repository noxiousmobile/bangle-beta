import { NextResponse } from "next/server"

export async function GET() {
  // These credentials are restricted by domain in GCP Console
  // and only work with the Google Picker API
  return NextResponse.json({
    clientId: process.env.GOOGLE_CLIENT_ID || "",
    apiKey: process.env.GOOGLE_API_KEY || "",
  })
}
