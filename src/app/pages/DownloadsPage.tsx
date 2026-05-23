import { useState, useEffect } from "react";
import { Navigation } from "../components/Navigation";
import { Footer } from "../components/Footer";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "../components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../components/ui/alert-dialog";
import { getSupabaseClient } from "../utils/supabase/client";
import { FolderPlus, Upload, Download, Trash2, Folder, Image as ImageIcon, Search, Grid3x3, List, ChevronRight, Home, X } from "lucide-react";
import { toast } from "sonner@2.0.3";

interface FolderItem {
  id: string;
  name: string;
  parent_folder_id: string | null;
  created_at: string;
}

interface ImageItem {
  id: string;
  folder_id: string | null;
  filename: string;
  file_path: string;
  file_size: number;
  created_at: string;
  url?: string;
}

type ViewMode = "grid" | "list";

export function DownloadsPage() {
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [newFolderName, setNewFolderName] = useState("");
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<ImageItem | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: "folder" | "image"; id: string } | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  const supabase = getSupabaseClient();

  useEffect(() => {
    checkAdminStatus();
    loadData();
  }, [currentFolderId]);

  async function checkAdminStatus() {
    const { data: { user } } = await supabase.auth.getUser();
    setIsAdmin(!!user);
  }

  async function loadData() {
    setLoading(true);
    try {
      // Load folders
      const { data: foldersData, error: foldersError } = await supabase
        .from("gallery_folders")
        .select("*")
        .eq("parent_folder_id", currentFolderId)
        .order("name");

      if (foldersError) throw foldersError;
      setFolders(foldersData || []);

      // Load images
      const { data: imagesData, error: imagesError } = await supabase
        .from("gallery_images")
        .select("*")
        .eq("folder_id", currentFolderId)
        .order("created_at", { ascending: false });

      if (imagesError) throw imagesError;

      // Get public URLs for images
      const imagesWithUrls = await Promise.all(
        (imagesData || []).map(async (img) => {
          const { data } = supabase.storage
            .from("gallery-images")
            .getPublicUrl(img.file_path);
          return { ...img, url: data.publicUrl };
        })
      );

      setImages(imagesWithUrls);
    } catch (error: any) {
      console.error("Error loading data:", error);
      toast.error("Failed to load gallery data");
    } finally {
      setLoading(false);
    }
  }

  async function createFolder() {
    if (!newFolderName.trim()) {
      toast.error("Please enter a folder name");
      return;
    }

    try {
      const { error } = await supabase.from("gallery_folders").insert({
        name: newFolderName.trim(),
        parent_folder_id: currentFolderId,
      });

      if (error) throw error;

      toast.success("Folder created successfully");
      setNewFolderName("");
      setCreateFolderOpen(false);
      loadData();
    } catch (error: any) {
      console.error("Error creating folder:", error);
      toast.error("Failed to create folder");
    }
  }

  async function uploadImages(files: FileList) {
    setUploading(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = currentFolderId ? `${currentFolderId}/${fileName}` : fileName;

        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from("gallery-images")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Save metadata to database
        const { error: dbError } = await supabase.from("gallery_images").insert({
          folder_id: currentFolderId,
          filename: file.name,
          file_path: filePath,
          file_size: file.size,
        });

        if (dbError) throw dbError;
      });

      await Promise.all(uploadPromises);
      toast.success(`${files.length} image(s) uploaded successfully`);
      setUploadDialogOpen(false);
      loadData();
    } catch (error: any) {
      console.error("Error uploading images:", error);
      toast.error("Failed to upload images");
    } finally {
      setUploading(false);
    }
  }

  async function deleteItem() {
    if (!itemToDelete) return;

    try {
      if (itemToDelete.type === "folder") {
        // Delete folder and its contents
        const { error } = await supabase
          .from("gallery_folders")
          .delete()
          .eq("id", itemToDelete.id);

        if (error) throw error;
        toast.success("Folder deleted successfully");
      } else {
        // Delete image from database
        const image = images.find((img) => img.id === itemToDelete.id);
        if (image) {
          // Delete from storage
          await supabase.storage.from("gallery-images").remove([image.file_path]);

          // Delete from database
          const { error } = await supabase
            .from("gallery_images")
            .delete()
            .eq("id", itemToDelete.id);

          if (error) throw error;
          toast.success("Image deleted successfully");
        }
      }

      setDeleteDialogOpen(false);
      setItemToDelete(null);
      loadData();
    } catch (error: any) {
      console.error("Error deleting item:", error);
      toast.error("Failed to delete item");
    }
  }

  async function downloadImage(image: ImageItem) {
    try {
      const { data, error } = await supabase.storage
        .from("gallery-images")
        .download(image.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = image.filename;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Download started");
    } catch (error: any) {
      console.error("Error downloading image:", error);
      toast.error("Failed to download image");
    }
  }

  async function downloadSelected() {
    const selectedImagesList = images.filter((img) => selectedImages.has(img.id));
    for (const image of selectedImagesList) {
      await downloadImage(image);
    }
    setSelectedImages(new Set());
  }

  function toggleImageSelection(imageId: string) {
    const newSelected = new Set(selectedImages);
    if (newSelected.has(imageId)) {
      newSelected.delete(imageId);
    } else {
      newSelected.add(imageId);
    }
    setSelectedImages(newSelected);
  }

  function getFolderPath(): FolderItem[] {
    // This would need to recursively build the path - simplified for now
    return [];
  }

  const filteredImages = images.filter((img) =>
    img.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFolders = folders.filter((folder) =>
    folder.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 to-blue-50">
      <Navigation />
      
      <main className="flex-1 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl mb-4">Studio Gallery</h1>
            <p className="text-gray-600">Browse and download images from our studio gallery</p>
          </div>

          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentFolderId(null)}
              className="h-8 px-2"
            >
              <Home className="w-4 h-4" />
            </Button>
            {getFolderPath().map((folder, index) => (
              <div key={folder.id} className="flex items-center gap-2">
                <ChevronRight className="w-4 h-4" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentFolderId(folder.id)}
                  className="h-8"
                >
                  {folder.name}
                </Button>
              </div>
            ))}
          </div>

          {/* Toolbar */}
          <div className="flex flex-wrap gap-4 items-center justify-between mb-6 bg-white p-4 rounded-lg shadow-sm">
            <div className="flex gap-2 flex-wrap">
              {isAdmin && (
                <>
                  <Dialog open={createFolderOpen} onOpenChange={setCreateFolderOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <FolderPlus className="w-4 h-4 mr-2" />
                        New Folder
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New Folder</DialogTitle>
                      </DialogHeader>
                      <Input
                        placeholder="Folder name"
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && createFolder()}
                      />
                      <DialogFooter>
                        <Button onClick={createFolder}>Create</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Images
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Upload Images</DialogTitle>
                      </DialogHeader>
                      <Input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => e.target.files && uploadImages(e.target.files)}
                        disabled={uploading}
                      />
                      {uploading && <p className="text-sm text-gray-500">Uploading...</p>}
                    </DialogContent>
                  </Dialog>
                </>
              )}

              {selectedImages.size > 0 && (
                <Button variant="outline" size="sm" onClick={downloadSelected}>
                  <Download className="w-4 h-4 mr-2" />
                  Download Selected ({selectedImages.size})
                </Button>
              )}
            </div>

            <div className="flex gap-2 items-center">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>

              <div className="flex gap-1 border rounded-lg p-1">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="h-8 w-8 p-0"
                >
                  <Grid3x3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="h-8 w-8 p-0"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading...</p>
            </div>
          ) : (
            <>
              {/* Folders */}
              {filteredFolders.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl mb-4">Folders</h2>
                  <div className={viewMode === "grid" ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4" : "space-y-2"}>
                    {filteredFolders.map((folder) => (
                      <Card
                        key={folder.id}
                        className="cursor-pointer hover:shadow-lg transition-shadow relative group"
                        onClick={() => setCurrentFolderId(folder.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <Folder className="w-8 h-8 text-[#5928CB]" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{folder.name}</p>
                              {viewMode === "list" && (
                                <p className="text-xs text-gray-500">
                                  {new Date(folder.created_at).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                            {isAdmin && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="opacity-0 group-hover:opacity-100 h-8 w-8 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setItemToDelete({ type: "folder", id: folder.id });
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Images */}
              {filteredImages.length > 0 ? (
                <div>
                  <h2 className="text-xl mb-4">Images</h2>
                  <div className={viewMode === "grid" ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4" : "space-y-2"}>
                    {filteredImages.map((image) => (
                      <Card
                        key={image.id}
                        className={`cursor-pointer hover:shadow-lg transition-shadow relative group ${
                          selectedImages.has(image.id) ? "ring-2 ring-[#5928CB]" : ""
                        }`}
                      >
                        <CardContent className="p-0">
                          {viewMode === "grid" ? (
                            <div>
                              <div
                                className="aspect-square bg-gray-100 relative overflow-hidden rounded-t-lg"
                                onClick={() => setLightboxImage(image)}
                              >
                                <img
                                  src={image.url}
                                  alt={image.filename}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute top-2 left-2">
                                  <input
                                    type="checkbox"
                                    checked={selectedImages.has(image.id)}
                                    onChange={() => toggleImageSelection(image.id)}
                                    className="w-5 h-5 cursor-pointer"
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                </div>
                                {isAdmin && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 h-8 w-8 p-0 bg-white/90"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setItemToDelete({ type: "image", id: image.id });
                                      setDeleteDialogOpen(true);
                                    }}
                                  >
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                  </Button>
                                )}
                              </div>
                              <div className="p-3">
                                <p className="text-sm font-medium truncate">{image.filename}</p>
                                <p className="text-xs text-gray-500">{formatFileSize(image.file_size)}</p>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full mt-2"
                                  onClick={() => downloadImage(image)}
                                >
                                  <Download className="w-4 h-4 mr-2" />
                                  Download
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-4 p-4">
                              <input
                                type="checkbox"
                                checked={selectedImages.has(image.id)}
                                onChange={() => toggleImageSelection(image.id)}
                                className="w-5 h-5 cursor-pointer"
                              />
                              <img
                                src={image.url}
                                alt={image.filename}
                                className="w-16 h-16 object-cover rounded cursor-pointer"
                                onClick={() => setLightboxImage(image)}
                              />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{image.filename}</p>
                                <p className="text-sm text-gray-500">
                                  {formatFileSize(image.file_size)} • {new Date(image.created_at).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => downloadImage(image)}
                                >
                                  <Download className="w-4 h-4" />
                                </Button>
                                {isAdmin && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setItemToDelete({ type: "image", id: image.id });
                                      setDeleteDialogOpen(true);
                                    }}
                                  >
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : filteredFolders.length === 0 ? (
                <div className="text-center py-12">
                  <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {searchQuery ? "No results found" : "No images in this folder"}
                  </p>
                  {isAdmin && !searchQuery && (
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => setUploadDialogOpen(true)}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Images
                    </Button>
                  )}
                </div>
              ) : null}
            </>
          )}
        </div>
      </main>

      <Footer />

      {/* Lightbox */}
      {lightboxImage && (
        <Dialog open={!!lightboxImage} onOpenChange={() => setLightboxImage(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{lightboxImage.filename}</DialogTitle>
            </DialogHeader>
            <div className="relative">
              <img
                src={lightboxImage.url}
                alt={lightboxImage.filename}
                className="w-full h-auto max-h-[70vh] object-contain"
              />
            </div>
            <DialogFooter>
              <div className="flex gap-2 w-full justify-between items-center">
                <p className="text-sm text-gray-500">
                  {formatFileSize(lightboxImage.file_size)} • {new Date(lightboxImage.created_at).toLocaleDateString()}
                </p>
                <Button onClick={() => downloadImage(lightboxImage)}>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this {itemToDelete?.type}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteItem} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}