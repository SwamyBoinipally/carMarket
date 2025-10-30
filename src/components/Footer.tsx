import { Separator } from "./ui/separator";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-white to-gray-50 shadow-sm border-t mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row justify-center items-center gap-2 text-center">
          <div className="flex flex-col gap-1 text-gray-600 text-sm">
            <p>© 2025 carMarket. All rights reserved.</p>
            <p>
              Powered by{" "}
              <a 
                href="https://www.brandiumtechnologies.com/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                Brandium Technologies
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}