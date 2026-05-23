import { useState } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { MessageSquare, Smile, Meh, Frown } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { projectId, publicAnonKey } from "../utils/supabase/info";

interface FeedbackDialogProps {
  open: boolean;
  onClose: () => void;
  accessToken: string | null;
}

const CATEGORIES = [
  { value: 'UI', label: 'UI Design', color: '#3B82F6' },
  { value: 'UX', label: 'User Experience', color: '#8B5CF6' },
  { value: 'YouTube', label: 'YouTube Integration', color: '#EF4444' },
  { value: 'Suggestions', label: 'Feature Suggestions', color: '#10B981' }
];

const RATINGS = [
  { value: 3, icon: Smile, label: 'Great', color: '#10B981' },
  { value: 2, icon: Meh, label: 'Okay', color: '#F59E0B' },
  { value: 1, icon: Frown, label: 'Poor', color: '#EF4444' }
];

export function FeedbackDialog({ open, onClose, accessToken }: FeedbackDialogProps) {
  const [category, setCategory] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [rating, setRating] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!category || !message.trim()) {
      toast.error("Please select a category and enter your feedback");
      return;
    }

    if (!accessToken) {
      toast.error("Authentication required to submit feedback");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6ab9c767/feedback`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({
            category,
            message: message.trim(),
            rating
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit feedback');
      }

      toast.success("Thank you for your feedback! 🎉", {
        description: "Your input helps us improve TubeLab"
      });

      // Reset form
      setCategory('');
      setMessage('');
      setRating(null);
      onClose();
    } catch (error) {
      console.log("Feedback submission error:", error);
      toast.error("Failed to submit feedback", {
        description: error instanceof Error ? error.message : "Please try again"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setCategory('');
      setMessage('');
      setRating(null);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="w-6 h-6 text-[#5928CB]" />
            <DialogTitle className="text-2xl">Send Feedback</DialogTitle>
          </div>
          <DialogDescription>
            Help us improve TubeLab by sharing your thoughts and suggestions
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Category Selection */}
          <div>
            <Label className="text-base mb-3 block">What's your feedback about?</Label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  className={`p-3 rounded-lg border-2 transition-all text-sm ${
                    category === cat.value
                      ? 'border-[#5928CB] bg-[#5928CB]/10'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  disabled={isSubmitting}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span>{cat.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Rating (Optional) */}
          <div>
            <Label className="text-base mb-3 block">
              How would you rate this aspect? <span className="text-muted-foreground text-sm">(Optional)</span>
            </Label>
            <div className="flex gap-2">
              {RATINGS.map((r) => {
                const Icon = r.icon;
                return (
                  <button
                    key={r.value}
                    onClick={() => setRating(r.value === rating ? null : r.value)}
                    className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                      rating === r.value
                        ? 'border-[#5928CB] bg-[#5928CB]/10'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    disabled={isSubmitting}
                  >
                    <Icon
                      className="w-6 h-6 mx-auto mb-1"
                      style={{ color: rating === r.value ? r.color : '#9CA3AF' }}
                    />
                    <div className="text-xs">{r.label}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Feedback Message */}
          <div>
            <Label htmlFor="feedback-message" className="text-base mb-3 block">
              Your feedback
            </Label>
            <Textarea
              id="feedback-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us what you think... What works well? What could be improved?"
              className="min-h-[120px] resize-none"
              disabled={isSubmitting}
            />
            <div className="text-xs text-muted-foreground mt-1">
              {message.length} characters
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !category || !message.trim()}
            className="flex-1"
            style={{ backgroundColor: "#5928CB" }}
          >
            {isSubmitting ? "Sending..." : "Send Feedback"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}