import PDFDocument from 'pdfkit'

export async function generateInvoicePDF(order: any, orderItems: any[]): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' })
      const buffers: Buffer[] = []
      
      doc.on('data', buffers.push.bind(buffers))
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers)
        resolve(pdfData)
      })
      doc.on('error', reject)

      const storeName = process.env.NEXT_PUBLIC_STORE_NAME || 'Your Store'
      const invoiceNumber = `INV-${order.id.split('-')[0].toUpperCase()}`
      const date = new Date(order.created_at).toLocaleDateString('en-IN')

      // --- Header ---
      doc
        .fillColor('#444444')
        .fontSize(24)
        .text('INVOICE', 50, 50, { align: 'right' })
        .fontSize(10)
        .text(`Invoice Number: ${invoiceNumber}`, { align: 'right' })
        .text(`Date: ${date}`, { align: 'right' })
      
      doc
        .fontSize(20)
        .fillColor('#1A73E8')
        .text(storeName, 50, 50)
        .fillColor('#444444')
        .fontSize(10)
        .text('info@yourstore.com', 50, 75)
        .moveDown()

      doc.moveTo(50, 110).lineTo(545, 110).strokeColor('#e5e7eb').stroke()

      // --- Addresses ---
      const customerName = order.shipping_address?.name || order.users?.full_name || 'Customer'
      const customerEmail = order.users?.email || ''
      const address = order.shipping_address
      
      doc.moveDown(2)
      doc.fontSize(10).font('Helvetica-Bold').text('Bill To:', 50)
      doc.font('Helvetica').text(customerName)
      if (customerEmail) doc.text(customerEmail)
      if (address) {
        doc.text(address.fullAddress)
        doc.text(`${address.city}, ${address.state} - ${address.pincode}`)
        if (address.phone) doc.text(`Phone: ${address.phone}`)
      }

      // --- Items Table ---
      doc.moveDown(3)
      const tableTop = doc.y
      
      doc.font('Helvetica-Bold')
      doc.text('Item', 50, tableTop)
      doc.text('Quantity', 300, tableTop, { width: 50, align: 'center' })
      doc.text('Price', 400, tableTop, { width: 50, align: 'right' })
      doc.text('Total', 500, tableTop, { width: 45, align: 'right' })
      
      doc.moveTo(50, tableTop + 15).lineTo(545, tableTop + 15).stroke()
      
      let y = tableTop + 25
      doc.font('Helvetica')
      
      orderItems.forEach((item) => {
        const title = item.products?.title || 'Unknown Product'
        const qty = item.quantity
        const price = item.price_at_time
        const lineTotal = qty * price

        doc.text(title, 50, y, { width: 240 })
        doc.text(qty.toString(), 300, y, { width: 50, align: 'center' })
        doc.text(`Rs. ${price.toLocaleString('en-IN')}`, 400, y, { width: 50, align: 'right' })
        doc.text(`Rs. ${lineTotal.toLocaleString('en-IN')}`, 500, y, { width: 45, align: 'right' })
        
        y += 20
      })

      doc.moveTo(50, y + 10).lineTo(545, y + 10).stroke()
      y += 25

      // --- Totals ---
      if (order.discount_amount && order.discount_amount > 0) {
        doc.font('Helvetica')
        doc.text('Subtotal:', 400, y, { width: 50, align: 'right' })
        doc.text(`Rs. ${(Number(order.total_amount) + Number(order.discount_amount)).toLocaleString('en-IN')}`, 500, y, { width: 45, align: 'right' })
        y += 20
        doc.text(`Discount (${order.coupon_code}):`, 350, y, { width: 100, align: 'right' })
        doc.text(`- Rs. ${order.discount_amount.toLocaleString('en-IN')}`, 500, y, { width: 45, align: 'right' })
        y += 20
      }

      doc.font('Helvetica-Bold')
      doc.text('Grand Total:', 400, y, { width: 50, align: 'right' })
      doc.text(`Rs. ${Number(order.total_amount).toLocaleString('en-IN')}`, 500, y, { width: 45, align: 'right' })

      // --- Footer ---
      doc.fontSize(10).font('Helvetica').text(
        'Thank you for your business!',
        50,
        700,
        { align: 'center', width: 500 }
      )

      doc.end()
    } catch (error) {
      reject(error)
    }
  })
}
