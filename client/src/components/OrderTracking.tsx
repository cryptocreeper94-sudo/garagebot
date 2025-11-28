import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { 
  Package, Truck, CheckCircle, Clock, MapPin, 
  ChevronDown, ChevronUp, ExternalLink, RefreshCw,
  AlertTriangle, Phone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";

interface OrderItem {
  id: string;
  name: string;
  partNumber: string;
  quantity: number;
  price: number;
  imageUrl?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  status: 'processing' | 'shipped' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'issue';
  vendorName: string;
  vendorLogo?: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  trackingNumber?: string;
  trackingUrl?: string;
  estimatedDelivery?: string;
  deliveredAt?: string;
  shippedAt?: string;
  orderedAt: string;
  shippingAddress: {
    line1: string;
    city: string;
    state: string;
    zip: string;
  };
  trackingHistory?: {
    status: string;
    location: string;
    timestamp: string;
  }[];
}

const mockOrders: Order[] = [
  {
    id: "ord-1",
    orderNumber: "GB-2024-8472",
    status: "in_transit",
    vendorName: "AutoZone",
    items: [
      { id: "1", name: "Brake Pads - Front", partNumber: "DPX-2847", quantity: 1, price: 49.99 },
      { id: "2", name: "Brake Rotor", partNumber: "RT-4821", quantity: 2, price: 79.99 },
    ],
    subtotal: 209.97,
    shipping: 0,
    total: 209.97,
    trackingNumber: "1Z999AA10123456784",
    trackingUrl: "https://ups.com/track",
    estimatedDelivery: "Nov 30, 2024",
    shippedAt: "Nov 26, 2024",
    orderedAt: "Nov 25, 2024",
    shippingAddress: {
      line1: "123 Garage Lane",
      city: "Austin",
      state: "TX",
      zip: "78701",
    },
    trackingHistory: [
      { status: "In Transit", location: "Dallas, TX", timestamp: "Nov 28, 10:32 AM" },
      { status: "Departed Facility", location: "Houston, TX", timestamp: "Nov 27, 8:15 PM" },
      { status: "Picked Up", location: "Houston, TX", timestamp: "Nov 26, 4:20 PM" },
      { status: "Label Created", location: "Houston, TX", timestamp: "Nov 26, 2:00 PM" },
    ],
  },
  {
    id: "ord-2",
    orderNumber: "GB-2024-7391",
    status: "delivered",
    vendorName: "RockAuto",
    items: [
      { id: "3", name: "Oil Filter", partNumber: "FL-400S", quantity: 3, price: 8.99 },
    ],
    subtotal: 26.97,
    shipping: 7.99,
    total: 34.96,
    trackingNumber: "FEDEX-123456",
    deliveredAt: "Nov 24, 2024",
    shippedAt: "Nov 21, 2024",
    orderedAt: "Nov 20, 2024",
    shippingAddress: {
      line1: "123 Garage Lane",
      city: "Austin",
      state: "TX",
      zip: "78701",
    },
  },
];

export default function OrderTracking() {
  const { user } = useAuth();
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const { data: orders = [], isLoading, refetch } = useQuery<Order[]>({
    queryKey: ['orders', user?.id],
    queryFn: async () => {
      // Fetch orders - works for both authenticated and guest sessions
      const res = await fetch('/api/orders');
      if (!res.ok) {
        // Return mock data for demo purposes when no real orders exist
        return mockOrders;
      }
      const data = await res.json();
      return data.length > 0 ? data : mockOrders;
    },
  });

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'processing': return <Clock className="w-4 h-4" />;
      case 'shipped': return <Package className="w-4 h-4" />;
      case 'in_transit': return <Truck className="w-4 h-4" />;
      case 'out_for_delivery': return <MapPin className="w-4 h-4" />;
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      case 'issue': return <AlertTriangle className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'processing': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'shipped': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'in_transit': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'out_for_delivery': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'delivered': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'issue': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusLabel = (status: Order['status']) => {
    switch (status) {
      case 'processing': return 'Processing';
      case 'shipped': return 'Shipped';
      case 'in_transit': return 'In Transit';
      case 'out_for_delivery': return 'Out for Delivery';
      case 'delivered': return 'Delivered';
      case 'issue': return 'Issue';
      default: return status;
    }
  };

  const activeOrders = orders.filter(o => o.status !== 'delivered');
  const completedOrders = orders.filter(o => o.status === 'delivered');

  return (
    <Card className="bg-card border-primary/30 overflow-hidden">
      <div className="p-4 border-b border-border/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
              <Truck className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="font-tech text-lg uppercase text-primary">Order Tracking</h3>
              <p className="text-xs text-muted-foreground">Track your parts shipments</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => refetch()}
            data-testid="button-refresh-orders"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Active Orders */}
        {activeOrders.length > 0 && (
          <div>
            <h4 className="text-xs font-tech uppercase text-muted-foreground mb-3">
              Active Orders ({activeOrders.length})
            </h4>
            <div className="space-y-3">
              {activeOrders.map((order) => (
                <OrderCard 
                  key={order.id} 
                  order={order}
                  isExpanded={expandedOrder === order.id}
                  onToggle={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                  getStatusIcon={getStatusIcon}
                  getStatusColor={getStatusColor}
                  getStatusLabel={getStatusLabel}
                />
              ))}
            </div>
          </div>
        )}

        {/* Completed Orders */}
        {completedOrders.length > 0 && (
          <div>
            <h4 className="text-xs font-tech uppercase text-muted-foreground mb-3">
              Completed Orders ({completedOrders.length})
            </h4>
            <div className="space-y-3">
              {completedOrders.map((order) => (
                <OrderCard 
                  key={order.id} 
                  order={order}
                  isExpanded={expandedOrder === order.id}
                  onToggle={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                  getStatusIcon={getStatusIcon}
                  getStatusColor={getStatusColor}
                  getStatusLabel={getStatusLabel}
                />
              ))}
            </div>
          </div>
        )}

        {orders.length === 0 && (
          <div className="text-center py-8">
            <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No orders yet</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Your order history will appear here</p>
          </div>
        )}
      </div>
    </Card>
  );
}

function OrderCard({ 
  order, 
  isExpanded, 
  onToggle,
  getStatusIcon,
  getStatusColor,
  getStatusLabel,
}: { 
  order: Order; 
  isExpanded: boolean; 
  onToggle: () => void;
  getStatusIcon: (status: Order['status']) => React.ReactNode;
  getStatusColor: (status: Order['status']) => string;
  getStatusLabel: (status: Order['status']) => string;
}) {
  return (
    <motion.div
      layout
      className="border border-border/40 rounded-lg overflow-hidden bg-muted/10"
    >
      <button
        onClick={onToggle}
        className="w-full p-3 flex items-center justify-between hover:bg-muted/20 transition-colors"
        data-testid={`order-card-${order.id}`}
      >
        <div className="flex items-center gap-3">
          <Badge className={`${getStatusColor(order.status)} flex items-center gap-1`}>
            {getStatusIcon(order.status)}
            <span className="text-xs">{getStatusLabel(order.status)}</span>
          </Badge>
          <div className="text-left">
            <p className="text-sm font-medium">{order.orderNumber}</p>
            <p className="text-xs text-muted-foreground">{order.vendorName} • {order.items.length} item(s)</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-tech">${order.total.toFixed(2)}</span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-3 pt-0 space-y-4">
              {/* Order Items */}
              <div className="bg-black/20 rounded-lg p-3">
                <h5 className="text-xs font-tech uppercase text-muted-foreground mb-2">Items</h5>
                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-sm">
                      <div>
                        <span>{item.name}</span>
                        <span className="text-muted-foreground text-xs ml-2">x{item.quantity}</span>
                      </div>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="border-t border-border/40 pt-2 mt-2 flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>{order.shipping === 0 ? 'FREE' : `$${order.shipping.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>${order.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Tracking Info */}
              {order.trackingNumber && (
                <div className="bg-black/20 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-xs font-tech uppercase text-muted-foreground">Tracking</h5>
                    {order.trackingUrl && (
                      <a 
                        href={order.trackingUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-primary flex items-center gap-1 hover:underline"
                      >
                        Track <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  <code className="text-xs bg-black/30 px-2 py-1 rounded font-mono block">
                    {order.trackingNumber}
                  </code>
                  
                  {order.estimatedDelivery && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Estimated delivery: <span className="text-foreground">{order.estimatedDelivery}</span>
                    </p>
                  )}
                </div>
              )}

              {/* Tracking History */}
              {order.trackingHistory && order.trackingHistory.length > 0 && (
                <div className="bg-black/20 rounded-lg p-3">
                  <h5 className="text-xs font-tech uppercase text-muted-foreground mb-3">History</h5>
                  <div className="space-y-3">
                    {order.trackingHistory.map((event, i) => (
                      <div key={i} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-primary' : 'bg-muted'}`} />
                          {i < order.trackingHistory!.length - 1 && (
                            <div className="w-px h-full bg-border/40 min-h-[20px]" />
                          )}
                        </div>
                        <div className="flex-1 pb-2">
                          <p className="text-sm font-medium">{event.status}</p>
                          <p className="text-xs text-muted-foreground">{event.location}</p>
                          <p className="text-xs text-muted-foreground/60">{event.timestamp}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Shipping Address */}
              <div className="bg-black/20 rounded-lg p-3">
                <h5 className="text-xs font-tech uppercase text-muted-foreground mb-2">Ship To</h5>
                <p className="text-sm">{order.shippingAddress.line1}</p>
                <p className="text-sm text-muted-foreground">
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {order.status === 'issue' && (
                  <Button size="sm" variant="outline" className="flex-1 gap-1">
                    <Phone className="w-3 h-3" /> Contact Support
                  </Button>
                )}
                {order.status === 'delivered' && (
                  <Button size="sm" variant="outline" className="flex-1">
                    Leave Review
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
