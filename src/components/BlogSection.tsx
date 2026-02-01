import { useState, useMemo, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/types";

type BlogPost = Tables<'blog_posts'>;

interface BlogSectionProps {
  section: "A" | "B";
}

// Funci¨®n helper para crear strings con Unicode escapes
const getText = (key: string, vars?: Record<string, string>): string => {
  const texts: Record<string, string> = {
    // T¨ªtulos y textos principales
    'anuncios': 'Anuncios',
    'seccion_count': (sec: string, count: number) => `Secci\u00F3n ${sec} - ${count} publicaciones`,
    'nuevo': 'Nuevo',
    'editar_publicacion': 'Editar publicaci\u00F3n',
    'nueva_publicacion': 'Nueva publicaci\u00F3n',
    'titulo': 'T\u00EDtulo',
    'titulo_placeholder': 'T\u00EDtulo de la publicaci\u00F3n',
    'descripcion': 'Descripci\u00F3n',
    'descripcion_placeholder': 'Escribe tu mensaje...',
    'materias_relacionadas': 'Materias relacionadas',
    'url_imagen': 'URL de imagen',
    'url_imagen_placeholder': 'https://imgur.com/...',
    'enlaces': 'Enlaces',
    'etiqueta': 'Etiqueta',
    'url': 'URL',
    'guardando': 'Guardando...',
    'guardar_cambios': 'Guardar cambios',
    'publicar': 'Publicar',
    'buscar_placeholder': 'Buscar publicaciones...',
    'todos': 'Todos',
    'sin_resultados': 'Sin resultados',
    'sin_publicaciones': 'Sin publicaciones',
    'intenta_filtros': 'Intenta con otros filtros',
    'anuncios_seccion': (sec: string) => `Los anuncios de la Secci\u00F3n ${sec} aparecer\u00E1n aqu\u00ED`,
    'seccion': (sec: string) => `Secci\u00F3n ${sec}`,
    'editar': 'Editar',
    'eliminar': 'Eliminar',
    'confirmar_eliminar': '\u00BFEst\u00E1s seguro de eliminar esta publicaci\u00F3n?',
  };

  const text = texts[key];
  
  if (typeof text === 'function' && vars) {
    return text(vars.sec || '', parseInt(vars.count || '0'));
  }
  
  return text || key;
};

export function BlogSection({ section }: BlogSectionProps) {
  const { isAuthenticated } = usePinAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
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
      if (post.subjects) {
        post.subjects.forEach(s => subjects.add(s));
      }
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

  const loadPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('section', section)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setPosts(data || []);
    } catch (error) {
      console.error("Error loading posts:", error);
    }
  };

  useEffect(() => {
    loadPosts();

    const channel = supabase
      .channel('blog_posts_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'blog_posts',
          filter: `section=eq.${section}`
        },
        () => {
          loadPosts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [section]);

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
      setImageUrl(post.image_url || "");
      setLinks((post.links as { label: string; url: string }[]) || []);
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

  const handleSubmit = async () => {
    if (!title || !content) return;

    setIsLoading(true);
    
    try {
      const postData = {
        title,
        content,
        image_url: imageUrl || null,
        links: links.length > 0 ? links : null,
        subjects: selectedSubjects,
        section,
        is_active: true
      };

      let result;
      
      if (editingPost) {
        const { data, error } = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', editingPost.id)
          .select()
          .single();

        if (error) throw error;
        result = data;
      } else {
        const { data, error } = await supabase
          .from('blog_posts')
          .insert([postData])
          .select()
          .single();

        if (error) throw error;
        result = data;
      }

      if (result) {
        if (editingPost) {
          setPosts(posts.map(p => p.id === editingPost.id ? result : p));
        } else {
          setPosts([result, ...posts]);
        }
      }

      resetForm();
      setIsDialogOpen(false);
      
    } catch (error) {
      console.error("Error saving post:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(getText('confirmar_eliminar'))) return;

    try {
      const { error } = await supabase
        .from('blog_posts')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;

      setPosts(posts.filter(p => p.id !== id));
      
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const getImageUrlParsed = (url: string | null) => {
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
          <h2 className="text-2xl font-bold tracking-tight">{getText('anuncios')}</h2>
          <p className="text-sm text-muted-foreground">
            {getText('seccion_count', { sec: section, count: filteredPosts.length.toString() })}
          </p>
        </div>
        
        {isAuthenticated && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()} className="gap-2 rounded-full shadow-md h-10">
                <Plus className="h-4 w-4" /> {getText('nuevo')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingPost ? getText('editar_publicacion') : getText('nueva_publicacion')}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>{getText('titulo')}</Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={getText('titulo_placeholder')}
                    className="rounded-xl"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{getText('descripcion')}</Label>
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={getText('descripcion_placeholder')}
                    className="min-h-[100px] rounded-xl resize-none"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Tag className="h-4 w-4" /> {getText('materias_relacionadas')}
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
                          onClick={() => !isLoading && toggleSubject(subject)}
                        >
                          {subject}
                        </Badge>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" /> {getText('url_imagen')}
                  </Label>
                  <Input
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder={getText('url_imagen_placeholder')}
                    className="rounded-xl"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <LinkIcon className="h-4 w-4" /> {getText('enlaces')}
                  </Label>
                  {links.map((link, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded-xl">
                      <span className="flex-1 text-sm truncate">{link.label}</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleRemoveLink(index)} 
                        className="h-8 w-8 rounded-full"
                        disabled={isLoading}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Input 
                      value={newLinkLabel} 
                      onChange={(e) => setNewLinkLabel(e.target.value)} 
                      placeholder={getText('etiqueta')} 
                      className="rounded-xl"
                      disabled={isLoading}
                    />
                    <Input 
                      value={newLinkUrl} 
                      onChange={(e) => setNewLinkUrl(e.target.value)} 
                      placeholder={getText('url')} 
                      className="rounded-xl"
                      disabled={isLoading}
                    />
                    <Button 
                      variant="outline" 
                      onClick={handleAddLink} 
                      disabled={!newLinkLabel || !newLinkUrl || isLoading} 
                      className="rounded-xl"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Button 
                  onClick={handleSubmit} 
                  className="w-full gap-2 h-12 rounded-xl"
                  disabled={isLoading || !title.trim() || !content.trim()}
                >
                  <Save className="h-4 w-4" />
                  {isLoading ? getText('guardando') : (editingPost ? getText('guardar_cambios') : getText('publicar'))}
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
            placeholder={getText('buscar_placeholder')}
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
              <Filter className="h-3 w-3 mr-1" /> {getText('todos')}
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
          <h3 className="text-lg font-semibold">
            {searchQuery || selectedFilter ? getText('sin_resultados') : getText('sin_publicaciones')}
          </h3>
          <p className="text-muted-foreground text-sm">
            {searchQuery || selectedFilter ? getText('intenta_filtros') : getText('anuncios_seccion', { sec: section })}
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
                    <p className="font-semibold text-sm">{getText('seccion', { sec: section })}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(post.created_at), "d MMM yyyy", { locale: es })}
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
                        <Edit2 className="h-4 w-4" /> {getText('editar')}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(post.id)} className="gap-2 text-destructive">
                        <Trash2 className="h-4 w-4" /> {getText('eliminar')}
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

              {post.image_url && (
                <a 
                  href={getImageUrlParsed(post.image_url)} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="block aspect-video bg-muted relative group overflow-hidden"
                >
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center">
                    <ExternalLink className="text-white h-8 w-8" />
                  </div>
                  <img
                    src={getImageUrlParsed(post.image_url)}
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
                
                {post.links && Array.isArray(post.links) && post.links.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {(post.links as { label: string; url: string }[]).map((link, index) => (
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