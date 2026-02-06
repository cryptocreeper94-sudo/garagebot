import { useState } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { 
  Plus, Wrench, Trash2, Check, Package, Loader2, 
  Calendar, DollarSign, ExternalLink, ShoppingCart
} from "lucide-react";

interface ProjectPart {
  id: string;
  projectId: string;
  partName: string;
  partNumber?: string;
  vendorSlug?: string;
  purchaseUrl?: string;
  estimatedPrice?: string;
  actualPrice?: string;
  quantity: number;
  status: string;
  notes?: string;
  purchasedAt?: string;
  createdAt: string;
}

interface Project {
  id: string;
  userId: string;
  name: string;
  description?: string;
  vehicleId?: string;
  status: string;
  targetBudget?: string;
  targetDate?: string;
  isPublic: boolean;
  shareCode?: string;
  createdAt: string;
  updatedAt: string;
}

export default function Projects() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [newProject, setNewProject] = useState({ name: "", description: "", targetBudget: "", targetDate: "" });
  const [addPartOpen, setAddPartOpen] = useState(false);
  const [newPart, setNewPart] = useState({ partName: "", partNumber: "", estimatedPrice: "", quantity: "1", notes: "" });

  const { data: projects = [], isLoading: projectsLoading, error: projectsError } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
    enabled: !!user,
  });

  const { data: projectDetails, isLoading: detailsLoading, error: projectError } = useQuery<{ project: Project; parts: ProjectPart[] }>({
    queryKey: ["/api/projects", selectedProject],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${selectedProject}`);
      if (!res.ok) throw new Error("Failed to fetch project details");
      return res.json();
    },
    enabled: !!selectedProject,
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof newProject) => {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create project");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setCreateOpen(false);
      setNewProject({ name: "", description: "", targetBudget: "", targetDate: "" });
      toast({ title: "Project created!" });
    },
    onError: () => {
      toast({ title: "Failed to create project", variant: "destructive" });
    },
  });

  const addPartMutation = useMutation({
    mutationFn: async (data: typeof newPart) => {
      const res = await fetch(`/api/projects/${selectedProject}/parts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, quantity: parseInt(data.quantity) }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to add part");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", selectedProject] });
      setAddPartOpen(false);
      setNewPart({ partName: "", partNumber: "", estimatedPrice: "", quantity: "1", notes: "" });
      toast({ title: "Part added to project!" });
    },
    onError: () => {
      toast({ title: "Failed to add part", variant: "destructive" });
    },
  });

  const updatePartMutation = useMutation({
    mutationFn: async ({ partId, updates }: { partId: string; updates: Partial<ProjectPart> }) => {
      const res = await fetch(`/api/projects/${selectedProject}/parts/${partId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update part");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", selectedProject] });
      toast({ title: "Part updated!" });
    },
    onError: () => {
      toast({ title: "Failed to update part", variant: "destructive" });
    },
  });

  const deletePartMutation = useMutation({
    mutationFn: async (partId: string) => {
      const res = await fetch(`/api/projects/${selectedProject}/parts/${partId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete part");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", selectedProject] });
      toast({ title: "Part removed" });
    },
    onError: () => {
      toast({ title: "Failed to remove part", variant: "destructive" });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "purchased": return "default";
      case "ordered": return "secondary";
      case "installed": return "outline";
      case "needed": return "destructive";
      default: return "outline";
    }
  };

  const getProjectStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "default";
      case "in_progress": return "secondary";
      case "planning": return "outline";
      default: return "outline";
    }
  };

  const calculateProgress = (parts: ProjectPart[]) => {
    if (parts.length === 0) return 0;
    const completed = parts.filter(p => p.status === "installed" || p.status === "purchased").length;
    return Math.round((completed / parts.length) * 100);
  };

  const calculateTotalCost = (parts: ProjectPart[]) => {
    return parts.reduce((sum, part) => {
      const price = parseFloat((part.actualPrice || part.estimatedPrice || "0").replace(/[^0-9.]/g, ""));
      return sum + (price * part.quantity);
    }, 0);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Nav />
        <main className="container mx-auto px-4 py-16 text-center">
          <Wrench className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-3xl font-bold mb-4">Sign in to manage projects</h1>
          <p className="text-muted-foreground mb-8">Organize your build projects and track parts</p>
          <Button asChild>
            <a href="/auth">Sign In</a>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3" data-testid="text-page-title">
              <Wrench className="w-8 h-8 text-primary" />
              Build Projects
            </h1>
            <p className="text-muted-foreground mt-2">Organize parts for your vehicle builds and upgrades</p>
          </div>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90" data-testid="button-create-project">
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-dark border-primary/30">
              <DialogHeader>
                <DialogTitle>Create Project</DialogTitle>
                <DialogDescription>Start a new build project to organize your parts</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Project Name</Label>
                  <Input 
                    value={newProject.name}
                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                    placeholder="e.g., Suspension Upgrade"
                    data-testid="input-project-name"
                  />
                </div>
                <div>
                  <Label>Description (optional)</Label>
                  <Textarea 
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                    placeholder="Describe your project goals..."
                    data-testid="input-project-description"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Target Budget</Label>
                    <Input 
                      value={newProject.targetBudget}
                      onChange={(e) => setNewProject({ ...newProject, targetBudget: e.target.value })}
                      placeholder="$500"
                    />
                  </div>
                  <div>
                    <Label>Target Date</Label>
                    <Input 
                      type="date"
                      value={newProject.targetDate}
                      onChange={(e) => setNewProject({ ...newProject, targetDate: e.target.value })}
                    />
                  </div>
                </div>
                <Button 
                  onClick={() => createMutation.mutate(newProject)}
                  disabled={!newProject.name || createMutation.isPending}
                  className="w-full"
                  data-testid="button-submit-project"
                >
                  {createMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Create Project
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card className="glass-dark border-primary/20 p-4">
              <h2 className="text-lg font-semibold mb-4">Your Projects</h2>
              {projectsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : projectsError ? (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 mx-auto mb-4 text-destructive" />
                  <p className="text-destructive font-medium">Failed to load projects</p>
                  <p className="text-sm text-muted-foreground">Please try again later</p>
                </div>
              ) : projects.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No projects yet</p>
                  <p className="text-sm text-muted-foreground">Create one to get started!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {projects.map((project) => (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-3 rounded-lg cursor-pointer transition-all ${
                        selectedProject === project.id 
                          ? "bg-primary/20 border border-primary/40" 
                          : "glass-card border border-transparent"
                      }`}
                      onClick={() => setSelectedProject(project.id)}
                      data-testid={`card-project-${project.id}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{project.name}</h3>
                        <Badge variant={getProjectStatusColor(project.status)} className="text-xs">
                          {project.status}
                        </Badge>
                      </div>
                      {project.description && (
                        <p className="text-sm text-muted-foreground truncate">{project.description}</p>
                      )}
                      {project.targetBudget && (
                        <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                          <DollarSign className="w-3 h-3" />
                          Budget: {project.targetBudget}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          <div className="lg:col-span-2">
            {!selectedProject ? (
              <Card className="glass-dark border-primary/20 p-8 text-center">
                <Wrench className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Select a project to view parts</p>
              </Card>
            ) : detailsLoading ? (
              <Card className="glass-dark border-primary/20 p-8 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </Card>
            ) : projectError ? (
              <Card className="glass-dark border-destructive/20 p-8 text-center">
                <Package className="w-12 h-12 mx-auto mb-4 text-destructive" />
                <p className="text-destructive font-medium">Failed to load project</p>
                <p className="text-sm text-muted-foreground mt-2">Please try again later</p>
              </Card>
            ) : projectDetails ? (
              <Card className="glass-dark border-primary/20 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold">{projectDetails.project.name}</h2>
                    {projectDetails.project.description && (
                      <p className="text-muted-foreground">{projectDetails.project.description}</p>
                    )}
                  </div>
                  <Dialog open={addPartOpen} onOpenChange={setAddPartOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" data-testid="button-add-part">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Part
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="glass-dark border-primary/30">
                      <DialogHeader>
                        <DialogTitle>Add Part to Project</DialogTitle>
                        <DialogDescription>Add a part you need for this project</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Part Name *</Label>
                          <Input 
                            value={newPart.partName}
                            onChange={(e) => setNewPart({ ...newPart, partName: e.target.value })}
                            placeholder="e.g., Bilstein 5100 Front Shocks"
                            data-testid="input-part-name"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Part Number</Label>
                            <Input 
                              value={newPart.partNumber}
                              onChange={(e) => setNewPart({ ...newPart, partNumber: e.target.value })}
                              placeholder="Optional"
                            />
                          </div>
                          <div>
                            <Label>Est. Price</Label>
                            <Input 
                              value={newPart.estimatedPrice}
                              onChange={(e) => setNewPart({ ...newPart, estimatedPrice: e.target.value })}
                              placeholder="$0.00"
                            />
                          </div>
                        </div>
                        <div>
                          <Label>Quantity</Label>
                          <Input 
                            type="number"
                            value={newPart.quantity}
                            onChange={(e) => setNewPart({ ...newPart, quantity: e.target.value })}
                            min="1"
                          />
                        </div>
                        <div>
                          <Label>Notes</Label>
                          <Textarea 
                            value={newPart.notes}
                            onChange={(e) => setNewPart({ ...newPart, notes: e.target.value })}
                            placeholder="Any additional notes..."
                          />
                        </div>
                        <Button 
                          onClick={() => addPartMutation.mutate(newPart)}
                          disabled={!newPart.partName || addPartMutation.isPending}
                          className="w-full"
                          data-testid="button-submit-part"
                        >
                          {addPartMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                          Add to Project
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="glass-card rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold">{projectDetails.parts.length}</p>
                    <p className="text-xs text-muted-foreground">Parts</p>
                  </div>
                  <div className="glass-card rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold">${calculateTotalCost(projectDetails.parts).toFixed(0)}</p>
                    <p className="text-xs text-muted-foreground">Total Cost</p>
                  </div>
                  <div className="glass-card rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold">{calculateProgress(projectDetails.parts)}%</p>
                    <p className="text-xs text-muted-foreground">Complete</p>
                  </div>
                </div>

                <Progress value={calculateProgress(projectDetails.parts)} className="h-2 mb-6" />

                {projectDetails.parts.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No parts in this project</p>
                    <p className="text-sm text-muted-foreground">Add parts you need for your build</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {projectDetails.parts.map((part) => (
                      <motion.div
                        key={part.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between p-4 rounded-lg glass-card border border-border/50"
                        data-testid={`row-part-${part.id}`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{part.partName}</h3>
                            <Badge variant={getStatusColor(part.status)} className="text-xs">
                              {part.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                            {part.partNumber && <span>#{part.partNumber}</span>}
                            {(part.actualPrice || part.estimatedPrice) && (
                              <span>{part.actualPrice || part.estimatedPrice}</span>
                            )}
                            <span>Qty: {part.quantity}</span>
                          </div>
                          {part.notes && <p className="text-sm text-muted-foreground mt-1">{part.notes}</p>}
                        </div>
                        <div className="flex items-center gap-2">
                          {part.status === "needed" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updatePartMutation.mutate({ partId: part.id, updates: { status: "purchased" } })}
                              data-testid={`button-mark-purchased-${part.id}`}
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Purchased
                            </Button>
                          )}
                          {part.status === "purchased" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updatePartMutation.mutate({ partId: part.id, updates: { status: "installed" } })}
                              data-testid={`button-mark-installed-${part.id}`}
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Installed
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deletePartMutation.mutate(part.id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            data-testid={`button-delete-part-${part.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </Card>
            ) : null}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
