import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  MousePointerClick,
  DollarSign,
  TrendingUp,
  ExternalLink,
  Store,
  Wrench,
  Sparkles,
  Anchor,
  RefreshCw,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
} from "lucide-react";

type AffiliatePartner = {
  id: string;
  name: string;
  slug: string;
  category: string;
  subcategory?: string;
  logoUrl?: string;
  websiteUrl: string;
  affiliateUrl?: string;
  commissionRate?: string;
  commissionType?: string;
  cookieDuration?: number;
  vehicleTypes?: string[];
  partCategories?: string[];
  hasLocalPickup: boolean;
  hasApi: boolean;
  apiStatus?: string;
  priority?: number;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
};

type AffiliateNetwork = {
  id: string;
  name: string;
  slug: string;
  websiteUrl?: string;
  commissionType?: string;
  defaultCommissionRate?: string;
  isActive: boolean;
};

type ClickStats = {
  totalClicks: number;
  uniqueUsers: number;
};

type AffiliateClick = {
  id: string;
  partnerId: string;
  userId?: string;
  productName?: string;
  searchQuery?: string;
  deviceType?: string;
  country?: string;
  createdAt: string;
};

type AffiliateCommission = {
  id: string;
  partnerId: string;
  orderAmount?: string;
  commissionAmount?: string;
  status: string;
  productCategory?: string;
  productName?: string;
  createdAt: string;
};

type CommissionSummary = {
  pending: string;
  approved: string;
  paid: string;
};

const categoryIcons: Record<string, React.ReactNode> = {
  parts: <Store className="h-4 w-4" />,
  tools: <Wrench className="h-4 w-4" />,
  car_care: <Sparkles className="h-4 w-4" />,
  marine: <Anchor className="h-4 w-4" />,
};

const categoryColors: Record<string, string> = {
  parts: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  tools: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  car_care: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  marine: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
};

const statusIcons: Record<string, React.ReactNode> = {
  pending: <Clock className="h-4 w-4 text-yellow-400" />,
  approved: <CheckCircle className="h-4 w-4 text-green-400" />,
  paid: <DollarSign className="h-4 w-4 text-cyan-400" />,
  rejected: <AlertCircle className="h-4 w-4 text-red-400" />,
};

export function AffiliatesDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: partners = [], isLoading: loadingPartners } = useQuery<AffiliatePartner[]>({
    queryKey: ["/api/affiliates/partners"],
  });

  const { data: networks = [], isLoading: loadingNetworks } = useQuery<AffiliateNetwork[]>({
    queryKey: ["/api/affiliates/networks"],
  });

  const { data: clickData, isLoading: loadingClicks } = useQuery<{ clicks: AffiliateClick[]; stats: ClickStats }>({
    queryKey: ["/api/affiliates/stats/clicks"],
  });

  const { data: commissions = [], isLoading: loadingCommissions } = useQuery<AffiliateCommission[]>({
    queryKey: ["/api/affiliates/commissions"],
  });

  const { data: commissionSummary } = useQuery<CommissionSummary>({
    queryKey: ["/api/affiliates/commissions/summary"],
  });

  const seedMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/affiliates/seed", { method: "POST" });
      if (!response.ok) throw new Error("Failed to seed affiliates");
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Partners Seeded",
        description: `Added ${data.networks} networks and ${data.partners} partners`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/affiliates/partners"] });
      queryClient.invalidateQueries({ queryKey: ["/api/affiliates/networks"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to seed affiliate partners",
        variant: "destructive",
      });
    },
  });

  const togglePartnerMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const response = await fetch(`/api/affiliates/partners/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });
      if (!response.ok) throw new Error("Failed to update partner");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/affiliates/partners"] });
      toast({ title: "Partner Updated" });
    },
  });

  const activePartners = partners.filter((p) => p.isActive);
  const featuredPartners = partners.filter((p) => p.isFeatured);
  const totalClicks = clickData?.stats?.totalClicks || 0;
  const uniqueUsers = clickData?.stats?.uniqueUsers || 0;
  const totalPending = parseFloat(commissionSummary?.pending || "0");
  const totalApproved = parseFloat(commissionSummary?.approved || "0");
  const totalPaid = parseFloat(commissionSummary?.paid || "0");

  const partnersByCategory = partners.reduce((acc, partner) => {
    const cat = partner.category || "other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(partner);
    return acc;
  }, {} as Record<string, AffiliatePartner[]>);

  return (
    <div className="space-y-6" data-testid="affiliates-dashboard">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Affiliate Management</h2>
          <p className="text-gray-400">Track partners, clicks, and commissions</p>
        </div>
        {partners.length === 0 && (
          <Button
            onClick={() => seedMutation.mutate()}
            disabled={seedMutation.isPending}
            variant="outline"
            className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
            data-testid="button-seed-affiliates"
          >
            {seedMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Seed Sample Partners
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Active Partners</CardTitle>
            <Users className="h-4 w-4 text-cyan-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{activePartners.length}</div>
            <p className="text-xs text-gray-500">of {partners.length} total</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Clicks</CardTitle>
            <MousePointerClick className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalClicks.toLocaleString()}</div>
            <p className="text-xs text-gray-500">{uniqueUsers} unique users</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Pending Earnings</CardTitle>
            <Clock className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">${totalPending.toFixed(2)}</div>
            <p className="text-xs text-gray-500">{commissions.filter(c => c.status === 'pending').length} transactions</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Earned</CardTitle>
            <DollarSign className="h-4 w-4 text-cyan-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">${(totalApproved + totalPaid).toFixed(2)}</div>
            <p className="text-xs text-gray-500">${totalPaid.toFixed(2)} paid out</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-gray-800/50 border border-gray-700">
          <TabsTrigger value="overview" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
            Overview
          </TabsTrigger>
          <TabsTrigger value="partners" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
            Partners
          </TabsTrigger>
          <TabsTrigger value="clicks" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
            Clicks
          </TabsTrigger>
          <TabsTrigger value="commissions" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
            Commissions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-cyan-400" />
                  Featured Partners
                </CardTitle>
                <CardDescription>Priority partners with higher visibility</CardDescription>
              </CardHeader>
              <CardContent>
                {featuredPartners.length === 0 ? (
                  <p className="text-gray-500 text-sm">No featured partners yet</p>
                ) : (
                  <div className="space-y-3">
                    {featuredPartners.map((partner) => (
                      <div
                        key={partner.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-gray-900/50 border border-gray-700"
                        data-testid={`featured-partner-${partner.id}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
                            {categoryIcons[partner.category] || <Store className="h-5 w-5 text-cyan-400" />}
                          </div>
                          <div>
                            <p className="font-medium text-white">{partner.name}</p>
                            <p className="text-xs text-gray-500">{partner.commissionRate}% commission</p>
                          </div>
                        </div>
                        <Badge className={categoryColors[partner.category] || "bg-gray-500/10 text-gray-400"}>
                          {partner.category}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="h-5 w-5 text-cyan-400" />
                  Networks
                </CardTitle>
                <CardDescription>Affiliate networks we work with</CardDescription>
              </CardHeader>
              <CardContent>
                {networks.length === 0 ? (
                  <p className="text-gray-500 text-sm">No networks configured yet</p>
                ) : (
                  <div className="space-y-3">
                    {networks.map((network) => (
                      <div
                        key={network.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-gray-900/50 border border-gray-700"
                        data-testid={`network-${network.id}`}
                      >
                        <div>
                          <p className="font-medium text-white">{network.name}</p>
                          <p className="text-xs text-gray-500">
                            Default: {network.defaultCommissionRate}% {network.commissionType}
                          </p>
                        </div>
                        <Badge variant={network.isActive ? "default" : "secondary"}>
                          {network.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Partners by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(partnersByCategory).map(([category, categoryPartners]) => (
                  <div
                    key={category}
                    className="p-4 rounded-lg bg-gray-900/50 border border-gray-700 text-center"
                    data-testid={`category-${category}`}
                  >
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center mx-auto mb-2">
                      {categoryIcons[category] || <Store className="h-6 w-6 text-cyan-400" />}
                    </div>
                    <p className="font-medium text-white capitalize">{category.replace("_", " ")}</p>
                    <p className="text-sm text-gray-500">{categoryPartners.length} partners</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="partners" className="space-y-4">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">All Partners</CardTitle>
              <CardDescription>Manage affiliate partner relationships</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingPartners ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
                </div>
              ) : partners.length === 0 ? (
                <div className="text-center py-8">
                  <Store className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500">No affiliate partners yet</p>
                  <Button
                    onClick={() => seedMutation.mutate()}
                    className="mt-4"
                    variant="outline"
                    data-testid="button-seed-partners"
                  >
                    Add Sample Partners
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700">
                      <TableHead className="text-gray-400">Partner</TableHead>
                      <TableHead className="text-gray-400">Category</TableHead>
                      <TableHead className="text-gray-400">Commission</TableHead>
                      <TableHead className="text-gray-400">Features</TableHead>
                      <TableHead className="text-gray-400">Status</TableHead>
                      <TableHead className="text-gray-400">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {partners.map((partner) => (
                      <TableRow key={partner.id} className="border-gray-700" data-testid={`partner-row-${partner.id}`}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded bg-gray-700 flex items-center justify-center">
                              {categoryIcons[partner.category] || <Store className="h-4 w-4 text-gray-400" />}
                            </div>
                            <div>
                              <p className="font-medium text-white">{partner.name}</p>
                              <p className="text-xs text-gray-500">{partner.slug}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={categoryColors[partner.category] || "bg-gray-500/10 text-gray-400"}>
                            {partner.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-white">
                          {partner.commissionRate}%
                          <span className="text-xs text-gray-500 ml-1">
                            ({partner.cookieDuration}d cookie)
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {partner.hasLocalPickup && (
                              <Badge variant="outline" className="text-xs border-green-500/30 text-green-400">
                                Pickup
                              </Badge>
                            )}
                            {partner.hasApi && (
                              <Badge variant="outline" className="text-xs border-blue-500/30 text-blue-400">
                                API
                              </Badge>
                            )}
                            {partner.isFeatured && (
                              <Badge variant="outline" className="text-xs border-yellow-500/30 text-yellow-400">
                                Featured
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={partner.isActive}
                            onCheckedChange={(checked) =>
                              togglePartnerMutation.mutate({ id: partner.id, isActive: checked })
                            }
                            data-testid={`toggle-partner-${partner.id}`}
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-cyan-400 hover:text-cyan-300"
                            onClick={() => window.open(partner.websiteUrl, "_blank")}
                            data-testid={`visit-partner-${partner.id}`}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clicks" className="space-y-4">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Click History</CardTitle>
              <CardDescription>Recent affiliate link clicks</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingClicks ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
                </div>
              ) : !clickData?.clicks?.length ? (
                <div className="text-center py-8">
                  <MousePointerClick className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500">No clicks recorded yet</p>
                  <p className="text-xs text-gray-600 mt-2">
                    Clicks will be tracked when users visit partner sites through GarageBot
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700">
                      <TableHead className="text-gray-400">Time</TableHead>
                      <TableHead className="text-gray-400">Product/Search</TableHead>
                      <TableHead className="text-gray-400">Device</TableHead>
                      <TableHead className="text-gray-400">User</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clickData.clicks.slice(0, 50).map((click) => (
                      <TableRow key={click.id} className="border-gray-700" data-testid={`click-row-${click.id}`}>
                        <TableCell className="text-gray-400 text-sm">
                          {new Date(click.createdAt).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-white">
                          {click.productName || click.searchQuery || "-"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {click.deviceType || "unknown"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-400 text-sm">
                          {click.userId ? "Registered" : "Guest"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="commissions" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-yellow-500/10 border-yellow-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-yellow-400">Pending</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">${totalPending.toFixed(2)}</div>
              </CardContent>
            </Card>
            <Card className="bg-green-500/10 border-green-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-green-400">Approved</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">${totalApproved.toFixed(2)}</div>
              </CardContent>
            </Card>
            <Card className="bg-cyan-500/10 border-cyan-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-cyan-400">Paid</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">${totalPaid.toFixed(2)}</div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Commission History</CardTitle>
              <CardDescription>Earnings from affiliate conversions</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingCommissions ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
                </div>
              ) : commissions.length === 0 ? (
                <div className="text-center py-8">
                  <DollarSign className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500">No commissions recorded yet</p>
                  <p className="text-xs text-gray-600 mt-2">
                    Commissions will appear when users make purchases through affiliate links
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700">
                      <TableHead className="text-gray-400">Date</TableHead>
                      <TableHead className="text-gray-400">Product</TableHead>
                      <TableHead className="text-gray-400">Order Amount</TableHead>
                      <TableHead className="text-gray-400">Commission</TableHead>
                      <TableHead className="text-gray-400">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {commissions.map((commission) => (
                      <TableRow key={commission.id} className="border-gray-700" data-testid={`commission-row-${commission.id}`}>
                        <TableCell className="text-gray-400 text-sm">
                          {new Date(commission.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-white">
                          {commission.productName || commission.productCategory || "-"}
                        </TableCell>
                        <TableCell className="text-white">
                          ${parseFloat(commission.orderAmount || "0").toFixed(2)}
                        </TableCell>
                        <TableCell className="text-cyan-400 font-medium">
                          ${parseFloat(commission.commissionAmount || "0").toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {statusIcons[commission.status]}
                            <span className="text-sm capitalize">{commission.status}</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
