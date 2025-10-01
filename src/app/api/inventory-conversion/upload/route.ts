import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { Resend } from 'resend'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const customerInfo = JSON.parse(formData.get('customerInfo') as string)
    
    // Generate unique conversion ID
    const conversionId = uuidv4()
    
    // Create upload directory
    const uploadDir = path.join(process.cwd(), 'uploads', 'conversions', conversionId)
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Process uploaded files
    const uploadedFiles: Array<{ originalName: string; savedPath: string; size: number }> = []
    
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('file_') && value instanceof File) {
        const file = value as File
        
        // Validate file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
          return NextResponse.json(
            { error: `File ${file.name} is too large. Maximum size is 10MB.` },
            { status: 400 }
          )
        }

        // Validate file type
        const allowedTypes = [
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
          'application/vnd.ms-excel', // .xls
          'text/csv', // .csv
          'text/tab-separated-values', // .tsv
          'text/plain' // .txt
        ]
        
        if (!allowedTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv|tsv|txt)$/i)) {
          return NextResponse.json(
            { error: `File ${file.name} is not a supported format. Please upload Excel, CSV, or TXT files.` },
            { status: 400 }
          )
        }

        // Save file
        const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
        const filePath = path.join(uploadDir, fileName)
        
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        await writeFile(filePath, buffer)
        
        uploadedFiles.push({
          originalName: file.name,
          savedPath: filePath,
          size: file.size
        })
      }
    }

    if (uploadedFiles.length === 0) {
      return NextResponse.json(
        { error: 'No valid files were uploaded' },
        { status: 400 }
      )
    }

    // Save conversion request metadata
    const conversionData = {
      id: conversionId,
      customerInfo,
      files: uploadedFiles,
      status: 'uploaded',
      createdAt: new Date().toISOString(),
      paymentStatus: 'pending'
    }

    const metadataPath = path.join(uploadDir, 'conversion_metadata.json')
    await writeFile(metadataPath, JSON.stringify(conversionData, null, 2))

    // Send notification email to you with the uploaded files info
    try {
      const filesListHtml = uploadedFiles.map(file => 
        `<li><strong>${file.originalName}</strong> (${(file.size / 1024 / 1024).toFixed(2)} MB)</li>`
      ).join('')

      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #f97316 0%, #dc2626 100%); padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">New Inventory Conversion Request</h1>
          </div>
          
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #1f2937; margin-top: 0;">Customer Information</h2>
              <p><strong>Name:</strong> ${customerInfo.name}</p>
              <p><strong>Email:</strong> ${customerInfo.email}</p>
              <p><strong>Company:</strong> ${customerInfo.company || 'Not provided'}</p>
              <p><strong>Phone:</strong> ${customerInfo.phone || 'Not provided'}</p>
              <p><strong>Conversion ID:</strong> ${conversionId}</p>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #1f2937; margin-top: 0;">Uploaded Files (${uploadedFiles.length})</h3>
              <ul style="margin: 0; padding-left: 20px;">
                ${filesListHtml}
              </ul>
            </div>

            ${customerInfo.notes ? `
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #1f2937; margin-top: 0;">Special Instructions</h3>
              <div style="background: #f3f4f6; padding: 15px; border-radius: 6px; border-left: 4px solid #f97316;">
                ${customerInfo.notes.replace(/\n/g, '<br>')}
              </div>
            </div>
            ` : ''}
            
            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b;">
              <p style="margin: 0; color: #92400e; font-size: 14px;">
                <strong>Next Steps:</strong><br>
                1. Customer will complete payment via Stripe<br>
                2. Download files from server: <code>/uploads/conversions/${conversionId}/</code><br>
                3. Convert files to InvyEasy template format<br>
                4. Email converted file back to customer
              </p>
            </div>
          </div>
        </div>
      `

      if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 'your_resend_api_key_here') {
        const resend = new Resend(process.env.RESEND_API_KEY)
        await resend.emails.send({
          from: 'noreply@invyeasy.com',
          to: ['invyeasy@gmail.com'],
          subject: `[InvyEasy] New Conversion Request - ${customerInfo.name}`,
          html: emailHtml,
          replyTo: customerInfo.email,
        })
      } else {
        console.log('📧 Conversion request notification (email not configured):')
        console.log({ conversionId, customerInfo, fileCount: uploadedFiles.length })
      }
    } catch (emailError) {
      console.error('Failed to send notification email:', emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      conversionId,
      message: 'Files uploaded successfully',
      fileCount: uploadedFiles.length
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload files' },
      { status: 500 }
    )
  }
}