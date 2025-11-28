interface VinDecodeResult {
  vin: string;
  year: string;
  make: string;
  model: string;
  trim?: string;
  bodyClass?: string;
  doors?: string;
  driveType?: string;
  engineCylinders?: string;
  engineDisplacement?: string;
  engineHP?: string;
  fuelType?: string;
  transmission?: string;
  transmissionSpeeds?: string;
  vehicleType?: string;
  plantCity?: string;
  plantCountry?: string;
  manufacturerName?: string;
  errorCode?: string;
  errorText?: string;
  additionalInfo?: Record<string, string>;
}

interface RecallResult {
  campaignNumber: string;
  nhtsaCampaignNumber: string;
  component: string;
  summary: string;
  consequence: string;
  remedy: string;
  manufacturer: string;
  modelYear: string;
  make: string;
  model: string;
  reportReceivedDate: string;
  notes?: string;
}

interface SafetyRatingResult {
  overallRating: string;
  frontCrashRating?: string;
  sideCrashRating?: string;
  rolloverRating?: string;
  vehicleId?: string;
}

export class NHTSAService {
  private baseUrl = 'https://vpic.nhtsa.dot.gov/api/vehicles';
  private recallBaseUrl = 'https://api.nhtsa.gov/recalls/recallsByVehicle';
  private safetyRatingBaseUrl = 'https://api.nhtsa.gov/SafetyRatings';

  async decodeVin(vin: string): Promise<VinDecodeResult> {
    if (!vin || vin.length !== 17) {
      return {
        vin,
        year: '',
        make: '',
        model: '',
        errorCode: 'INVALID_VIN',
        errorText: 'VIN must be exactly 17 characters'
      };
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/DecodeVinValuesExtended/${vin}?format=json`
      );
      
      if (!response.ok) {
        throw new Error(`NHTSA API error: ${response.status}`);
      }

      const data = await response.json();
      const result = data.Results?.[0];

      if (!result) {
        return {
          vin,
          year: '',
          make: '',
          model: '',
          errorCode: 'NO_DATA',
          errorText: 'No data returned from NHTSA'
        };
      }

      const errorCode = result.ErrorCode || '';
      const hasErrors = errorCode && !['0', ''].includes(errorCode);

      const getValue = (key: string): string => {
        const val = result[key];
        return val && val !== 'Not Applicable' ? val : '';
      };

      return {
        vin: vin.toUpperCase(),
        year: getValue('ModelYear'),
        make: getValue('Make'),
        model: getValue('Model'),
        trim: getValue('Trim'),
        bodyClass: getValue('BodyClass'),
        doors: getValue('Doors'),
        driveType: getValue('DriveType'),
        engineCylinders: getValue('EngineCylinders'),
        engineDisplacement: getValue('DisplacementL'),
        engineHP: getValue('EngineHP'),
        fuelType: getValue('FuelTypePrimary'),
        transmission: getValue('TransmissionStyle'),
        transmissionSpeeds: getValue('TransmissionSpeeds'),
        vehicleType: getValue('VehicleType'),
        plantCity: getValue('PlantCity'),
        plantCountry: getValue('PlantCountry'),
        manufacturerName: getValue('Manufacturer'),
        errorCode: hasErrors ? errorCode : undefined,
        errorText: hasErrors ? result.ErrorText : undefined,
        additionalInfo: {
          series: getValue('Series'),
          gvwr: getValue('GVWR'),
          ncsa: getValue('NCSAModel'),
          abs: getValue('ABS'),
          plantState: getValue('PlantState'),
        }
      };
    } catch (error) {
      console.error('VIN decode error:', error);
      return {
        vin,
        year: '',
        make: '',
        model: '',
        errorCode: 'API_ERROR',
        errorText: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async getRecalls(year: string, make: string, model: string): Promise<RecallResult[]> {
    try {
      const params = new URLSearchParams({
        make: make,
        model: model,
        modelYear: year
      });

      const response = await fetch(`${this.recallBaseUrl}?${params}`);
      
      if (!response.ok) {
        console.error('Recalls API error:', response.status);
        return [];
      }

      const data = await response.json();
      
      if (!data.results || data.results.length === 0) {
        return [];
      }

      return data.results.map((r: any) => ({
        campaignNumber: r.NHTSACampaignNumber || '',
        nhtsaCampaignNumber: r.NHTSACampaignNumber || '',
        component: r.Component || '',
        summary: r.Summary || '',
        consequence: r.Consequence || '',
        remedy: r.Remedy || '',
        manufacturer: r.Manufacturer || '',
        modelYear: r.ModelYear || year,
        make: r.Make || make,
        model: r.Model || model,
        reportReceivedDate: r.ReportReceivedDate || '',
        notes: r.Notes || ''
      }));
    } catch (error) {
      console.error('Recalls API error:', error);
      return [];
    }
  }

  async getRecallsByVin(vin: string): Promise<RecallResult[]> {
    const decoded = await this.decodeVin(vin);
    
    if (!decoded.year || !decoded.make || !decoded.model) {
      return [];
    }

    return this.getRecalls(decoded.year, decoded.make, decoded.model);
  }

  async getSafetyRating(year: string, make: string, model: string): Promise<SafetyRatingResult | null> {
    try {
      const modelYearResponse = await fetch(
        `${this.safetyRatingBaseUrl}/modelyear/${year}/make/${make}/model/${model}?format=json`
      );

      if (!modelYearResponse.ok) {
        return null;
      }

      const data = await modelYearResponse.json();
      
      if (!data.Results || data.Results.length === 0) {
        return null;
      }

      const vehicleId = data.Results[0].VehicleId;
      
      const vehicleResponse = await fetch(
        `${this.safetyRatingBaseUrl}/VehicleId/${vehicleId}?format=json`
      );

      if (!vehicleResponse.ok) {
        return null;
      }

      const vehicleData = await vehicleResponse.json();
      const vehicle = vehicleData.Results?.[0];

      if (!vehicle) {
        return null;
      }

      return {
        overallRating: vehicle.OverallRating || 'Not Rated',
        frontCrashRating: vehicle.OverallFrontCrashRating || 'Not Rated',
        sideCrashRating: vehicle.OverallSideCrashRating || 'Not Rated',
        rolloverRating: vehicle.RolloverRating || 'Not Rated',
        vehicleId: vehicleId.toString()
      };
    } catch (error) {
      console.error('Safety rating error:', error);
      return null;
    }
  }

  async getComplaints(year: string, make: string, model: string): Promise<any[]> {
    try {
      const response = await fetch(
        `https://api.nhtsa.gov/complaints/complaintsByVehicle?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&modelYear=${year}`
      );

      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('Complaints API error:', error);
      return [];
    }
  }

  async getMakes(): Promise<{ makeId: number; makeName: string }[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/GetMakesForVehicleType/car?format=json`
      );

      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      return (data.Results || []).map((r: any) => ({
        makeId: r.MakeId,
        makeName: r.MakeName
      }));
    } catch (error) {
      console.error('Get makes error:', error);
      return [];
    }
  }

  async getModels(make: string, year?: string): Promise<{ modelId: number; modelName: string }[]> {
    try {
      let url = `${this.baseUrl}/GetModelsForMake/${encodeURIComponent(make)}?format=json`;
      
      if (year) {
        url = `${this.baseUrl}/GetModelsForMakeYear/make/${encodeURIComponent(make)}/modelyear/${year}?format=json`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      return (data.Results || []).map((r: any) => ({
        modelId: r.Model_ID,
        modelName: r.Model_Name
      }));
    } catch (error) {
      console.error('Get models error:', error);
      return [];
    }
  }
}

export const nhtsaService = new NHTSAService();
