import { DateRange } from "rsuite/esm/DateRangePicker";

export class CoordinatesDetail {
    latitude?: number | string;
    longitude?: number | string;
    city?: string | null;
    cityName?: string | null;
    dateRange?: DateRange;
    creatationDate?: Date;
    includedData?: string;
    temperature: boolean = false;
    relativeHumidity: boolean = false;
    checked: boolean = false;
    [string: string]: any;
    constructor(_latitude?: number, _longitude?: number, _city?: string, _dateRange?: DateRange) {
        this.latitude = _latitude || '';
        this.longitude = _longitude || '';
        this.city = _city || null;
        this.dateRange = _dateRange || [new Date(), new Date()];
    }
}

export interface CitiesModel {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    elevation: number;
    feature_code: string;
    country_code: string;
    admin1_id: number;
    admin2_id: number;
    timezone: string;
    population: number;
    postcodes: string[];
    country_id: number;
    country: string;
    admin1: string;
    admin2: string;
    admin3_id?: number;
    admin4_id?: number;
    admin3: string;
    admin4: string;
}