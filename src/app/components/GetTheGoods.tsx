import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import tutorialCardsImage from 'figma:asset/6cf61f8bf405894b8f1bb62dfe7ed8b5f7cc2c48.png';
import mbdStudioLogo from 'figma:asset/012ac601645c4474424634f309976a61f3e391a5.png';
import titleImage from 'figma:asset/928688118246c11022dd32ad61b41c1dc858b9d5.png';
import { Navigation } from "./Navigation";

export function GetTheGoods() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    interest: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create email body with form data
    const emailBody = `New "Get The Goods" Request:

Name: ${formData.name}
Email: ${formData.email}
Interest: ${formData.interest}

This customer is interested in purchasing the tutorial package for $75 USD.

Please follow up with payment and delivery instructions.`;

    // Create mailto link
    const mailtoUrl = `mailto:me@michellebuggy.com?subject=${encodeURIComponent('MBD Studio Connect')}&body=${encodeURIComponent(emailBody)}`;
    
    // Open default email client
    window.location.href = mailtoUrl;
  };

  return (
    <div className="min-h-screen">
      <Navigation 
        variant="default"
        currentPage="get-the-goods"
      />

      {/* Main Content with Gradient Background */}
      <div className="bg-gradient-to-br from-[#5928CB] to-[#F65CE1] min-h-[calc(100vh-73px)]">
        <div className="max-w-[900px] mx-auto px-6 py-12">
          {/* Desktop Layout: Two column with form on right (30%) */}
          <div className="hidden lg:flex gap-8 h-full">
            {/* Left Content (70%) */}
            <div className="flex-1 flex flex-col justify-center">
              {/* Title Image */}
              <div className="mb-12">
                <img 
                  src={titleImage} 
                  alt="Get The Goods!" 
                  className="w-[450px] h-auto"
                />
              </div>
              
              {/* Image and Copy Container */}
              <div className="flex items-start gap-8">
                {/* Image */}
                <div className="flex-shrink-0">
                  <img 
                    src={tutorialCardsImage} 
                    alt="Tutorial Cards featuring Photoshop AI and Figma tutorials"
                    className="w-80 h-auto"
                  />
                </div>
                
                {/* Copy Text to the right of image */}
                <div className="flex-1 flex items-center">
                  <p className="text-white text-lg leading-relaxed">
                    Get all my tutorial videos, plus all the assets and files used in them. 
                    All for one price. $75 USD for everything you need to get creative!
                  </p>
                </div>
              </div>
            </div>
            
            {/* Right Form (30%) */}
            <div className="w-[30%] flex items-center justify-end">
              <div className="bg-white rounded-lg p-8 shadow-2xl w-full max-w-sm">
                {/* Logo inside form */}
                <div className="flex justify-center mb-6">
                  <img 
                    src={mbdStudioLogo} 
                    alt="MBD Studio Logo" 
                    className="h-12 w-auto"
                  />
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-gray-700">Name</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full border-2 border-gray-200 focus:border-[#5928CB] focus:ring-2 focus:ring-[#5928CB]/20 transition-all duration-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-700">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full border-2 border-gray-200 focus:border-[#5928CB] focus:ring-2 focus:ring-[#5928CB]/20 transition-all duration-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="interest" className="text-gray-700">Interest</Label>
                    <Input
                      id="interest"
                      name="interest"
                      type="text"
                      value={formData.interest}
                      onChange={handleInputChange}
                      required
                      className="w-full border-2 border-gray-200 focus:border-[#5928CB] focus:ring-2 focus:ring-[#5928CB]/20 transition-all duration-200"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-[#5816dd] hover:bg-[#5816dd]/90 text-white"
                  >
                    Give Me The Goods
                  </Button>
                </form>
              </div>
            </div>
          </div>

          {/* Mobile Layout: Stacked vertically */}
          <div className="lg:hidden">
            {/* Main Title Image */}
            <div className="flex justify-center mb-12">
              <img 
                src={titleImage} 
                alt="Get The Goods!" 
                className="w-[450px] h-auto"
              />
            </div>
            
            {/* Content Section with Image */}
            <div className="flex justify-center mb-8">
              <div className="flex-shrink-0">
                <img 
                  src={tutorialCardsImage} 
                  alt="Tutorial Cards featuring Photoshop AI and Figma tutorials"
                  className="w-100 h-auto"
                />
              </div>
            </div>
            
            {/* Copy Text below image */}
            <div className="text-center mb-12">
              <p className="text-white text-lg leading-relaxed max-w-2xl mx-auto">
                Get all my tutorial videos, plus all the assets and files used in them. 
                All for one price. $75 USD for everything you need to get creative!
              </p>
            </div>

            {/* Form at bottom */}
            <div className="flex justify-center">
              <div className="bg-white rounded-lg p-8 shadow-2xl w-full max-w-md">
                {/* Logo inside form */}
                <div className="flex justify-center mb-6">
                  <img 
                    src={mbdStudioLogo} 
                    alt="MBD Studio Logo" 
                    className="h-12 w-auto"
                  />
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name-mobile" className="text-gray-700">Name</Label>
                    <Input
                      id="name-mobile"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full border-2 border-gray-200 focus:border-[#5928CB] focus:ring-2 focus:ring-[#5928CB]/20 transition-all duration-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email-mobile" className="text-gray-700">Email</Label>
                    <Input
                      id="email-mobile"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full border-2 border-gray-200 focus:border-[#5928CB] focus:ring-2 focus:ring-[#5928CB]/20 transition-all duration-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="interest-mobile" className="text-gray-700">Interest</Label>
                    <Input
                      id="interest-mobile"
                      name="interest"
                      type="text"
                      value={formData.interest}
                      onChange={handleInputChange}
                      required
                      className="w-full border-2 border-gray-200 focus:border-[#5928CB] focus:ring-2 focus:ring-[#5928CB]/20 transition-all duration-200"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-[#5816dd] hover:bg-[#5816dd]/90 text-white"
                  >
                    Give Me The Goods
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}