import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Building2, Mail, Phone, Clock, MapPin, 
  Car, Wrench, FileCheck, BadgeDollarSign, History, Truck,
  Facebook, Instagram, Twitter, Youtube, CheckCircle2, Globe2
} from "lucide-react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

export default function About() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <div className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="bg-white shadow-lg border-0">
        <CardContent className="p-6">
          <div className="mb-12">
            <p className="text-xl mb-6 text-gray-700">
              <strong>Welcome to carMarket</strong> – Your Trusted Partner for Buying and Selling Used Cars and Vehicles.
            </p>
            <p className="text-gray-600 text-lg leading-relaxed">
              At <strong>carMarket</strong>, we make second-hand vehicle trading simple, transparent, and hassle-free. Whether you want to sell your old car or find a reliable used vehicle at the best price, we've got you covered.
            </p>
          </div>

          <Separator className="my-12" />

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <span className="mr-2">🚗</span> Our Mission
            </h2>
            <p className="text-gray-600">
              Our mission is to build Hyderabad's most trusted marketplace for second-hand cars/vehicles, and commercial vehicles — connecting real buyers and sellers securely, without middlemen.
            </p>
          </section>

          <Separator className="my-8" />

          <section className="mb-12">
            <div className="flex items-center gap-3 mb-8">
              <Wrench className="w-7 h-7 text-blue-600" />
              <h2 className="text-3xl font-semibold text-gray-800">Our Services</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <Car className="w-10 h-10 text-blue-600 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Buy Pre-Owned Vehicles</h3>
                <p className="text-gray-600">Browse verified listings from individuals and dealers.</p>
              </div>
              
              <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <FileCheck className="w-10 h-10 text-blue-600 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Sell Your Vehicle</h3>
                <p className="text-gray-600">List your vehicle for free with photos and details.</p>
              </div>
              
              <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <Wrench className="w-10 h-10 text-blue-600 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Vehicle Inspection</h3>
                <p className="text-gray-600">Get a fair price estimate based on market trends.</p>
              </div>
              
              <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <BadgeDollarSign className="w-10 h-10 text-blue-600 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Financing Assistance</h3>
                <p className="text-gray-600">Access top finance providers for easier purchases.</p>
              </div>
              
              <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <History className="w-10 h-10 text-blue-600 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Vehicle History</h3>
                <p className="text-gray-600">Verify ownership and detailed service history.</p>
              </div>
              
              <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <Truck className="w-10 h-10 text-blue-600 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Doorstep Services</h3>
                <p className="text-gray-600">Pickup & Delivery services (coming soon).</p>
              </div>
            </div>
          </section>

          <Separator className="my-8" />

          <section className="mb-12">
            <div className="flex items-center gap-3 mb-8">
              <Phone className="w-7 h-7 text-blue-600" />
              <h2 className="text-3xl font-semibold text-gray-800">Contact & Location</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-6 h-6 text-blue-600" />
                  <h3 className="text-xl font-semibold">Our Office</h3>
                </div>
                <div className="space-y-2 text-gray-600">
                  <p className="font-semibold text-gray-800">carMarket (Hyderabad Office)</p>
                  <p>Brandium Technologies Pvt. Ltd.</p>
                  <p>3rd Floor, Hi-Tech City</p>
                  <p>Hyderabad, Telangana, India</p>
                  <p><strong>PIN:</strong> 500081</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Mail className="w-5 h-5 text-blue-600" />
                      <h3 className="text-lg font-semibold">Email</h3>
                    </div>
                    <p className="text-gray-600">support@carmarket.in</p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Phone className="w-5 h-5 text-blue-600" />
                      <h3 className="text-lg font-semibold">Phone</h3>
                    </div>
                    <p className="text-gray-600">+91 99499 89823</p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Clock className="w-5 h-5 text-blue-600" />
                      <h3 className="text-lg font-semibold">Business Hours</h3>
                    </div>
                    <p className="text-gray-600">Mon–Sat, 9:00 AM – 7:00 PM IST</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <Separator className="my-8" />

          <section className="mb-12">
            <div className="flex items-center gap-3 mb-8">
              <Globe2 className="w-7 h-7 text-blue-600" />
              <h2 className="text-3xl font-semibold text-gray-800">Follow Us</h2>
            </div>
            <div className="flex justify-start gap-6">
              <a 
                href="https://facebook.com" 
                target="_blank"
                rel="noopener noreferrer"
                className="group"
              >
                <Facebook className="w-6 h-6 text-[#1877F2]" />
              </a>
              
              <a 
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer" 
                className="group"
              >
                <Instagram className="w-6 h-6 text-[#E4405F]" />
              </a>
              
              <a 
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer" 
                className="group"
              >
                <Twitter className="w-6 h-6 text-[#1DA1F2]" />
              </a>
              
              <a 
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer" 
                className="group"
              >
                <Youtube className="w-6 h-6 text-[#FF0000]" />
              </a>
            </div>
          </section>

          <Separator className="my-8" />

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <span className="mr-2">💬</span> Why Choose Us
            </h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600">
              <li>✓ 100% Verified Sellers & Buyers</li>
              <li>✓ Trusted Dealers & Genuine Owners</li>
              <li>✓ Online + Offline Marketplace</li>
              <li>✓ Professional Valuation & Inspection</li>
              <li>✓ Transparent Pricing, No Hidden Fees</li>
              <li>✓ Real-Time Chat & Offers</li>
              <li>✓ Customer Support Until Deal Completion</li>
            </ul>
          </section>

          <Separator className="my-8" />

        </CardContent>
      </Card>
    </div>
    <Footer />
  </div>
  );
}