import { Navigation } from "./Navigation";
import { Footer } from "./Footer";
import { Skeleton } from "./ui/skeleton";

export function LoadingState() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 bg-background">
        <Navigation currentPage="home" />
        <div className="max-w-7xl mx-auto px-6 pb-6 lg:mx-[75px] lg:max-w-none">
          <div className="bg-gradient-to-r from-primary/5 to-accent/20 p-8 rounded-lg mb-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <Skeleton className="w-32 h-32 rounded-full" />
              <div className="flex-1 space-y-4">
                <Skeleton className="h-8 w-80" />
                <Skeleton className="h-4 w-full max-w-2xl" />
                <Skeleton className="h-4 w-full max-w-xl" />
                <div className="flex gap-4">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-6 w-28" />
                </div>
                <div className="flex gap-3">
                  <Skeleton className="h-10 w-36" />
                  <Skeleton className="h-10 w-48" />
                </div>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <Skeleton className="h-8 w-48 mb-4" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="w-full aspect-video rounded-lg" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
