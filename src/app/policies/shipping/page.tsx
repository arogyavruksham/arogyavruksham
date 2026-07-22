export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100 prose prose-blue max-w-none">
        <h1>Shipping Policy</h1>
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        
        <h2>1. Processing Time</h2>
        <p>All orders are processed within 1-3 business days. Orders are not shipped or delivered on weekends or holidays.</p>
        <p>If we are experiencing a high volume of orders, shipments may be delayed by a few days. Please allow additional days in transit for delivery.</p>
        
        <h2>2. Shipping Rates & Delivery Estimates</h2>
        <p>Shipping charges for your order will be calculated and displayed at checkout.</p>
        <ul>
          <li><strong>Standard Shipping:</strong> 5-7 business days.</li>
          <li><strong>Express Shipping:</strong> 2-3 business days (if applicable).</li>
        </ul>
        <p>Delivery delays can occasionally occur due to unforeseen circumstances or location accessibility.</p>
        
        <h2>3. Shipment Confirmation & Order Tracking</h2>
        <p>You will receive a Shipment Confirmation email once your order has shipped containing your tracking number(s). The tracking number will be active within 24 hours.</p>
        
        <h2>4. Customs, Duties and Taxes</h2>
        <p>Arogyavruksham Silks is not responsible for any customs and taxes applied to your order. All fees imposed during or after shipping are the responsibility of the customer (tariffs, taxes, etc.).</p>
        
        <h2>5. Damages</h2>
        <p>If you received your order damaged, please contact us immediately so we can file a claim with the shipment carrier. Please save all packaging materials and damaged goods before filing a claim.</p>
      </div>
    </div>
  )
}
