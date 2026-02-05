// PartsTech Integration Service
// Requires: PARTSTECH_API_KEY secret
// Provides real-time parts ordering from 20,000+ retailers

interface PartsTechSearchResult {
  partNumber: string;
  brand: string;
  description: string;
  price: number;
  availability: 'in_stock' | 'limited' | 'out_of_stock';
  deliveryEstimate: string;
  supplierName: string;
  supplierId: string;
  imageUrl?: string;
}

interface PartsTechVehicle {
  year: number;
  make: string;
  model: string;
  engine?: string;
  vin?: string;
}

class PartsTechService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.PARTSTECH_API_KEY || '';
    this.baseUrl = 'https://api.partstech.com/v1';
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }

  private async makeRequest(endpoint: string, method: string = 'GET', body?: any): Promise<any> {
    if (!this.isConfigured()) {
      throw new Error('PartsTech not configured. Add PARTSTECH_API_KEY.');
    }

    const url = `${this.baseUrl}${endpoint}`;
    
    const options: RequestInit = {
      method,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      const error = await response.text();
      console.error(`[PartsTech] API call failed: ${endpoint}`, error);
      throw new Error(`PartsTech API error: ${response.status}`);
    }

    return response.json();
  }

  async searchParts(query: string, vehicle?: PartsTechVehicle): Promise<PartsTechSearchResult[]> {
    const params: any = { query };
    
    if (vehicle) {
      params.year = vehicle.year;
      params.make = vehicle.make;
      params.model = vehicle.model;
      if (vehicle.engine) params.engine = vehicle.engine;
      if (vehicle.vin) params.vin = vehicle.vin;
    }

    try {
      const result = await this.makeRequest('/parts/search', 'POST', params);
      
      return (result.parts || []).map((part: any) => ({
        partNumber: part.part_number,
        brand: part.brand,
        description: part.description,
        price: part.price,
        availability: this.mapAvailability(part.availability),
        deliveryEstimate: part.delivery_estimate || 'Same day',
        supplierName: part.supplier_name,
        supplierId: part.supplier_id,
        imageUrl: part.image_url
      }));
    } catch (error) {
      console.error('[PartsTech] Search failed:', error);
      return [];
    }
  }

  async getPartDetails(partNumber: string, supplierId: string): Promise<PartsTechSearchResult | null> {
    try {
      const result = await this.makeRequest(`/parts/${partNumber}?supplier=${supplierId}`);
      
      if (result.part) {
        return {
          partNumber: result.part.part_number,
          brand: result.part.brand,
          description: result.part.description,
          price: result.part.price,
          availability: this.mapAvailability(result.part.availability),
          deliveryEstimate: result.part.delivery_estimate || 'Same day',
          supplierName: result.part.supplier_name,
          supplierId: result.part.supplier_id,
          imageUrl: result.part.image_url
        };
      }
      return null;
    } catch (error) {
      console.error('[PartsTech] Get part details failed:', error);
      return null;
    }
  }

  async checkInventory(partNumber: string): Promise<Array<{
    supplierId: string;
    supplierName: string;
    quantity: number;
    price: number;
    deliveryEstimate: string;
  }>> {
    try {
      const result = await this.makeRequest(`/inventory/${partNumber}`);
      
      return (result.inventory || []).map((inv: any) => ({
        supplierId: inv.supplier_id,
        supplierName: inv.supplier_name,
        quantity: inv.quantity,
        price: inv.price,
        deliveryEstimate: inv.delivery_estimate || 'Same day'
      }));
    } catch (error) {
      console.error('[PartsTech] Inventory check failed:', error);
      return [];
    }
  }

  async createOrder(items: Array<{
    partNumber: string;
    supplierId: string;
    quantity: number;
  }>, deliveryAddress: {
    name: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    zip: string;
    phone: string;
  }): Promise<{ orderId: string; status: string; estimatedDelivery: string }> {
    try {
      const result = await this.makeRequest('/orders', 'POST', {
        items,
        delivery_address: {
          name: deliveryAddress.name,
          address_1: deliveryAddress.address1,
          address_2: deliveryAddress.address2,
          city: deliveryAddress.city,
          state: deliveryAddress.state,
          postal_code: deliveryAddress.zip,
          phone: deliveryAddress.phone
        }
      });

      return {
        orderId: result.order_id,
        status: result.status,
        estimatedDelivery: result.estimated_delivery
      };
    } catch (error) {
      console.error('[PartsTech] Order creation failed:', error);
      throw error;
    }
  }

  async decodeVin(vin: string): Promise<PartsTechVehicle | null> {
    try {
      const result = await this.makeRequest(`/vehicles/vin/${vin}`);
      
      if (result.vehicle) {
        return {
          year: result.vehicle.year,
          make: result.vehicle.make,
          model: result.vehicle.model,
          engine: result.vehicle.engine,
          vin: vin
        };
      }
      return null;
    } catch (error) {
      console.error('[PartsTech] VIN decode failed:', error);
      return null;
    }
  }

  private mapAvailability(status: string): 'in_stock' | 'limited' | 'out_of_stock' {
    const statusLower = (status || '').toLowerCase();
    if (statusLower.includes('in stock') || statusLower.includes('available')) {
      return 'in_stock';
    }
    if (statusLower.includes('limited') || statusLower.includes('low')) {
      return 'limited';
    }
    return 'out_of_stock';
  }
}

export const partsTechService = new PartsTechService();
export default partsTechService;
