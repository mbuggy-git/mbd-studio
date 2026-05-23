import { useState } from "react";
import { Upload, FileText, AlertCircle, CheckCircle2, X, Download } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { toast } from "sonner@2.0.3";
import { Separator } from "./ui/separator";

interface VideoUpdateData {
  videoId: string;
  tags?: string[];
  videoNotes?: string;
  nextStepNotes?: string;
}

interface ImportPreviewItem {
  videoId: string;
  videoTitle?: string;
  status: 'found' | 'not_found';
  tags?: string[];
  videoNotes?: string;
  nextStepNotes?: string;
  hasChanges: boolean;
}

interface VideoBulkUpdateImporterProps {
  videos: any[];
  onUpdate: (updates: VideoUpdateData[]) => Promise<void>;
  isOpen: boolean;
  onClose: () => void;
}

export function VideoBulkUpdateImporter({ videos, onUpdate, isOpen, onClose }: VideoBulkUpdateImporterProps) {
  const [importing, setImporting] = useState(false);
  const [previewData, setPreviewData] = useState<ImportPreviewItem[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  const downloadTemplate = () => {
    const template = `Video ID,Tags (comma-separated),Video Notes,Next Step Notes
dQw4w9WgXcQ,"Figma,Core Video","This is a sample video note","This is a sample next step note"
abc123def45,"Photoshop,Design in Minutes,Update","Another video note example","Follow up on this"`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'video_bulk_update_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Template downloaded!");
  };

  const parseCSV = (text: string): VideoUpdateData[] => {
    // Parse CSV properly handling quoted fields with newlines
    const rows: string[][] = [];
    let currentRow: string[] = [];
    let currentValue = '';
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Escaped quote
          currentValue += '"';
          i++; // Skip next quote
        } else {
          // Toggle quote state (don't include the quote itself)
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        // End of field
        currentRow.push(currentValue.trim());
        currentValue = '';
      } else if (char === '\n' && !inQuotes) {
        // End of row
        currentRow.push(currentValue.trim());
        if (currentRow.some(v => v)) { // Only add non-empty rows
          rows.push(currentRow);
        }
        currentRow = [];
        currentValue = '';
      } else if (char === '\r' && nextChar === '\n' && !inQuotes) {
        // Windows line ending - skip \r, let \n handle it
        continue;
      } else if (char === '\r' && !inQuotes) {
        // Mac line ending
        currentRow.push(currentValue.trim());
        if (currentRow.some(v => v)) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    
    // Add last field and row if any
    if (currentValue || currentRow.length > 0) {
      currentRow.push(currentValue.trim());
      if (currentRow.some(v => v)) {
        rows.push(currentRow);
      }
    }

    if (rows.length < 2) {
      throw new Error("CSV file must contain a header row and at least one data row");
    }

    // Parse header
    const header = rows[0].map(h => h.trim().toLowerCase());
    
    // Find column indices
    const videoIdIndex = header.findIndex(h => h.includes('video') && h.includes('id'));
    const tagsIndex = header.findIndex(h => h.includes('tag'));
    const videoNotesIndex = header.findIndex(h => h.includes('video') && h.includes('note'));
    const nextStepNotesIndex = header.findIndex(h => h.includes('next') && h.includes('step'));

    if (videoIdIndex === -1) {
      throw new Error("CSV must contain a 'Video ID' column");
    }

    const updates: VideoUpdateData[] = [];

    // Parse data rows
    for (let i = 1; i < rows.length; i++) {
      const values = rows[i];

      const videoId = values[videoIdIndex]?.trim();
      if (!videoId) continue;

      const update: VideoUpdateData = { videoId };

      // Parse tags (quotes are already removed by the parser)
      if (tagsIndex !== -1 && values[tagsIndex]) {
        const tagsStr = values[tagsIndex].trim();
        if (tagsStr) {
          update.tags = tagsStr.split(',').map(t => t.trim()).filter(t => t);
        }
      }

      // Parse video notes (quotes are already removed by the parser)
      if (videoNotesIndex !== -1 && values[videoNotesIndex]) {
        const notes = values[videoNotesIndex].trim();
        if (notes) {
          update.videoNotes = notes;
        }
      }

      // Parse next step notes (quotes are already removed by the parser)
      if (nextStepNotesIndex !== -1 && values[nextStepNotesIndex]) {
        const nextSteps = values[nextStepNotesIndex].trim();
        if (nextSteps) {
          update.nextStepNotes = nextSteps;
        }
      }

      // Only add if there's at least one update field
      if (update.tags || update.videoNotes || update.nextStepNotes) {
        updates.push(update);
      }
    }

    return updates;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setParseError(null);
    setImporting(true);

    try {
      const text = await file.text();
      const updates = parseCSV(text);

      // Create preview data
      const preview: ImportPreviewItem[] = updates.map(update => {
        const existingVideo = videos.find(v => v.videoId === update.videoId);
        
        const hasChanges = Boolean(
          update.tags || 
          update.videoNotes || 
          update.nextStepNotes
        );

        return {
          videoId: update.videoId,
          videoTitle: existingVideo?.title,
          status: existingVideo ? 'found' : 'not_found',
          tags: update.tags,
          videoNotes: update.videoNotes,
          nextStepNotes: update.nextStepNotes,
          hasChanges
        };
      });

      setPreviewData(preview);
      setShowPreview(true);
    } catch (error) {
      setParseError(error instanceof Error ? error.message : "Failed to parse CSV file");
      toast.error("Failed to parse CSV file");
    } finally {
      setImporting(false);
      event.target.value = ''; // Reset input
    }
  };

  const handleApplyUpdates = async () => {
    setImporting(true);
    try {
      const updates = previewData
        .filter(item => item.status === 'found' && item.hasChanges)
        .map(item => ({
          videoId: item.videoId,
          tags: item.tags,
          videoNotes: item.videoNotes,
          nextStepNotes: item.nextStepNotes
        }));

      await onUpdate(updates);
      
      const successCount = updates.length;
      toast.success(`Successfully updated ${successCount} video${successCount !== 1 ? 's' : ''}!`);
      
      setShowPreview(false);
      setPreviewData([]);
      onClose();
    } catch (error) {
      toast.error("Failed to update videos");
      console.log("Bulk update error:", error);
    } finally {
      setImporting(false);
    }
  };

  const foundCount = previewData.filter(item => item.status === 'found').length;
  const notFoundCount = previewData.filter(item => item.status === 'not_found').length;
  const updateCount = previewData.filter(item => item.status === 'found' && item.hasChanges).length;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        setShowPreview(false);
        setPreviewData([]);
        setParseError(null);
      }
      onClose();
    }}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Bulk Update Videos from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file to update tags, video notes, and next step notes for multiple videos at once.
          </DialogDescription>
        </DialogHeader>

        {!showPreview ? (
          <div className="space-y-4">
            {parseError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Parse Error</AlertTitle>
                <AlertDescription>{parseError}</AlertDescription>
              </Alert>
            )}

            <Card className="p-6 border-dashed">
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="rounded-full bg-blue-100 p-3">
                  <Upload className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="mb-2">Upload CSV File</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    CSV should contain columns: Video ID, Tags, Video Notes, Next Step Notes
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button onClick={downloadTemplate} variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download Template
                    </Button>
                    <label htmlFor="csv-upload">
                      <Button asChild disabled={importing}>
                        <span>
                          <FileText className="h-4 w-4 mr-2" />
                          {importing ? "Processing..." : "Choose File"}
                        </span>
                      </Button>
                      <input
                        id="csv-upload"
                        type="file"
                        accept=".csv"
                        onChange={handleFileUpload}
                        className="hidden"
                        disabled={importing}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </Card>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>CSV Format</AlertTitle>
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1 mt-2 text-sm">
                  <li><strong>Video ID:</strong> Required - YouTube video ID</li>
                  <li><strong>Tags:</strong> Optional - Comma-separated tags (e.g., "Figma,Core Video")</li>
                  <li><strong>Video Notes:</strong> Optional - Notes about the video</li>
                  <li><strong>Next Step Notes:</strong> Optional - Next steps or action items</li>
                  <li>Wrap fields with commas or line breaks in double quotes ("text")</li>
                  <li>To include quotes in text, double them ("")</li>
                  <li>Videos not found in your database will be skipped</li>
                </ul>
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <Card className="p-4 bg-green-50 border-green-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <div>
                    <div className="text-sm text-muted-foreground">Found</div>
                    <div className="text-2xl">{foundCount}</div>
                  </div>
                </div>
              </Card>
              <Card className="p-4 bg-blue-50 border-blue-200">
                <div className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="text-sm text-muted-foreground">Will Update</div>
                    <div className="text-2xl">{updateCount}</div>
                  </div>
                </div>
              </Card>
              <Card className="p-4 bg-orange-50 border-orange-200">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                  <div>
                    <div className="text-sm text-muted-foreground">Not Found</div>
                    <div className="text-2xl">{notFoundCount}</div>
                  </div>
                </div>
              </Card>
            </div>

            <ScrollArea className="h-[400px] rounded-md border p-4">
              <div className="space-y-3">
                {previewData.map((item, index) => (
                  <Card key={index} className={`p-4 ${item.status === 'not_found' ? 'bg-orange-50 border-orange-200' : ''}`}>
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <code className="text-sm bg-muted px-2 py-1 rounded">{item.videoId}</code>
                            {item.status === 'found' ? (
                              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Found
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Not Found
                              </Badge>
                            )}
                          </div>
                          {item.videoTitle && (
                            <div className="text-sm mb-2">{item.videoTitle}</div>
                          )}
                        </div>
                      </div>
                      
                      {item.hasChanges && (
                        <>
                          <Separator />
                          <div className="space-y-2 text-sm">
                            {item.tags && item.tags.length > 0 && (
                              <div>
                                <span className="text-muted-foreground">Tags:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {item.tags.map((tag, i) => (
                                    <Badge key={i} variant="secondary">{tag}</Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            {item.videoNotes && (
                              <div>
                                <span className="text-muted-foreground">Video Notes:</span>
                                <div className="mt-1 text-sm bg-muted p-2 rounded whitespace-pre-wrap">{item.videoNotes}</div>
                              </div>
                            )}
                            {item.nextStepNotes && (
                              <div>
                                <span className="text-muted-foreground">Next Step Notes:</span>
                                <div className="mt-1 text-sm bg-muted p-2 rounded whitespace-pre-wrap">{item.nextStepNotes}</div>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>

            {notFoundCount > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Videos Not Found</AlertTitle>
                <AlertDescription>
                  {notFoundCount} video{notFoundCount !== 1 ? 's' : ''} from your CSV {notFoundCount !== 1 ? 'were' : 'was'} not found in your database and will be skipped.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        <DialogFooter>
          {showPreview ? (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setShowPreview(false);
                  setPreviewData([]);
                }}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleApplyUpdates}
                disabled={importing || updateCount === 0}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                {importing ? "Updating..." : `Update ${updateCount} Video${updateCount !== 1 ? 's' : ''}`}
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
