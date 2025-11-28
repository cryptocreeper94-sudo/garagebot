import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  Star, ThumbsUp, ThumbsDown, CheckCircle, AlertTriangle, 
  Camera, MessageSquare, ChevronDown, Filter, User, Car
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  content: string;
  fitmentConfirmed: boolean;
  vehicleInfo?: string;
  pros?: string[];
  cons?: string[];
  images?: string[];
  helpful: number;
  notHelpful: number;
  createdAt: string;
  verified: boolean;
}

interface FitmentSummary {
  partId: string;
  partName: string;
  totalReviews: number;
  averageRating: number;
  fitmentConfirmRate: number;
  ratingBreakdown: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  commonPros: string[];
  commonCons: string[];
}

interface ReviewsFitmentProps {
  partId: string;
  partName: string;
  vendorName?: string;
}

const mockFitmentSummary: FitmentSummary = {
  partId: "part-1",
  partName: "Ceramic Brake Pads",
  totalReviews: 847,
  averageRating: 4.6,
  fitmentConfirmRate: 94,
  ratingBreakdown: {
    5: 512,
    4: 218,
    3: 78,
    2: 27,
    1: 12,
  },
  commonPros: ["Easy install", "Low dust", "Quiet braking", "Great value"],
  commonCons: ["Break-in period needed", "Slightly firm pedal feel"],
};

const mockReviews: Review[] = [
  {
    id: "r1",
    userId: "u1",
    userName: "Mike T.",
    rating: 5,
    title: "Perfect fit for my 2019 Camry",
    content: "Installed these in about 45 minutes. No issues with fitment, perfect OEM replacement. Braking is smooth and quiet after the break-in period.",
    fitmentConfirmed: true,
    vehicleInfo: "2019 Toyota Camry SE",
    pros: ["Easy install", "Great stopping power", "No squealing"],
    cons: ["Needed 500 mile break-in"],
    helpful: 42,
    notHelpful: 3,
    createdAt: "2024-11-20",
    verified: true,
  },
  {
    id: "r2",
    userId: "u2",
    userName: "Sarah K.",
    rating: 4,
    title: "Good pads, minor fitment issue",
    content: "Quality pads that work great. Had to do a small amount of filing on one corner but otherwise perfect. Much better than the cheap ones I had before.",
    fitmentConfirmed: true,
    vehicleInfo: "2020 Honda Accord LX",
    pros: ["Good quality", "Responsive braking"],
    cons: ["Minor filing needed"],
    helpful: 18,
    notHelpful: 2,
    createdAt: "2024-11-15",
    verified: true,
  },
  {
    id: "r3",
    userId: "u3",
    userName: "Dave R.",
    rating: 5,
    title: "Best pads I've used",
    content: "Third set of these I've bought for different vehicles. Consistently excellent quality and they last forever. Highly recommend.",
    fitmentConfirmed: true,
    vehicleInfo: "2018 Ford F-150",
    pros: ["Long lasting", "Consistent performance"],
    helpful: 31,
    notHelpful: 0,
    createdAt: "2024-11-10",
    verified: true,
  },
];

export default function ReviewsFitment({ partId, partName, vendorName }: ReviewsFitmentProps) {
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [sortBy, setSortBy] = useState<'helpful' | 'recent' | 'rating'>('helpful');
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: summary = mockFitmentSummary } = useQuery<FitmentSummary>({
    queryKey: ['fitmentSummary', partId],
    queryFn: async () => mockFitmentSummary,
  });

  const { data: reviews = [] } = useQuery<Review[]>({
    queryKey: ['reviews', partId, sortBy, filterRating],
    queryFn: async () => {
      // In production, fetch from API with sort/filter params
      // For now, apply filtering/sorting to mock data
      let filtered = [...mockReviews];
      
      // Apply rating filter
      if (filterRating) {
        filtered = filtered.filter(r => r.rating === filterRating);
      }
      
      // Apply sorting
      switch (sortBy) {
        case 'helpful':
          filtered.sort((a, b) => b.helpful - a.helpful);
          break;
        case 'recent':
          filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
        case 'rating':
          filtered.sort((a, b) => b.rating - a.rating);
          break;
      }
      
      return filtered;
    },
  });

  const markHelpfulMutation = useMutation({
    mutationFn: async ({ reviewId, helpful }: { reviewId: string; helpful: boolean }) => {
      // In production, call API
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', partId] });
      toast({ title: "Thanks for your feedback!" });
    },
  });

  const maxRatingCount = Math.max(...Object.values(summary.ratingBreakdown));

  return (
    <Card className="bg-card border-primary/30 overflow-hidden">
      <div className="p-4 border-b border-border/40">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center">
              <Star className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <h3 className="font-tech text-lg uppercase text-primary">Reviews & Fitment</h3>
              <p className="text-xs text-muted-foreground">{summary.totalReviews} reviews for {partName}</p>
            </div>
          </div>
          <Dialog open={showWriteReview} onOpenChange={setShowWriteReview}>
            <DialogTrigger asChild>
              <Button size="sm" className="font-tech uppercase gap-1" data-testid="button-write-review">
                <MessageSquare className="w-4 h-4" /> Write Review
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="font-tech uppercase">Review {partName}</DialogTitle>
              </DialogHeader>
              <WriteReviewForm 
                partId={partId} 
                partName={partName} 
                onClose={() => setShowWriteReview(false)} 
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Rating Overview */}
          <div className="bg-muted/20 rounded-lg p-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="text-center">
                <div className="text-4xl font-tech text-primary">{summary.averageRating}</div>
                <div className="flex items-center justify-center mt-1">
                  {[1,2,3,4,5].map((star) => (
                    <Star 
                      key={star} 
                      className={`w-4 h-4 ${star <= Math.round(summary.averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-muted'}`}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{summary.totalReviews} reviews</p>
              </div>
              <div className="flex-1 space-y-1">
                {[5,4,3,2,1].map((stars) => (
                  <button
                    key={stars}
                    onClick={() => setFilterRating(filterRating === stars ? null : stars)}
                    className={`w-full flex items-center gap-2 text-xs hover:bg-muted/30 p-1 rounded transition-colors ${
                      filterRating === stars ? 'bg-muted/40' : ''
                    }`}
                  >
                    <span className="w-6">{stars}★</span>
                    <Progress 
                      value={(summary.ratingBreakdown[stars as keyof typeof summary.ratingBreakdown] / maxRatingCount) * 100} 
                      className="h-2 flex-1"
                    />
                    <span className="w-8 text-right text-muted-foreground">
                      {summary.ratingBreakdown[stars as keyof typeof summary.ratingBreakdown]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Fitment Confirmation */}
          <div className="bg-muted/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="font-tech uppercase text-sm">Fitment Verified</span>
            </div>
            <div className="mb-3">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Confirmed fit</span>
                <span className="font-medium text-green-400">{summary.fitmentConfirmRate}%</span>
              </div>
              <Progress value={summary.fitmentConfirmRate} className="h-2" />
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <p className="text-muted-foreground mb-1">Common Pros</p>
                <div className="space-y-1">
                  {summary.commonPros.slice(0, 3).map((pro, i) => (
                    <Badge key={i} variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30 text-xs">
                      {pro}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Common Cons</p>
                <div className="space-y-1">
                  {summary.commonCons.slice(0, 2).map((con, i) => (
                    <Badge key={i} variant="outline" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30 text-xs">
                      {con}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Sort */}
      <div className="p-3 border-b border-border/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          {filterRating && (
            <Badge 
              variant="outline" 
              className="cursor-pointer"
              onClick={() => setFilterRating(null)}
            >
              {filterRating} stars ×
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">Sort:</span>
          {(['helpful', 'recent', 'rating'] as const).map((option) => (
            <button
              key={option}
              onClick={() => setSortBy(option)}
              className={`px-2 py-1 rounded ${sortBy === option ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      <div className="divide-y divide-border/40">
        {reviews.map((review) => (
          <ReviewCard 
            key={review.id} 
            review={review} 
            onMarkHelpful={(helpful) => markHelpfulMutation.mutate({ reviewId: review.id, helpful })}
          />
        ))}
      </div>

      {reviews.length === 0 && (
        <div className="p-8 text-center">
          <MessageSquare className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No reviews yet</p>
          <p className="text-xs text-muted-foreground/60">Be the first to review this part</p>
        </div>
      )}
    </Card>
  );
}

function ReviewCard({ 
  review, 
  onMarkHelpful 
}: { 
  review: Review; 
  onMarkHelpful: (helpful: boolean) => void;
}) {
  return (
    <div className="p-4" data-testid={`review-card-${review.id}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-muted/30 flex items-center justify-center">
            <User className="w-4 h-4 text-muted-foreground" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{review.userName}</span>
              {review.verified && (
                <Badge variant="outline" className="text-xs bg-green-500/10 text-green-400 border-green-500/30 py-0">
                  <CheckCircle className="w-2.5 h-2.5 mr-0.5" /> Verified
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{review.createdAt}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {[1,2,3,4,5].map((star) => (
            <Star 
              key={star} 
              className={`w-3.5 h-3.5 ${star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted'}`}
            />
          ))}
        </div>
      </div>

      {/* Vehicle Info */}
      {review.vehicleInfo && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
          <Car className="w-3 h-3" />
          <span>{review.vehicleInfo}</span>
          {review.fitmentConfirmed && (
            <Badge variant="outline" className="text-xs bg-green-500/5 ml-1 py-0">
              Fitment Confirmed
            </Badge>
          )}
        </div>
      )}

      {/* Title & Content */}
      <h4 className="font-medium text-sm mb-1">{review.title}</h4>
      <p className="text-sm text-muted-foreground mb-3">{review.content}</p>

      {/* Pros/Cons */}
      {(review.pros || review.cons) && (
        <div className="flex gap-4 mb-3 text-xs">
          {review.pros && review.pros.length > 0 && (
            <div>
              <span className="text-green-400">Pros:</span>
              <span className="text-muted-foreground ml-1">{review.pros.join(", ")}</span>
            </div>
          )}
          {review.cons && review.cons.length > 0 && (
            <div>
              <span className="text-yellow-400">Cons:</span>
              <span className="text-muted-foreground ml-1">{review.cons.join(", ")}</span>
            </div>
          )}
        </div>
      )}

      {/* Helpful */}
      <div className="flex items-center gap-3 text-xs">
        <span className="text-muted-foreground">Helpful?</span>
        <button 
          onClick={() => onMarkHelpful(true)}
          className="flex items-center gap-1 text-muted-foreground hover:text-green-400 transition-colors"
        >
          <ThumbsUp className="w-3.5 h-3.5" /> {review.helpful}
        </button>
        <button 
          onClick={() => onMarkHelpful(false)}
          className="flex items-center gap-1 text-muted-foreground hover:text-red-400 transition-colors"
        >
          <ThumbsDown className="w-3.5 h-3.5" /> {review.notHelpful}
        </button>
      </div>
    </div>
  );
}

function WriteReviewForm({ 
  partId, 
  partName, 
  onClose 
}: { 
  partId: string; 
  partName: string; 
  onClose: () => void;
}) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [fitmentConfirmed, setFitmentConfirmed] = useState(true);
  const { toast } = useToast();

  const handleSubmit = () => {
    if (rating === 0) {
      toast({ title: "Please select a rating", variant: "destructive" });
      return;
    }
    if (!content.trim()) {
      toast({ title: "Please write a review", variant: "destructive" });
      return;
    }

    // In production, submit to API
    toast({ title: "Review submitted!", description: "Thanks for your feedback" });
    onClose();
  };

  return (
    <div className="space-y-4 pt-4">
      {/* Rating */}
      <div>
        <label className="text-sm font-medium mb-2 block">Your Rating</label>
        <div className="flex items-center gap-1">
          {[1,2,3,4,5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-1"
            >
              <Star 
                className={`w-6 h-6 transition-colors ${
                  star <= (hoverRating || rating) 
                    ? 'fill-yellow-400 text-yellow-400' 
                    : 'text-muted'
                }`}
              />
            </button>
          ))}
          <span className="text-sm text-muted-foreground ml-2">
            {rating > 0 && ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
          </span>
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="text-sm font-medium mb-2 block">Review Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Sum up your experience"
          className="w-full px-3 py-2 bg-muted/30 border border-border/40 rounded-lg text-sm"
        />
      </div>

      {/* Content */}
      <div>
        <label className="text-sm font-medium mb-2 block">Your Review</label>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What did you like or dislike? How was the fitment?"
          rows={4}
          className="bg-muted/30"
        />
      </div>

      {/* Fitment Confirmation */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={fitmentConfirmed}
          onChange={(e) => setFitmentConfirmed(e.target.checked)}
          className="w-4 h-4 rounded border-border/40"
        />
        <span className="text-sm">This part fit my vehicle correctly</span>
      </label>

      {/* Photo Upload */}
      <Button variant="outline" className="w-full gap-2">
        <Camera className="w-4 h-4" /> Add Photos (optional)
      </Button>

      {/* Submit */}
      <div className="flex gap-2 pt-2">
        <Button variant="outline" onClick={onClose} className="flex-1">
          Cancel
        </Button>
        <Button onClick={handleSubmit} className="flex-1 font-tech uppercase">
          Submit Review
        </Button>
      </div>
    </div>
  );
}
