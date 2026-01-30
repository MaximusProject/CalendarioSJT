import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { usePinAuth } from "@/hooks/usePinAuth";
import { 
  Plus, 
  Image as ImageIcon, 
  Link as LinkIcon, 
  Trash2, 
  ExternalLink,
  Edit2,
  X,
  Save,
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface BlogPost {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  links?: { label: string; url: string }[];
  createdAt: string;
}

interface BlogSectionProps {
  section: "A" | "B";
}

export function BlogSection({ section }: BlogSectionProps) {
  const { isAuthenticated } = usePinAuth();
  // Posts are stored separately per section
  const [posts, setPosts] = useLocalStorage<BlogPost[]>(`blog-posts-section-${section}`, []);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [links, setLinks] = useState<{ label: string; url: string }[]>([]);
  const [newLinkLabel, setNewLinkLabel] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");

  const resetForm = () => {
    setTitle("");
    setContent("");
    setImageUrl("");
    setLinks([]);
    setNewLinkLabel("");
    setNewLinkUrl("");
    setEditingPost(null);
  };

  const handleOpenDialog = (post?: BlogPost) => {
    if (post) {
      setEditingPost(post);
      setTitle(post.title);
      setContent(post.content);
      setImageUrl(post.imageUrl || "");
      setLinks(post.links || []);
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleAddLink = () => {
    if (newLinkLabel && newLinkUrl) {
      setLinks([...links, { label: newLinkLabel, url: newLinkUrl }]);
      setNewLinkLabel("");
      setNewLinkUrl("");
    }
  };

  const handleRemoveLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!title || !content) return;

    const newPost: BlogPost = {
      id: editingPost?.id || crypto.randomUUID(),
      title,
      content,
      imageUrl: imageUrl || undefined,
      links: links.length > 0 ? links : undefined,
      createdAt: editingPost?.createdAt || new Date().toISOString(),
    };

    if (editingPost) {
      setPosts(posts.map(p => p.id === editingPost.id ? newPost : p));
    } else {
      setPosts([newPost, ...posts]);
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setPosts(posts.filter(p => p.id !== id));
  };

  // Convert Imgur album URL to direct image URL
  const getImageUrl = (url: string) => {
    if (url.includes('imgur.com/a/')) {
      // For albums, try to get the first image
      const albumId = url.split('/a/')[1]?.split('/')[0]?.split('?')[0];
      if (albumId) {
        return `https://i.imgur.com/${albumId}.jpg`;
      }
    }
    // Direct image URLs
    if (url.includes('imgur.com') && !url.includes('i.imgur.com')) {
      const imageId = url.split('/').pop()?.split('.')[0];
      if (imageId) {
        return `https://i.imgur.com/${imageId}.jpg`;
      }
    }
    return url;
  };

  return (
    <div className="space-y-6">
      {/* Instagram-style header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Anuncios</h2>
          <p className="text-sm text-muted-foreground">
            Secci&oacute;n {section} &bull; {posts.length} publicaciones
          </p>
        </div>
        
        {isAuthenticated && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()} className="gap-2 rounded-full h-10">
                <Plus className="h-4 w-4" />
                Nuevo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingPost ? "Editar publicaci\u00F3n" : "Nueva publicaci\u00F3n"}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">T&iacute;tulo</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="T&iacute;tulo de la publicaci&oacute;n"
                    className="rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Descripci&oacute;n</Label>
                  <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Escribe tu mensaje..."
                    className="min-h-[100px] rounded-xl resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="imageUrl" className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    URL de imagen (Imgur)
                  </Label>
                  <Input
                    id="imageUrl"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://imgur.com/a/ejemplo"
                    className="rounded-xl"
                  />
                  {imageUrl && (
                    <div className="mt-2 rounded-xl overflow-hidden border aspect-video bg-muted">
                      <img 
                        src={getImageUrl(imageUrl)} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.svg';
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <LinkIcon className="h-4 w-4" />
                    Enlaces
                  </Label>
                  
                  {links.map((link, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded-xl">
                      <span className="flex-1 text-sm truncate">{link.label}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveLink(index)}
                        className="h-8 w-8 rounded-full"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}

                  <div className="flex gap-2">
                    <Input
                      value={newLinkLabel}
                      onChange={(e) => setNewLinkLabel(e.target.value)}
                      placeholder="Etiqueta"
                      className="flex-1 rounded-xl"
                    />
                    <Input
                      value={newLinkUrl}
                      onChange={(e) => setNewLinkUrl(e.target.value)}
                      placeholder="URL"
                      className="flex-1 rounded-xl"
                    />
                    <Button
                      variant="outline"
                      onClick={handleAddLink}
                      disabled={!newLinkLabel || !newLinkUrl}
                      className="rounded-xl"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Button onClick={handleSubmit} className="w-full gap-2 h-12 rounded-xl">
                  <Save className="h-4 w-4" />
                  {editingPost ? "Guardar cambios" : "Publicar"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {posts.length === 0 ? (
        <Card className="p-12 text-center rounded-2xl">
          <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
            <ImageIcon className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-1">Sin publicaciones</h3>
          <p className="text-muted-foreground text-sm">
            Las publicaciones de la Secci&oacute;n {section} aparecer&aacute;n aqu&iacute;
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post.id} className="overflow-hidden rounded-2xl border-none shadow-lg">
              {/* Post Header - Instagram style */}
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border-2 border-primary">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground font-bold">
                      {section}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-sm">Secci&oacute;n {section}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(post.createdAt), "d MMM yyyy", { locale: es })}
                    </p>
                  </div>
                </div>
                
                {isAuthenticated && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                        <MoreHorizontal className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl">
                      <DropdownMenuItem onClick={() => handleOpenDialog(post)} className="gap-2">
                        <Edit2 className="h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDelete(post.id)} 
                        className="gap-2 text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              {/* Image */}
              {post.imageUrl && (
                <div className="aspect-video bg-muted">
                  <img
                    src={getImageUrl(post.imageUrl)}
                    alt={post.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.svg';
                    }}
                  />
                </div>
              )}

              {/* Actions - Instagram style */}
              <div className="flex items-center gap-4 p-4 pb-2">
                <Heart className="h-6 w-6 cursor-pointer hover:text-destructive transition-colors" />
                <MessageCircle className="h-6 w-6 cursor-pointer hover:text-primary transition-colors" />
                <Share2 className="h-6 w-6 cursor-pointer hover:text-primary transition-colors" />
              </div>

              {/* Content */}
              <div className="px-4 pb-4 space-y-2">
                <p className="text-sm">
                  <span className="font-semibold">{post.title}</span>
                  {" "}
                  <span className="text-muted-foreground">{post.content}</span>
                </p>
                
                {post.links && post.links.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {post.links.map((link, index) => (
                      <a
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" />
                        {link.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}