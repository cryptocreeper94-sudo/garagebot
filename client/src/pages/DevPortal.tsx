import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Lock, CheckCircle2, Circle, Plus, ExternalLink, Trash2, 
  DollarSign, Link2, Settings, Zap, Users, Shield, Clock,
  ChevronDown, ChevronRight, Edit2, Save, X, AlertTriangle
} from "lucide-react";
import Nav from "@/components/Nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const DEV_PIN = "0424";

interface DevTask {
  id: string;
  category: string;
  title: string;
  description: string | null;
  priority: string | null;
  status: string | null;
  dueDate: string | null;
  completedAt: string | null;
  link: string | null;
  notes: string | null;
  sortOrder: number | null;
}

const CATEGORIES = [
  { id: "affiliates", name: "Affiliate Programs", icon: DollarSign, color: "text-green-400" },
  { id: "apis", name: "API Integrations", icon: Link2, color: "text-blue-400" },
  { id: "features", name: "Feature Development", icon: Zap, color: "text-yellow-400" },
  { id: "partnerships", name: "Partnerships", icon: Users, color: "text-purple-400" },
  { id: "legal", name: "Legal & Compliance", icon: Shield, color: "text-red-400" },
  { id: "infrastructure", name: "Infrastructure", icon: Settings, color: "text-cyan-400" },
];

const DEFAULT_TASKS: Omit<DevTask, 'id' | 'completedAt'>[] = [
  { category: "affiliates", title: "AutoZone Affiliate Program", description: "Sign up for AutoZone affiliate program through CJ Affiliate", priority: "high", status: "pending", dueDate: null, link: "https://www.cj.com", notes: null, sortOrder: 1 },
  { category: "affiliates", title: "O'Reilly Auto Parts Affiliate", description: "Apply for O'Reilly affiliate partnership", priority: "high", status: "pending", dueDate: null, link: "https://www.oreillyauto.com", notes: null, sortOrder: 2 },
  { category: "affiliates", title: "RockAuto Affiliate Program", description: "Join RockAuto affiliate network", priority: "high", status: "pending", dueDate: null, link: "https://www.rockauto.com", notes: null, sortOrder: 3 },
  { category: "affiliates", title: "Amazon Associates - Automotive", description: "Set up Amazon Associates for automotive category", priority: "high", status: "pending", dueDate: null, link: "https://affiliate-program.amazon.com", notes: null, sortOrder: 4 },
  { category: "affiliates", title: "Advance Auto Parts Affiliate", description: "Apply for Advance Auto affiliate program", priority: "medium", status: "pending", dueDate: null, link: "https://www.advanceautoparts.com", notes: null, sortOrder: 5 },
  { category: "affiliates", title: "NAPA Online Affiliate", description: "Join NAPA affiliate network", priority: "medium", status: "pending", dueDate: null, link: "https://www.napaonline.com", notes: null, sortOrder: 6 },
  { category: "affiliates", title: "Summit Racing Affiliate", description: "Apply for Summit Racing affiliate partnership", priority: "medium", status: "pending", dueDate: null, link: "https://www.summitracing.com", notes: null, sortOrder: 7 },
  { category: "affiliates", title: "Dennis Kirk Affiliate", description: "Powersports affiliate program", priority: "medium", status: "pending", dueDate: null, link: "https://www.denniskirk.com", notes: null, sortOrder: 8 },
  { category: "affiliates", title: "West Marine Affiliate", description: "Marine parts affiliate partnership", priority: "medium", status: "pending", dueDate: null, link: "https://www.westmarine.com", notes: null, sortOrder: 9 },
  { category: "affiliates", title: "eBay Partner Network", description: "Set up eBay Motors affiliate links", priority: "medium", status: "pending", dueDate: null, link: "https://partnernetwork.ebay.com", notes: null, sortOrder: 10 },
  { category: "apis", title: "NHTSA VIN Decoder API", description: "Integrate NHTSA VIN decoding for vehicle identification", priority: "high", status: "pending", dueDate: null, link: "https://vpic.nhtsa.dot.gov/api/", notes: null, sortOrder: 1 },
  { category: "apis", title: "NHTSA Recalls API", description: "Set up recall alerts using NHTSA recall database", priority: "high", status: "pending", dueDate: null, link: "https://www.nhtsa.gov/recalls", notes: null, sortOrder: 2 },
  { category: "apis", title: "OpenAI Vision API", description: "Enable photo-based part identification", priority: "high", status: "pending", dueDate: null, link: "https://platform.openai.com", notes: null, sortOrder: 3 },
  { category: "apis", title: "Web Speech API", description: "Implement voice search with Hey Buddy", priority: "medium", status: "pending", dueDate: null, link: "https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API", notes: null, sortOrder: 4 },
  { category: "apis", title: "Stripe Subscriptions", description: "Set up Pro tier subscription billing", priority: "high", status: "pending", dueDate: null, link: "https://stripe.com/docs/billing/subscriptions", notes: null, sortOrder: 5 },
  { category: "apis", title: "Twilio SMS API", description: "Enable SMS notifications and reminders", priority: "medium", status: "pending", dueDate: null, link: "https://www.twilio.com", notes: null, sortOrder: 6 },
  { category: "features", title: "VIN Scanner Camera", description: "Build camera-based VIN scanning feature", priority: "high", status: "pending", dueDate: null, link: null, notes: null, sortOrder: 1 },
  { category: "features", title: "Photo Part Search", description: "Snap photo → AI identifies part", priority: "high", status: "pending", dueDate: null, link: null, notes: null, sortOrder: 2 },
  { category: "features", title: "Voice Search (Hey Buddy)", description: "Voice-activated search commands", priority: "medium", status: "pending", dueDate: null, link: null, notes: null, sortOrder: 3 },
  { category: "features", title: "Predictive Maintenance", description: "Mileage-based service reminders", priority: "medium", status: "pending", dueDate: null, link: null, notes: null, sortOrder: 4 },
  { category: "features", title: "Family Garage Sharing", description: "Share vehicles with family members", priority: "medium", status: "pending", dueDate: null, link: null, notes: null, sortOrder: 5 },
  { category: "features", title: "Collaborative Carts", description: "Family can add to shared carts", priority: "low", status: "pending", dueDate: null, link: null, notes: null, sortOrder: 6 },
  { category: "features", title: "PWA Offline Mode", description: "Works without internet in garage", priority: "medium", status: "pending", dueDate: null, link: null, notes: null, sortOrder: 7 },
  { category: "features", title: "Order Tracking", description: "Track parts shipments", priority: "low", status: "pending", dueDate: null, link: null, notes: null, sortOrder: 8 },
  { category: "partnerships", title: "Insurance Company Partnerships", description: "Set up referral agreements with auto insurers", priority: "medium", status: "pending", dueDate: null, link: null, notes: null, sortOrder: 1 },
  { category: "partnerships", title: "Mechanic Shop Network", description: "Recruit shops to Shop Portal", priority: "medium", status: "pending", dueDate: null, link: null, notes: null, sortOrder: 2 },
  { category: "partnerships", title: "Extended Warranty Partners", description: "Referral deals with warranty providers", priority: "low", status: "pending", dueDate: null, link: null, notes: null, sortOrder: 3 },
  { category: "legal", title: "Terms of Service", description: "Draft and publish ToS", priority: "high", status: "pending", dueDate: null, link: null, notes: null, sortOrder: 1 },
  { category: "legal", title: "Affiliate Disclosure", description: "FTC-compliant affiliate disclosures", priority: "high", status: "pending", dueDate: null, link: null, notes: null, sortOrder: 2 },
  { category: "legal", title: "DMCA Policy", description: "Copyright protection policy", priority: "medium", status: "pending", dueDate: null, link: null, notes: null, sortOrder: 3 },
  { category: "infrastructure", title: "Domain: garagebot.io", description: "Register and configure primary domain", priority: "high", status: "pending", dueDate: null, link: "https://domains.google.com", notes: null, sortOrder: 1 },
  { category: "infrastructure", title: "Domain: garagebot.net", description: "Set up redirect domain", priority: "medium", status: "pending", dueDate: null, link: null, notes: null, sortOrder: 2 },
  { category: "infrastructure", title: "SSL Certificates", description: "Ensure SSL on all domains", priority: "high", status: "pending", dueDate: null, link: null, notes: null, sortOrder: 3 },
  { category: "infrastructure", title: "CDN Setup", description: "Configure CDN for assets", priority: "low", status: "pending", dueDate: null, link: null, notes: null, sortOrder: 4 },
];

export default function DevPortal() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(CATEGORIES.map(c => c.id));
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState({ category: "features", title: "", description: "", priority: "medium", link: "" });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading } = useQuery<DevTask[]>({
    queryKey: ['devTasks'],
    queryFn: async () => {
      const res = await fetch('/api/dev/tasks');
      if (!res.ok) throw new Error('Failed to fetch tasks');
      return res.json();
    },
    enabled: isAuthenticated,
  });

  const initTasksMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/dev/tasks/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks: DEFAULT_TASKS }),
      });
      if (!res.ok) throw new Error('Failed to initialize tasks');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devTasks'] });
      toast({ title: "Tasks initialized", description: "Default checklist loaded" });
    },
  });

  const toggleTaskMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch(`/api/dev/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, completedAt: status === 'completed' ? new Date().toISOString() : null }),
      });
      if (!res.ok) throw new Error('Failed to update task');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devTasks'] });
    },
  });

  const addTaskMutation = useMutation({
    mutationFn: async (task: typeof newTask) => {
      const res = await fetch('/api/dev/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task),
      });
      if (!res.ok) throw new Error('Failed to add task');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devTasks'] });
      setShowAddTask(false);
      setNewTask({ category: "features", title: "", description: "", priority: "medium", link: "" });
      toast({ title: "Task added", description: "New task added to checklist" });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/dev/tasks/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete task');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devTasks'] });
      toast({ title: "Task deleted" });
    },
  });

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === DEV_PIN) {
      setIsAuthenticated(true);
      setPinError(false);
    } else {
      setPinError(true);
      setPinInput("");
    }
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const getTasksByCategory = (categoryId: string) => 
    tasks.filter(t => t.category === categoryId).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

  const getCompletionStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    return { total, completed, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 };
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background text-foreground font-sans">
        <Nav />
        <div className="pt-20 min-h-[calc(100vh-5rem)] flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm"
          >
            <Card className="bg-card border-primary/30 p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
                  <Lock className="w-8 h-8 text-primary" />
                </div>
                <h1 className="font-tech text-2xl uppercase text-primary mb-2">Dev Portal</h1>
                <p className="text-sm text-muted-foreground">Enter access code to continue</p>
              </div>

              <form onSubmit={handlePinSubmit}>
                <Input
                  type="password"
                  placeholder="Enter PIN"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  className={`text-center text-2xl tracking-[0.5em] mb-4 ${pinError ? 'border-red-500' : ''}`}
                  maxLength={4}
                  data-testid="input-dev-pin"
                />
                {pinError && (
                  <p className="text-red-400 text-sm text-center mb-4">Invalid access code</p>
                )}
                <Button type="submit" className="w-full font-tech uppercase" data-testid="button-dev-login">
                  Access Portal
                </Button>
              </form>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  const stats = getCompletionStats();

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Nav />
      
      <div className="pt-20 min-h-[calc(100vh-5rem)] container mx-auto px-4 pb-20">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="font-tech text-3xl uppercase text-primary mb-2">Dev Portal</h1>
              <p className="text-muted-foreground">Your daily checklist for building GarageBot</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">{stats.percentage}%</p>
                <p className="text-xs text-muted-foreground">{stats.completed}/{stats.total} Complete</p>
              </div>
              <div className="w-24 h-24 relative">
                <svg className="w-full h-full -rotate-90">
                  <circle cx="48" cy="48" r="40" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                  <circle 
                    cx="48" cy="48" r="40" fill="none" stroke="hsl(var(--primary))" strokeWidth="8"
                    strokeDasharray={`${stats.percentage * 2.51} 251`}
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
          </div>
        </motion.div>

        {tasks.length === 0 && !isLoading && (
          <Card className="bg-card border-primary/30 p-8 text-center mb-8">
            <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <h3 className="font-tech text-xl mb-2">No Tasks Found</h3>
            <p className="text-muted-foreground mb-4">Initialize your checklist with default tasks to get started</p>
            <Button onClick={() => initTasksMutation.mutate()} className="font-tech uppercase">
              <Plus className="w-4 h-4 mr-2" /> Initialize Checklist
            </Button>
          </Card>
        )}

        <div className="flex justify-end mb-4">
          <Button 
            onClick={() => setShowAddTask(!showAddTask)} 
            variant="outline" 
            className="font-tech uppercase border-primary/30 hover:bg-primary/10"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Task
          </Button>
        </div>

        <AnimatePresence>
          {showAddTask && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <Card className="bg-card border-primary/30 p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <Select value={newTask.category} onValueChange={(v) => setNewTask(prev => ({ ...prev, category: v }))}>
                    <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={newTask.priority} onValueChange={(v) => setNewTask(prev => ({ ...prev, priority: v }))}>
                    <SelectTrigger><SelectValue placeholder="Priority" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Input 
                  placeholder="Task title" 
                  value={newTask.title} 
                  onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                  className="mb-4"
                />
                <Textarea 
                  placeholder="Description (optional)" 
                  value={newTask.description} 
                  onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                  className="mb-4"
                />
                <Input 
                  placeholder="Link URL (optional)" 
                  value={newTask.link} 
                  onChange={(e) => setNewTask(prev => ({ ...prev, link: e.target.value }))}
                  className="mb-4"
                />
                <div className="flex gap-2">
                  <Button onClick={() => addTaskMutation.mutate(newTask)} disabled={!newTask.title} className="font-tech">
                    <Save className="w-4 h-4 mr-2" /> Save Task
                  </Button>
                  <Button variant="ghost" onClick={() => setShowAddTask(false)}>
                    <X className="w-4 h-4 mr-2" /> Cancel
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-4">
          {CATEGORIES.map((category) => {
            const categoryTasks = getTasksByCategory(category.id);
            const completedCount = categoryTasks.filter(t => t.status === 'completed').length;
            const isExpanded = expandedCategories.includes(category.id);
            const IconComponent = category.icon;

            return (
              <Card key={category.id} className="bg-card border-border overflow-hidden">
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center ${category.color}`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-tech text-lg uppercase">{category.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {completedCount}/{categoryTasks.length} completed
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-20 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${categoryTasks.length > 0 ? (completedCount / categoryTasks.length) * 100 : 0}%` }}
                      />
                    </div>
                    {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                  </div>
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 space-y-2">
                        {categoryTasks.map((task) => (
                          <div
                            key={task.id}
                            className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
                              task.status === 'completed' 
                                ? 'bg-green-500/5 border-green-500/20' 
                                : 'bg-white/5 border-white/10 hover:border-primary/30'
                            }`}
                          >
                            <button
                              onClick={() => toggleTaskMutation.mutate({ 
                                id: task.id, 
                                status: task.status === 'completed' ? 'pending' : 'completed' 
                              })}
                              className="mt-0.5 shrink-0"
                            >
                              {task.status === 'completed' ? (
                                <CheckCircle2 className="w-5 h-5 text-green-400" />
                              ) : (
                                <Circle className="w-5 h-5 text-muted-foreground hover:text-primary" />
                              )}
                            </button>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <p className={`font-medium ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                                    {task.title}
                                  </p>
                                  {task.description && (
                                    <p className="text-sm text-muted-foreground mt-0.5">{task.description}</p>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  {task.priority === 'high' && (
                                    <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-[10px]">HIGH</Badge>
                                  )}
                                  {task.link && (
                                    <a 
                                      href={task.link} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-primary hover:text-primary/80"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <ExternalLink className="w-4 h-4" />
                                    </a>
                                  )}
                                  <button
                                    onClick={() => deleteTaskMutation.mutate(task.id)}
                                    className="text-muted-foreground hover:text-red-400 transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                              {task.completedAt && (
                                <p className="text-[10px] text-green-400 mt-1 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  Completed {new Date(task.completedAt).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                        {categoryTasks.length === 0 && (
                          <p className="text-center text-muted-foreground py-4 text-sm">No tasks in this category</p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
