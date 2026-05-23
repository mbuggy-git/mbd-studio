import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Send } from "lucide-react";
import { Navigation } from "./Navigation";

export function TrainingForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const emailBody = `Name: ${formData.name}
Email: ${formData.email}
Subject: ${formData.subject}

Message:
${formData.message}`;

    const mailtoUrl = `mailto:me@michellebuggy.com?subject=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(emailBody)}`;
    
    window.location.href = mailtoUrl;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation currentPage="training" />
      <div className="max-w-4xl mx-auto p-6 lg:mx-[75px] lg:max-w-none">
        {/* Header */}
        <div className="mb-8">
          <div className="text-center">
            <h1 className="mb-4 text-4xl font-bold text-foreground">
              Get 1-1 Training on Your Favorite Design Tools and Workflows
            </h1>
            <p className="text-muted-foreground max-w-3xl mx-auto text-lg leading-relaxed">
              Need a leg up? Not sure how to approach a project? I can meet with you virtually and help you get the most out of your tools and workflows. Let's speed things up, and provide your clients the best possible solutions.
            </p>
          </div>
        </div>

        {/* Form Card */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Send Us a Message</CardTitle>
            <p className="text-muted-foreground">
              Fill out the form below and we'll get back to you as soon as possible.
            </p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="font-medium">
                    Name *
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Your full name"
                    required
                    className="bg-input-background border-border"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="font-medium">
                    Email *
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your.email@example.com"
                    required
                    className="bg-input-background border-border"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="subject" className="font-medium">
                  Subject *
                </Label>
                <Input
                  id="subject"
                  name="subject"
                  type="text"
                  value={formData.subject}
                  onChange={handleInputChange}
                  placeholder="What would you like training on?"
                  required
                  className="bg-input-background border-border"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="message" className="font-medium">
                  Message *
                </Label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Tell me about your project, what tools you're using, and what specific areas you'd like help with..."
                  required
                  rows={6}
                  className="bg-input-background border-border resize-none"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-[#4b30b0] hover:bg-[#3d2590] text-white font-medium py-3"
                size="lg"
              >
                Send Message
                <Send className="w-4 h-4 ml-2" />
              </Button>
              
              <p className="text-sm text-muted-foreground text-center">
                This will open your default email client with the message pre-filled.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}