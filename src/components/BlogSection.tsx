import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
  MoreHorizontal,
  Filter,
  Tag,
  Search
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
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { assignments as assignmentsSectionB } from "@/data/assignments";
import { assignmentsSectionA } from "@/data/assignmentsSectionA";

interface BlogPost {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  links?: { label: string; url: string }[];
  createdAt: string;
  subjects: string[];
}

interface BlogSectionProps {
  section: "A" | "B";
}

export function BlogSection({ section }: BlogSectionProps) {
  const { isAuthenticated } = usePinAuth();

  const getInitialValue = (): BlogPost[] => {
    if (section === "B") {
      return [{
        id: "prueba-clases-b",
        title: "Prueba del Blog",
        content: "Esta es solo una prueba del blog, aqu\u00ED se pasar\u00E1 im\u00E1genes de algunas clases en particular, materias, etc.",
        imageUrl: "https://i.imgur.com/BWbyw9p.jpeg",
        links: [{ label: "Ver material", url: "https://imgur.com/a/YLF9G6o" }],
        createdAt: new Date().toISOString(),
        subjects: [] 
      }];
    }
    return [];
  };

  const [posts, setPosts] = useLocalStorage<BlogPost[]>(`blog-posts-section-${section}`, getInitialValue());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [links, setLinks] = useState<{ label: string; url: string }[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [newLinkLabel, setNewLinkLabel] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");

  const availableSubjects = useMemo(() => {
    const assignments = section === "A" ? assignmentsSectionA : assignmentsSectionB;
    const subjects = new Set(assignments.map(a => a.subject));
    return Array.from(subjects).sort();
  }, [section]);

  const activeSubjects = useMemo(() => {
    const subjects = new Set<string>();
    posts.forEach(post => {
      post.subjects?.forEach(s => subjects.add(s));
    });
    return Array.from(subjects);
  }, [posts]);

  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchesFilter = !selectedFilter || post.subjects?.includes(selectedFilter);
      const matchesSearch = !searchQuery || 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [posts, selectedFilter, searchQuery]);

  const resetForm = () => {
    setTitle(""); setContent(""); setImageUrl(""); setLinks([]);
    setSelectedSubjects([]); setNewLinkLabel(""); setNewLinkUrl(""); 
    setEditingPost(null);
  };

  const handleOpenDialog = (post?: BlogPost) => {
    if (post) {
      setEditingPost(post);
      setTitle(post.title);
      setContent(post.content);
      setImageUrl(post.imageUrl || "");
      setLinks(post.links || []);
      setSelectedSubjects(post.subjects || []);
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

  const toggleSubject = (subject: string) => {
    setSelectedSubjects(prev => 
      prev.includes(subject) ? prev.filter(s => s !== subject) : [...prev, subject]
    );
  };

  const handleSubmit = () => {
    if (!title || !content) return;

    const newPost: BlogPost = {
      id: editingPost?.id || crypto.randomUUID(),
      title,
      content,
      imageUrl: imageUrl || undefined,
      links: links.length > 0 ? links : undefined,
      subjects: selectedSubjects,
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

  const getImageUrlParsed = (url: string) => {
    if (!url) return "";
    let cleanUrl = url.replace(/\[img\]|\[\/img\]/gi, "").trim();
    if (cleanUrl.includes('imgur.com/a/')) {
      const albumId = cleanUrl.split('/a/')[1]?.split('/')[0]?.split('?')[0];
      if (albumId) return `https://i.imgur.com/${albumId}.jpg`;
    }
    if (cleanUrl.includes('imgur.com') && !cleanUrl.includes('i.imgur.com')) {
        const imageId = cleanUrl.split('/').pop()?.split('.')[0];
        if (imageId) return `https://i.imgur.com/${imageId}.jpg`;
    }
    return cleanUrl;
  };

  const getSubjectColor = (subject: string) => {
    const assignments = section === "A" ? assignmentsSectionA : assignmentsSectionB;
    const assignment = assignments.find(a => a.subject === subject);
    return assignment?.color || "primary";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Anuncios</h2>
          <p className="text-sm text-muted-foreground">
            Secci&oacute;n {section} &bull; {filteredPosts.length} publicaciones
          </p>
        </div>
        
        {isAuthenticated && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()} className="gap-2 rounded-full shadow-md h-10">
                <Plus className="h-4 w-4" /> Nuevo
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
                  <Label>T&iacute;tulo</Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="T&iacute;tulo de la publicaci\u00F3n"
                    className="rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Descripci&oacute;n</Label>
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Escribe tu mensaje..."
                    className="min-h-[100px] rounded-xl resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Tag className="h-4 w-4" /> Materias relacionadas
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {availableSubjects.map((subject) => {
                      const isSelected = selectedSubjects.includes(subject);
                      const color = getSubjectColor(subject);
                      return (
                        <Badge
                          key={subject}
                          variant={isSelected ? "default" : "outline"}
                          className="cursor-pointer transition-all"
                          style={isSelected ? { 
                            backgroundColor: `hsl(var(--${color}))`,
                            borderColor: `hsl(var(--${color}))`
                          } : {}}
                          onClick={() => toggleSubject(subject)}
                        >
                          {subject}
                        </Badge>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" /> URL de imagen
                  </Label>
                  <Input
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://imgur.com/..."
                    className="rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <LinkIcon className="h-4 w-4" /> Enlaces
                  </Label>
                  {links.map((link, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded-xl">
                      <span className="flex-1 text-sm truncate">{link.label}</span>
                      <Button variant="ghost" size="icon" onClick={() => handleRemoveLink(index)} className="h-8 w-8 rounded-full">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Input value={newLinkLabel} onChange={(e) => setNewLinkLabel(e.target.value)} placeholder="Etiqueta" className="rounded-xl" />
                    <Input value={newLinkUrl} onChange={(e) => setNewLinkUrl(e.target.value)} placeholder="URL" className="rounded-xl" />
                    <Button variant="outline" onClick={handleAddLink} disabled={!newLinkLabel || !newLinkUrl} className="rounded-xl">
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

      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar publicaciones..."
            className="pl-10 rounded-xl"
          />
        </div>

        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-2 pb-2">
            <Badge
              variant={selectedFilter === null ? "default" : "outline"}
              className="cursor-pointer shrink-0"
              onClick={() => setSelectedFilter(null)}
            >
              <Filter className="h-3 w-3 mr-1" /> Todos
            </Badge>
            {activeSubjects.map((subject) => {
              const color = getSubjectColor(subject);
              const isSelected = selectedFilter === subject;
              return (
                <Badge
                  key={subject}
                  variant={isSelected ? "default" : "outline"}
                  className="cursor-pointer shrink-0 transition-all"
                  style={isSelected ? { 
                    backgroundColor: `hsl(var(--${color}))`,
                    borderColor: `hsl(var(--${color}))`
                  } : {}}
                  onClick={() => setSelectedFilter(subject)}
                >
                  {subject}
                </Badge>
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {filteredPosts.length === 0 ? (
        <Card className="p-12 text-center rounded-2xl border-dashed">
          <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
            <ImageIcon className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">{searchQuery || selectedFilter ? "Sin resultados" : "Sin publicaciones"}</h3>
          <p className="text-muted-foreground text-sm">
            {searchQuery || selectedFilter ? "Intenta con otros filtros" : `Los anuncios de la Secci\u00F3n ${section} aparecer\u00E1n aqu\u00ED`}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <Card key={post.id} className="overflow-hidden rounded-2xl border-none shadow-lg bg-card">
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
                        <Edit2 className="h-4 w-4" /> Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(post.id)} className="gap-2 text-destructive">
                        <Trash2 className="h-4 w-4" /> Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              {post.subjects && post.subjects.length > 0 && (
                <div className="px-4 pb-2 flex flex-wrap gap-1">
                  {post.subjects.map((subject) => {
                    const color = getSubjectColor(subject);
                    return (
                      <Badge 
                        key={subject} 
                        variant="secondary"
                        className="text-[10px] h-5"
                        style={{ 
                          backgroundColor: `hsl(var(--${color}) / 0.15)`,
                          color: `hsl(var(--${color}))`
                        }}
                      >
                        {subject}
                      </Badge>
                    );
                  })}
                </div>
              )}

              {post.imageUrl && (
                <a 
                  href={getImageUrlParsed(post.imageUrl)} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="block aspect-video bg-muted relative group overflow-hidden"
                >
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center">
                    <ExternalLink className="text-white h-8 w-8" />
                  </div>
                  <img
                    src={getImageUrlParsed(post.imageUrl)}
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
                      <a
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
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