export default function RefundPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100 prose prose-blue max-w-none">
        <h1>Refund & Cancellation Policy</h1>
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        
        <h2>1. Order Cancellation</h2>
        <p>You can cancel your order within 24 hours of placing it, provided it has not already been shipped. To cancel your order, please contact our customer support team immediately. Once an order has been shipped, it cannot be cancelled.</p>
        
        <h2>2. Returns</h2>
        <p>We accept returns within 7 days of delivery. To be eligible for a return, your item must be unused, in the same condition that you received it, and in its original packaging with all tags attached.</p>
        <p>Please note that certain items, such as customized or tailored garments, are non-returnable.</p>
        
        <h2>3. Refunds</h2>
        <p>Once your return is received and inspected, we will notify you of the approval or rejection of your refund. If you are approved, then your refund will be processed, and a credit will automatically be applied to your original method of payment (e.g., via Razorpay) within 5-7 business days.</p>
        
        <h2>4. Exchanges</h2>
        <p>We only replace items if they are defective or damaged upon arrival. If you need to exchange it for the same item, send us an email at support@arogyavrukshamsilks.com.</p>
        
        <h2>5. Shipping Costs for Returns</h2>
        <p>You will be responsible for paying for your own shipping costs for returning your item. Shipping costs are non-refundable. If you receive a refund, the cost of return shipping will be deducted from your refund.</p>
      </div>
    </div>
  )
}
