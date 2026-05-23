import { Navigation } from "../components/Navigation";
import { Footer } from "../components/Footer";
import { Download, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import cheatSheetPdf from "../../imports/MBD-AIModel-CheatSheet.pdf";

export function HelpersPage() {
  const assets = [
    {
      title: "MBD AI Model Cheat Sheet",
      description: "A comprehensive guide to AI models and their applications. Quick reference for understanding different AI architectures and use cases.",
      fileUrl: cheatSheetPdf,
      fileName: "MBD-AIModel-CheatSheet.pdf",
      fileType: "PDF",
      fileSize: "~900 KB"
    }
  ];

  const handleDownload = (fileUrl: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 bg-background">
        <Navigation currentPage="helpers" />
        <div className="max-w-7xl mx-auto p-6 lg:mx-[75px] lg:max-w-none">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="mb-2">Helpers</h1>
            <p className="text-muted-foreground">
              Download helpful resources, guides, and assets to support your journey.
            </p>
          </div>

          {/* Assets Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assets.map((asset, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader>
                  <div className="flex items-start gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-[#5928CB]/10">
                      <FileText className="w-6 h-6 text-[#5928CB]" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg leading-tight">{asset.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <span className="px-2 py-0.5 bg-gray-100 rounded">{asset.fileType}</span>
                        <span>{asset.fileSize}</span>
                      </div>
                    </div>
                  </div>
                  <CardDescription className="text-sm">
                    {asset.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => handleDownload(asset.fileUrl, asset.fileName)}
                    className="w-full bg-[#5928CB] hover:bg-[#5928CB]/90 text-white"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty State (for when more assets are added) */}
          {assets.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No assets available at the moment. Check back soon!
              </p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
