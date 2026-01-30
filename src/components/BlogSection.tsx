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

  // Inicializaci¨®n din¨¢mica: Solo B tiene el contenido de prueba
  const getInitialValue = (): BlogPost[] => {
    if (section === "B") {
      return [{
        id: "prueba-clases-b",
        title: "Prueba del Blog",
        content: "Esta es solo una prueba del blog, aqui se pasara imagenes de algunas clases en particular, materias, etc.",
        imageUrl: "https://i.imgur.com/BWbyw9p.jpeg",
        links: [{ label: "Ver material", url: "https://imgur.com/a/YLF9G6o" }],
        createdAt: new Date().toISOString(),
      }];
    }
    return [];
  };

  const [posts, setPosts] = useLocalStorage<BlogPost[]>(`blog-posts-section-${section}`, getInitialValue());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [links, setLinks] = useState<{ label: string; url: string }[]>([]);
  const [newLinkLabel, setNewLinkLabel] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");

  const resetForm = () => {
    setTitle(""); setContent(""); setImageUrl(""); setLinks([]);
    setNewLinkLabel(""); setNewLinkUrl(""); setEditingPost(null);
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
      setNewLinkLabel(""); setNewLinkUrl("");
    }
  };

  const handleRemoveLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!title || !content) return;
    const newPost: BlogPost = {
      id: editingPost?.id || crypto.randomUUID(),
      title, content,
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

  const getImageUrl = (url: string) => {
    if (!url) return "";
    let cleanUrl = url.replace(/\[img\]|\[\/img\]/gi, "").trim();
    if (cleanUrl.includes('imgur.com/a/')) {
      const albumId = cleanUrl.split('/a/')[1]?.split('/')[0]?.split('?')[0];
      return `https://i.imgur.com/${albumId}.jpg`;
    }
    return cleanUrl;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Anuncios</h2>
          <p className="text-sm text-muted-foreground">
            Secci&oacute;n {section} &bull; {posts.length} publicaciones
          </p>
        </div>
        
        {isAuthenticated && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()} className="gap-2 rounded-full shadow-md">
                <Plus className="h-4 w-4" /> Nuevo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingPost ? "Editar publicaci\u00F3n" : "Nueva publicaci\u00F3n"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>T&iacute;tulo</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} className="bg-background" />
                </div>
                <div className="space-y-2">
                  <Label>Descripci&oacute;n</Label>
                  <Textarea value={content} onChange={(e) => setContent(e.target.value)} className="bg-background" />
                </div>
                <div className="space-y-2">
                  <Label>URL Imagen</Label>
                  <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="bg-background" />
                </div>
                <div className="space-y-2">
                  <Label>Enlaces</Label>
                  {links.map((link, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-secondary rounded-lg">
                      <span className="flex-1 text-sm truncate">{link.label}</span>
                      <Button variant="ghost" size="icon" onClick={() => handleRemoveLink(index)}><X className="h-4 w-4" /></Button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Input value={newLinkLabel} onChange={(e) => setNewLinkLabel(e.target.value)} placeholder="Ej: PDF" />
                    <Input value={newLinkUrl} onChange={(e) => setNewLinkUrl(e.target.value)} placeholder="URL" />
                    <Button variant="secondary" onClick={handleAddLink} disabled={!newLinkLabel || !newLinkUrl}><Plus /></Button>
                  </div>
                </div>
                <Button onClick={handleSubmit} className="w-full h-12 rounded-xl">Guardar</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="space-y-4">
        {posts.map((post) => (
          <Card key={post.id} className="overflow-hidden border-border bg-card shadow-md">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Avatar className="border border-border">
                  <AvatarFallback className="bg-primary text-primary-foreground font-bold">{section}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-sm text-foreground">Secci&oacute;n {section}</p>
                  <p className="text-xs text-muted-foreground">{format(new Date(post.createdAt), "d MMM yyyy", { locale: es })}</p>
                </div>
              </div>
              {isAuthenticated && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full"><MoreHorizontal className="h-5 w-5 text-muted-foreground" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleOpenDialog(post)}>Editar</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDelete(post.id)} className="text-destructive">Eliminar</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {post.imageUrl && (
              <a 
                href={getImageUrl(post.imageUrl)} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="block aspect-video bg-muted relative group overflow-hidden"
              >
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center">
                  <ExternalLink className="text-white h-8 w-8" />
                </div>
                <img
                  src={getImageUrl(post.imageUrl)}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://i.imgur.com/BWbyw9p.jpeg'; }}
                />
              </a>
            )}

            <div className="flex items-center gap-4 p-4 pb-2">
              <Heart className="h-6 w-6 cursor-pointer hover:text-red-500 transition-colors text-muted-foreground" />
              <MessageCircle className="h-6 w-6 cursor-pointer hover:text-primary transition-colors text-muted-foreground" />
              <Share2 className="h-6 w-6 cursor-pointer hover:text-primary transition-colors text-muted-foreground" />
            </div>

            <div className="px-4 pb-4 space-y-2">
              <p className="text-sm leading-relaxed">
                <span className="font-bold text-foreground">{post.title}</span>
                {" "}
                <span className="text-muted-foreground">{post.content}</span>
              </p>
              {post.links && post.links.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {post.links.map((link, index) => (
                    <a key={index} href={link.url} target="_blank" className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline">
                      <ExternalLink className="h-3 w-3" /> {link.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}