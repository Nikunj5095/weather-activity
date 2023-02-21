export const config: any = {
  series: [],
  options: {
    chart: {
      height: 350,
      type: 'area',
      zoom: {
        enabled: false
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'straight'
    },
    title: {
      text: 'Product Trends by Month',
      align: 'left'
    },
    labels: [],
    xaxis: {
      type: 'datetime',
    },
    legend: {
      horizontalAlign: 'left'
    }

  },
};


export interface HourlyUnits {
  time: string;
  temperature_2m: string;
}

export interface Hourly {
  time?: string[];
  temperature_2m?: number[];
  relativehumidity_2m?: number[]
}

export interface WeatherDetail {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  hourly_units: HourlyUnits;
  hourly: Hourly;
}