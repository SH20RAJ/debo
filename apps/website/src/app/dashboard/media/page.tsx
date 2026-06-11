import { MediaGallery } from "@/components/media/media-gallery";

export const metadata = {
  title: "Media",
  description: "Your video recordings, voice notes, and photos.",
};

export default function MediaPage() {
  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Media</h1>
        <p className="text-muted-foreground mt-1">
          Video recordings, voice notes, diary photos, and uploaded images.
        </p>
      </div>
      <MediaGallery />
    </div>
  );
}
