import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { fileId, accessToken } = await request.json()

    if (!fileId || !accessToken) {
      return NextResponse.json(
        { error: "Missing fileId or accessToken" },
        { status: 400 }
      )
    }

    // Fetch the file from Google Drive
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Google Drive API error:", errorText)
      return NextResponse.json(
        { error: "Failed to download file from Google Drive" },
        { status: response.status }
      )
    }

    // Get the file as array buffer and return it
    const arrayBuffer = await response.arrayBuffer()
    
    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
      },
    })
  } catch (error) {
    console.error("Drive download error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
