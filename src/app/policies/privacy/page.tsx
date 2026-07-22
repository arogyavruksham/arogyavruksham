export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100 prose prose-blue max-w-none">
        <h1>Privacy Policy</h1>
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        
        <p>Arogyavruksham Silks ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how your personal information is collected, used, and disclosed by Arogyavruksham Silks.</p>
        
        <h2>1. Information We Collect</h2>
        <p>We collect information from you when you visit our website, register on our site, place an order, subscribe to our newsletter, respond to a survey, or fill out a form.</p>
        <ul>
          <li>Name / Username</li>
          <li>Phone Numbers</li>
          <li>Email Addresses</li>
          <li>Mailing Addresses</li>
          <li>Billing Addresses</li>
        </ul>
        
        <h2>2. How We Use Your Information</h2>
        <p>Any of the information we collect from you may be used in one of the following ways:</p>
        <ul>
          <li>To personalize your experience</li>
          <li>To improve our website</li>
          <li>To improve customer service</li>
          <li>To process transactions</li>
          <li>To send periodic emails</li>
        </ul>
        
        <h2>3. Information Protection</h2>
        <p>We implement a variety of security measures to maintain the safety of your personal information when you place an order or enter, submit, or access your personal information. All supplied sensitive/credit information is transmitted via Secure Socket Layer (SSL) technology and then encrypted into our Payment gateway providers database only to be accessible by those authorized with special access rights to such systems, and are required to keep the information confidential.</p>
        
        <h2>4. Third-Party Services</h2>
        <p>We may share your information with third-party service providers (like Razorpay for payment processing, and logistics partners for shipping) to facilitate our services. These third parties have access to your Personal Information only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose.</p>
        
        <h2>5. Cookies</h2>
        <p>We use cookies to help us remember and process the items in your shopping cart, understand and save your preferences for future visits, and compile aggregate data about site traffic and site interaction so that we can offer better site experiences and tools in the future.</p>
        
        <h2>6. Contact Us</h2>
        <p>If there are any questions regarding this privacy policy, you may contact us using our Contact Us page.</p>
      </div>
    </div>
  )
}
