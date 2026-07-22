export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Contact Us</h1>
        
        <div className="space-y-6 text-gray-600">
          <p>We would love to hear from you! Please reach out to us using the information below:</p>
          
          <div className="mt-8 space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Arogyavruksham Silks</h2>
            
            <div>
              <h3 className="font-bold text-gray-900">Operating Address</h3>
              <p>Arogyavruksham Silks, Hyderabad, Telangana, India - 500001</p>
            </div>
            
            <div>
              <h3 className="font-bold text-gray-900">Email Address</h3>
              <p>support@arogyavrukshamsilks.com</p>
            </div>
            
            <div>
              <h3 className="font-bold text-gray-900">Phone Number</h3>
              <p>+91 98765 43210</p>
            </div>
            
            <div>
              <h3 className="font-bold text-gray-900">Business Hours</h3>
              <p>Monday to Saturday: 10:00 AM to 7:00 PM IST</p>
              <p>Sunday: Closed</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
