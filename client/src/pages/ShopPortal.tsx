import { useState } from "react";
import Nav from "@/components/Nav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Store, Users, MessageSquare, Settings, Star, MapPin, Phone, 
  Mail, Clock, Wrench, Send, ChevronRight, Loader2, Building2,
  UserPlus, Calendar, DollarSign, AlertCircle, CheckCircle, Eye
} from "lucide-react";

interface Shop {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phone?: string;
  email?: string;
  website?: string;
  rating?: string;
  reviewCount?: number;
  isActive: boolean;
  createdAt: string;
}

interface ShopCustomer {
  id: string;
  shopId: string;
  userId?: string;
  name?: string;
  phone?: string;
  email?: string;
  notes?: string;
  lastVisit?: string;
  createdAt: string;
}

interface MessageTemplate {
  id: string;
  name: string;
  content: string;
  messageType: string;
  isSystem: boolean;
}

interface Message {
  id: string;
  recipient: string;
  content: string;
  messageType: string;
  status: string;
  createdAt: string;
}

export default function ShopPortal() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [createShopOpen, setCreateShopOpen] = useState(false);
  const [addCustomerOpen, setAddCustomerOpen] = useState(false);
  const [sendMessageOpen, setSendMessageOpen] = useState(false);
  const [newShop, setNewShop] = useState({ name: "", description: "", address: "", city: "", state: "", zipCode: "", phone: "", email: "" });
  const [newCustomer, setNewCustomer] = useState({ name: "", phone: "", email: "", notes: "" });
  const [messageData, setMessageData] = useState({ recipient: "", content: "", messageType: "sms" });
  const [selectedCustomer, setSelectedCustomer] = useState<ShopCustomer | null>(null);

  const { data: myShops = [], isLoading: shopsLoading } = useQuery<Shop[]>({
    queryKey: ["/api/my-shops"],
    enabled: !!user,
  });

  const { data: customers = [], isLoading: customersLoading, refetch: refetchCustomers } = useQuery<ShopCustomer[]>({
    queryKey: ["/api/shops", selectedShop?.id, "customers"],
    queryFn: async () => {
      if (!selectedShop) return [];
      const res = await fetch(`/api/shops/${selectedShop.id}/customers`);
      return await res.json();
    },
    enabled: !!selectedShop,
  });

  const { data: templates = [] } = useQuery<MessageTemplate[]>({
    queryKey: ["/api/message-templates", selectedShop?.id],
    queryFn: async () => {
      const res = await fetch(`/api/message-templates${selectedShop ? `?shopId=${selectedShop.id}` : ''}`);
      return await res.json();
    },
    enabled: !!user,
  });

  const { data: messageHistory = [], refetch: refetchMessages } = useQuery<Message[]>({
    queryKey: ["/api/messages/history", selectedShop?.id],
    queryFn: async () => {
      const res = await fetch(`/api/messages/history${selectedShop ? `?shopId=${selectedShop.id}` : ''}`);
      return await res.json();
    },
    enabled: !!selectedShop,
  });

  const createShopMutation = useMutation({
    mutationFn: async (shop: typeof newShop) => {
      const res = await fetch("/api/shops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(shop)
      });
      if (!res.ok) throw new Error("Failed to create shop");
      return res.json();
    },
    onSuccess: (shop) => {
      queryClient.invalidateQueries({ queryKey: ["/api/my-shops"] });
      setCreateShopOpen(false);
      setNewShop({ name: "", description: "", address: "", city: "", state: "", zipCode: "", phone: "", email: "" });
      setSelectedShop(shop);
      toast({ title: "Shop Created", description: `${shop.name} has been registered` });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create shop", variant: "destructive" });
    }
  });

  const addCustomerMutation = useMutation({
    mutationFn: async (customer: typeof newCustomer) => {
      if (!selectedShop) throw new Error("No shop selected");
      const res = await fetch(`/api/shops/${selectedShop.id}/customers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customer)
      });
      if (!res.ok) throw new Error("Failed to add customer");
      return res.json();
    },
    onSuccess: () => {
      refetchCustomers();
      setAddCustomerOpen(false);
      setNewCustomer({ name: "", phone: "", email: "", notes: "" });
      toast({ title: "Customer Added", description: "Customer has been added to your database" });
    }
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (msg: typeof messageData) => {
      if (!selectedShop) throw new Error("No shop selected");
      const res = await fetch("/api/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...msg, shopId: selectedShop.id })
      });
      if (!res.ok) throw new Error("Failed to send message");
      return res.json();
    },
    onSuccess: (data) => {
      refetchMessages();
      setSendMessageOpen(false);
      setMessageData({ recipient: "", content: "", messageType: "sms" });
      setSelectedCustomer(null);
      toast({ 
        title: "Message Queued", 
        description: data.note || "Message has been sent",
      });
    }
  });

  const applyTemplate = (template: MessageTemplate) => {
    let content = template.content;
    if (selectedCustomer?.name) {
      content = content.replace(/{name}/g, selectedCustomer.name);
    }
    if (selectedShop?.name) {
      content = content.replace(/{shop}/g, selectedShop.name);
    }
    setMessageData(prev => ({ ...prev, content, messageType: template.messageType }));
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground font-sans">
        <Nav />
        <div className="container mx-auto px-4 pt-24 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background text-foreground font-sans">
        <Nav />
        <div className="container mx-auto px-4 pt-24 text-center">
          <Store className="w-24 h-24 mx-auto mb-6 text-primary/30" />
          <h1 className="text-3xl font-tech font-bold uppercase text-primary mb-4">Shop Portal</h1>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Register your automotive shop to connect with customers, send service reminders, and grow your business.
          </p>
          <Button size="lg" className="font-tech uppercase" onClick={() => window.location.href = "/api/login"} data-testid="button-login">
            Sign In to Get Started
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Nav />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-5xl font-tech font-bold uppercase text-primary" data-testid="text-page-title">Shop Portal</h1>
            <p className="text-muted-foreground mt-2 font-mono">CUSTOMER MANAGEMENT • SERVICE REMINDERS • MESSAGING</p>
          </div>
          <Dialog open={createShopOpen} onOpenChange={setCreateShopOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 font-tech uppercase glow-primary" data-testid="button-register-shop">
                <Plus className="w-4 h-4" /> Register Shop
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="font-tech text-xl uppercase">Register Your Shop</DialogTitle>
                <DialogDescription>Add your business to the AutoLedger network</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label>Shop Name *</Label>
                    <Input value={newShop.name} onChange={(e) => setNewShop({ ...newShop, name: e.target.value })} placeholder="Joe's Auto Repair" data-testid="input-shop-name" />
                  </div>
                  <div className="col-span-2">
                    <Label>Description</Label>
                    <Textarea value={newShop.description} onChange={(e) => setNewShop({ ...newShop, description: e.target.value })} placeholder="Full-service auto repair specializing in..." data-testid="input-shop-description" />
                  </div>
                  <div className="col-span-2">
                    <Label>Street Address</Label>
                    <Input value={newShop.address} onChange={(e) => setNewShop({ ...newShop, address: e.target.value })} placeholder="123 Main Street" data-testid="input-shop-address" />
                  </div>
                  <div>
                    <Label>City</Label>
                    <Input value={newShop.city} onChange={(e) => setNewShop({ ...newShop, city: e.target.value })} placeholder="Springfield" data-testid="input-shop-city" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label>State</Label>
                      <Input value={newShop.state} onChange={(e) => setNewShop({ ...newShop, state: e.target.value })} placeholder="IL" maxLength={2} data-testid="input-shop-state" />
                    </div>
                    <div>
                      <Label>ZIP</Label>
                      <Input value={newShop.zipCode} onChange={(e) => setNewShop({ ...newShop, zipCode: e.target.value })} placeholder="62701" data-testid="input-shop-zip" />
                    </div>
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input value={newShop.phone} onChange={(e) => setNewShop({ ...newShop, phone: e.target.value })} placeholder="(555) 123-4567" data-testid="input-shop-phone" />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input type="email" value={newShop.email} onChange={(e) => setNewShop({ ...newShop, email: e.target.value })} placeholder="contact@joesauto.com" data-testid="input-shop-email" />
                  </div>
                </div>
                <Button 
                  className="w-full font-tech uppercase"
                  onClick={() => createShopMutation.mutate(newShop)}
                  disabled={!newShop.name || createShopMutation.isPending}
                  data-testid="button-save-shop"
                >
                  {createShopMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Register Shop
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {shopsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : myShops.length === 0 ? (
          <Card className="bg-card/50 border-dashed border-2 border-muted p-12 text-center">
            <Building2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
            <h3 className="text-xl font-tech uppercase text-muted-foreground mb-2">No Shops Registered</h3>
            <p className="text-sm text-muted-foreground mb-6">Register your shop to start managing customers and sending reminders</p>
            <Button onClick={() => setCreateShopOpen(true)} className="font-tech uppercase" data-testid="button-register-first-shop">
              <Plus className="w-4 h-4 mr-2" /> Register Your First Shop
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1 space-y-4">
              <h2 className="font-tech uppercase text-sm text-muted-foreground mb-2">Your Shops ({myShops.length})</h2>
              <AnimatePresence>
                {myShops.map((shop, index) => (
                  <motion.div
                    key={shop.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card 
                      className={`p-4 cursor-pointer transition-all hover:border-primary/50 ${selectedShop?.id === shop.id ? 'border-primary bg-primary/5' : 'bg-card'}`}
                      onClick={() => setSelectedShop(shop)}
                      data-testid={`card-shop-${shop.id}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-primary/20">
                          <Store className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-tech font-bold truncate">{shop.name}</h3>
                          {shop.city && <p className="text-xs text-muted-foreground font-mono">{shop.city}, {shop.state}</p>}
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant={shop.isActive ? "default" : "secondary"} className="text-xs">
                              {shop.isActive ? "Active" : "Inactive"}
                            </Badge>
                            {shop.rating && (
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" /> {shop.rating}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="lg:col-span-3">
              {selectedShop ? (
                <motion.div
                  key={selectedShop.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="bg-card border-primary/30 overflow-hidden">
                    <div className="h-24 bg-gradient-to-r from-primary/10 to-transparent flex items-center p-6">
                      <div className="flex-1">
                        <h2 className="text-2xl font-tech font-bold uppercase">{selectedShop.name}</h2>
                        {selectedShop.address && (
                          <p className="text-muted-foreground font-mono text-sm flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {selectedShop.address}, {selectedShop.city}
                          </p>
                        )}
                      </div>
                      <Button variant="outline" size="sm" data-testid="button-shop-settings">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>

                    <Tabs defaultValue="customers" className="p-6">
                      <TabsList className="grid grid-cols-3 mb-6">
                        <TabsTrigger value="customers" className="font-tech uppercase text-xs" data-testid="tab-customers">
                          <Users className="w-4 h-4 mr-1" /> Customers
                        </TabsTrigger>
                        <TabsTrigger value="messages" className="font-tech uppercase text-xs" data-testid="tab-messages">
                          <MessageSquare className="w-4 h-4 mr-1" /> Messages
                        </TabsTrigger>
                        <TabsTrigger value="settings" className="font-tech uppercase text-xs" data-testid="tab-shop-settings">
                          <Settings className="w-4 h-4 mr-1" /> Settings
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="customers">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="font-tech uppercase text-sm">Customer Database ({customers.length})</h3>
                          <Dialog open={addCustomerOpen} onOpenChange={setAddCustomerOpen}>
                            <DialogTrigger asChild>
                              <Button size="sm" className="text-xs font-tech" data-testid="button-add-customer">
                                <UserPlus className="w-3 h-3 mr-1" /> Add Customer
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle className="font-tech uppercase">Add Customer</DialogTitle>
                                <DialogDescription>Add a customer to {selectedShop.name}</DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div>
                                  <Label>Name *</Label>
                                  <Input value={newCustomer.name} onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })} placeholder="John Smith" data-testid="input-customer-name" />
                                </div>
                                <div>
                                  <Label>Phone</Label>
                                  <Input value={newCustomer.phone} onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })} placeholder="(555) 123-4567" data-testid="input-customer-phone" />
                                </div>
                                <div>
                                  <Label>Email</Label>
                                  <Input type="email" value={newCustomer.email} onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })} placeholder="john@email.com" data-testid="input-customer-email" />
                                </div>
                                <div>
                                  <Label>Notes</Label>
                                  <Textarea value={newCustomer.notes} onChange={(e) => setNewCustomer({ ...newCustomer, notes: e.target.value })} placeholder="Vehicle info, preferences, etc." data-testid="input-customer-notes" />
                                </div>
                                <Button 
                                  className="w-full font-tech uppercase"
                                  onClick={() => addCustomerMutation.mutate(newCustomer)}
                                  disabled={!newCustomer.name || addCustomerMutation.isPending}
                                  data-testid="button-save-customer"
                                >
                                  {addCustomerMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                  Add Customer
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                        {customersLoading ? (
                          <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                          </div>
                        ) : customers.length === 0 ? (
                          <div className="text-center py-8 bg-muted/30 border border-dashed rounded-lg">
                            <Users className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
                            <h4 className="font-tech uppercase text-muted-foreground">No Customers Yet</h4>
                            <p className="text-sm text-muted-foreground mt-1">Add customers to send service reminders</p>
                          </div>
                        ) : (
                          <ScrollArea className="h-[400px]">
                            <div className="space-y-3">
                              {customers.map((customer) => (
                                <Card key={customer.id} className="p-4 bg-muted/30" data-testid={`card-customer-${customer.id}`}>
                                  <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-3">
                                      <div className="p-2 rounded-full bg-primary/10">
                                        <Users className="w-4 h-4 text-primary" />
                                      </div>
                                      <div>
                                        <h4 className="font-bold">{customer.name || 'Unknown'}</h4>
                                        <div className="flex flex-wrap gap-3 mt-1 text-xs text-muted-foreground">
                                          {customer.phone && (
                                            <span className="flex items-center gap-1">
                                              <Phone className="w-3 h-3" /> {customer.phone}
                                            </span>
                                          )}
                                          {customer.email && (
                                            <span className="flex items-center gap-1">
                                              <Mail className="w-3 h-3" /> {customer.email}
                                            </span>
                                          )}
                                        </div>
                                        {customer.notes && <p className="text-xs text-muted-foreground mt-2">{customer.notes}</p>}
                                      </div>
                                    </div>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => {
                                        setSelectedCustomer(customer);
                                        setMessageData(prev => ({ ...prev, recipient: customer.phone || customer.email || '' }));
                                        setSendMessageOpen(true);
                                      }}
                                      data-testid={`button-message-customer-${customer.id}`}
                                    >
                                      <MessageSquare className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </Card>
                              ))}
                            </div>
                          </ScrollArea>
                        )}
                      </TabsContent>

                      <TabsContent value="messages">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="font-tech uppercase text-sm">Message Center</h3>
                          <Dialog open={sendMessageOpen} onOpenChange={setSendMessageOpen}>
                            <DialogTrigger asChild>
                              <Button size="sm" className="text-xs font-tech" data-testid="button-compose-message">
                                <Send className="w-3 h-3 mr-1" /> Compose
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle className="font-tech uppercase">Send Message</DialogTitle>
                                <DialogDescription>Send SMS or email to your customers</DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-sm flex items-start gap-2">
                                  <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                                  <span className="text-amber-200">SMS sending is pending Twilio account approval. Messages will be queued.</span>
                                </div>
                                {templates.length > 0 && (
                                  <div>
                                    <Label>Quick Templates</Label>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                      {templates.map((t) => (
                                        <Button key={t.id} variant="outline" size="sm" onClick={() => applyTemplate(t)} className="text-xs">
                                          {t.name}
                                        </Button>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                <div>
                                  <Label>Recipient *</Label>
                                  <Input 
                                    value={messageData.recipient} 
                                    onChange={(e) => setMessageData({ ...messageData, recipient: e.target.value })} 
                                    placeholder="Phone or email" 
                                    data-testid="input-message-recipient" 
                                  />
                                </div>
                                <div>
                                  <Label>Type</Label>
                                  <Select value={messageData.messageType} onValueChange={(v) => setMessageData({ ...messageData, messageType: v })}>
                                    <SelectTrigger data-testid="select-message-type"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="sms">SMS</SelectItem>
                                      <SelectItem value="email">Email</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label>Message *</Label>
                                  <Textarea 
                                    value={messageData.content} 
                                    onChange={(e) => setMessageData({ ...messageData, content: e.target.value })} 
                                    placeholder="Your message..."
                                    rows={4}
                                    data-testid="input-message-content"
                                  />
                                </div>
                                <Button 
                                  className="w-full font-tech uppercase"
                                  onClick={() => sendMessageMutation.mutate(messageData)}
                                  disabled={!messageData.recipient || !messageData.content || sendMessageMutation.isPending}
                                  data-testid="button-send-message"
                                >
                                  {sendMessageMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                                  Queue Message
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                        {messageHistory.length === 0 ? (
                          <div className="text-center py-8 bg-muted/30 border border-dashed rounded-lg">
                            <MessageSquare className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
                            <h4 className="font-tech uppercase text-muted-foreground">No Messages Yet</h4>
                            <p className="text-sm text-muted-foreground mt-1">Send your first reminder to get started</p>
                          </div>
                        ) : (
                          <ScrollArea className="h-[400px]">
                            <div className="space-y-3">
                              {messageHistory.map((msg) => (
                                <Card key={msg.id} className="p-4 bg-muted/30" data-testid={`card-message-${msg.id}`}>
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <div className="flex items-center gap-2 mb-1">
                                        <Badge variant="outline" className="text-xs">{msg.messageType.toUpperCase()}</Badge>
                                        <Badge variant={msg.status === 'sent' ? 'default' : msg.status === 'failed' ? 'destructive' : 'secondary'} className="text-xs">
                                          {msg.status === 'sent' ? <CheckCircle className="w-3 h-3 mr-1" /> : null}
                                          {msg.status}
                                        </Badge>
                                      </div>
                                      <p className="text-sm font-mono">{msg.recipient}</p>
                                      <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{msg.content}</p>
                                    </div>
                                    <span className="text-xs text-muted-foreground">{new Date(msg.createdAt).toLocaleDateString()}</span>
                                  </div>
                                </Card>
                              ))}
                            </div>
                          </ScrollArea>
                        )}
                      </TabsContent>

                      <TabsContent value="settings">
                        <div className="space-y-6">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-muted/30 rounded-lg p-4">
                              <Label className="text-xs text-muted-foreground uppercase">Phone</Label>
                              <p className="font-mono">{selectedShop.phone || 'Not set'}</p>
                            </div>
                            <div className="bg-muted/30 rounded-lg p-4">
                              <Label className="text-xs text-muted-foreground uppercase">Email</Label>
                              <p className="font-mono">{selectedShop.email || 'Not set'}</p>
                            </div>
                            <div className="col-span-2 bg-muted/30 rounded-lg p-4">
                              <Label className="text-xs text-muted-foreground uppercase">Address</Label>
                              <p className="font-mono">
                                {selectedShop.address ? `${selectedShop.address}, ${selectedShop.city}, ${selectedShop.state} ${selectedShop.zipCode}` : 'Not set'}
                              </p>
                            </div>
                          </div>
                          {selectedShop.description && (
                            <div className="bg-muted/30 rounded-lg p-4">
                              <Label className="text-xs text-muted-foreground uppercase">Description</Label>
                              <p className="text-sm mt-1">{selectedShop.description}</p>
                            </div>
                          )}
                          <Button variant="outline" className="w-full font-tech uppercase">
                            <Settings className="w-4 h-4 mr-2" /> Edit Shop Details
                          </Button>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </Card>
                </motion.div>
              ) : (
                <Card className="bg-card/50 border-dashed border-2 h-full min-h-[400px] flex items-center justify-center">
                  <div className="text-center">
                    <ChevronRight className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30 rotate-180" />
                    <h3 className="font-tech uppercase text-muted-foreground">Select a Shop</h3>
                    <p className="text-sm text-muted-foreground mt-1">Click a shop to manage customers and messages</p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
