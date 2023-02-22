import React, { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import Chart from "react-apexcharts";
import { DateRangePicker } from 'rsuite';
import { CitiesModel, CoordinatesDetail } from '../models/CoordinatesModel';
import axios from 'axios';
import SearchableDropdown from './searchable-dropdown/SearchableDropdown';
import { config, WeatherDetail } from '../models/GraphConfigModel';
import Loader from './loader/Loader';
import { useLocation } from 'react-router-dom';
const { allowedMaxDays } = DateRangePicker;

export default function Home() {
  const [coordinates, setCoordinates] = useState([new CoordinatesDetail()]);
  const [cities, setCities] = useState<Array<CitiesModel>>([]);
  const [isShowLoder, setIsShowLoder] = useState<boolean>(false);
  const [chartConfig, setChartConfig] = useState<Array<typeof config>>([]);
  const [width, setWidth] = useState<number>(window.innerWidth);
  const location = useLocation();

  useEffect(() => {
    const data = location.state?.data;
    if (data) {
      const t = [JSON.parse(JSON.stringify(data))];
      if (t.length > 0 && t[0].dateRange) {
        t[0].dateRange = [new Date(data.dateRange[0]), new Date(data.dateRange[1])]
      }
      getCities(data.cityName);
      setCoordinates(t);
      getWeatherDetail(t);
    }
    window.history.replaceState({}, document.title);
    window.addEventListener('resize', handleWindowSizeChange);
    return () => {
      window.addEventListener('resize', handleWindowSizeChange);
    }
  }, []);

  const handleWindowSizeChange = () => {
    setWidth(window.innerWidth);
  }

  const notify = (str: string) => toast(str);

  const coordinateChanage = (obj: CoordinatesDetail, key: string, val: any) => {
    if (obj[key] !== val) {
      obj[key] = val;
      setCoordinates([...coordinates]);
      setTimeout(() => {
        getWeatherDetail();
      }, 200);
    }
  }

  const setLatLongCityWise = (cityId: number, obj: CoordinatesDetail) => {
    if (cityId) {
      const selectedCity = cities.find(x => Number(x.id) === Number(cityId));
      obj.latitude = selectedCity?.latitude;
      obj.longitude = selectedCity?.longitude;
      obj.cityName = selectedCity?.name;
      setCoordinates([...coordinates]);
    }
  }

  const addCoordinate = () => {
    const index = coordinates.findIndex(x => (!x.city && (!x.latitude || !x.longitude)) || !x.dateRange || (!x.temperature && !x.relativeHumidity));
    if (index === -1) {
      setCoordinates([...coordinates, new CoordinatesDetail()])
    } else {
      notify('Please fill all previous coordinates');
    }
  }

  const getCities = (searchText: string) => {
    if (searchText?.length >= 3) {
      axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${searchText}`)
        .then(x => {
          const tmpCity: any[] = [];
          coordinates.forEach(x => {
            if (x.city && x.cityName) {
              tmpCity.push({ id: x.city, name: x.cityName, latitude: x.latitude, longitude: x.longitude });
            }
          })
          setCities([...tmpCity, ...(x.data?.results || [])])
        })
        .catch(x => notify('Error in get cities'));
    }
  }

  const formateDate = (date: Date) => {
    //yyyy-mm-dd
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  }

  const getWeatherDetail = (coordinateDetails?: CoordinatesDetail[]) => {
    const tmpCoordinate = coordinateDetails || coordinates
    const index = tmpCoordinate.findIndex(x => (!x.city && (!x.latitude || !x.longitude)) || !x.dateRange || (!x.temperature && !x.relativeHumidity));
    if (index !== -1) {
      return;// notify('Please fill all coordinates');
    }
    const tmpChartConfig: (typeof config)[] = [];
    for (let i = 0; i < tmpCoordinate.length; i++) {
      const element = tmpCoordinate[i];
      const hourlyOpetion = [];
      if (element.temperature) {
        hourlyOpetion.push('temperature_2m');
      }
      if (element.relativeHumidity) {
        hourlyOpetion.push('relativehumidity_2m');
      }
      if (element?.latitude && element?.latitude) {
        setIsShowLoder(true);
        tmpChartConfig.push(JSON.parse(JSON.stringify(config)));
        const dateFilterString = element.dateRange && element.dateRange.length > 1 ? `&start_date=${formateDate(element.dateRange[0])}&end_date=${formateDate(element.dateRange[1])}` : ``;
        axios.get<WeatherDetail>(
          `https://api.open-meteo.com/v1/forecast?latitude=${String(element.latitude).trim()}`
          + `&longitude=${String(element.longitude).trim()}&hourly=${hourlyOpetion.join(',').trim()}${dateFilterString}`)
          .then(x => {
            if (x.data.hourly) {
              if (x.data.hourly.time) {
                tmpChartConfig[i].options.labels.push(...x.data.hourly.time.map(x => new Date(x).getTime()))
              }
              if (x.data.hourly.temperature_2m) {
                tmpChartConfig[i].series.push({
                  name: 'Temperature',
                  data: x.data.hourly.temperature_2m.map(x => Number(x))
                });
              }

              if (x.data.hourly.relativehumidity_2m) {
                tmpChartConfig[i].series.push({
                  name: 'Relative Humidity',
                  data: x.data.hourly.relativehumidity_2m.map(x => Number(x))
                });
              }
              const city = cities.find(x => Number(x.id) === Number(element.city));
              tmpChartConfig[i].options.title.text = `${element.city ? (city?.name || '') : ''}(Lat: ${x.data.latitude} - Long: ${x.data.longitude})`
            }
            setChartConfig([...tmpChartConfig]);

            if ((tmpCoordinate.length - 1) === i) {
              setIsShowLoder(false);
            }
          })
          .catch(x => {
            console.log(x)
            notify('Error in get coordinates')
            if ((tmpCoordinate.length - 1) === i) {
              setIsShowLoder(false);
            }
          });
      } else {
        return notify('Latitude or longitude is missing.');
      }
    }
  }

  const saveCoordinateData = () => {
    const index = coordinates.findIndex(x => (!x.city && (!x.latitude || !x.longitude)) || !x.dateRange || (!x.temperature && !x.relativeHumidity));
    if (index !== -1) {
      return notify('Please fill all coordinates');
    }

    coordinates.forEach(x => {
      const hourlyOpetion: any[] = [];
      if (x.temperature) {
        hourlyOpetion.push('temperature_2m');
      }
      if (x.relativeHumidity) {
        hourlyOpetion.push('relativehumidity_2m');
      }
      x.includedData = hourlyOpetion.join(',');
      x.creatationDate = new Date();
    });

    const savedCoordinateDetailJson = localStorage.getItem('savedCoordinateDetail');
    const savedCoordinateDetail: CoordinatesDetail[] = JSON.parse(savedCoordinateDetailJson || '[]');
    savedCoordinateDetail.push(...coordinates);
    localStorage.setItem('savedCoordinateDetail', JSON.stringify(savedCoordinateDetail));
    notify('Data saved successfully')
  }

  return (
    <div>
      <div className="container">
        <ToastContainer />
        <Loader isShow={isShowLoder} />
        {coordinates.map((x, i) =>
          <div className="row m-0 pt-1" key={i}>
            <div className="col-12"><strong>Coordinate - {i + 1}</strong></div>
            <div className="col-md-2 col-sm-6 col-12">
              <form>
                <div className="mb-3">
                  <label htmlFor="latitude" className="form-label">Latitude</label>
                  <input type="number" className="form-control" placeholder='Enter value' id="latitude" value={x.latitude}
                    onChange={(e) => coordinateChanage(x, 'latitude', e.target.value)} aria-describedby="emailHelp" />
                  <div id="emailHelp" className="form-text"></div>
                </div>
              </form>
            </div>
            <div className="col-md-2 col-sm-6 col-12">
              <form>
                <div className="mb-3">
                  <label htmlFor="longitude" className="form-label">Longitude</label>
                  <input type="number" className="form-control" placeholder='Enter value' id="longitude" value={x.longitude}
                    onChange={(e) => coordinateChanage(x, 'longitude', e.target.value)} aria-describedby="emailHelp" />
                  <div id="emailHelp" className="form-text"></div>
                </div>
              </form>
            </div>

            <div className="col-md-3 col-sm-6 col-12">
              <label htmlFor="searchable-dd" className="form-label">City</label>
              <SearchableDropdown
                options={cities}
                label="name"
                id={'searchable-dd-' + i + '-'}
                uniqueIdKey="id"
                selectedVal={x.city}
                handleChange={(val: number) => { coordinateChanage(x, 'city', val); setLatLongCityWise(val, x); }}
                handleQueryChange={(val: string) => getCities(val)}
              />
            </div>
            <div className="col-md-5 col-sm-6 col-12">
              <label htmlFor="dateRange" className="form-label">Date Range</label><br />
              <DateRangePicker id="dateRange" showOneCalendar={true} disabledDate={allowedMaxDays ? allowedMaxDays(7) : undefined} value={x.dateRange}
                onChange={(e) => coordinateChanage(x, 'dateRange', e)} />
            </div>
            <div className="col-12">
              <label><strong>Hourly Options:</strong></label><br />
              <input type="checkbox" className="form-check-input mx-1" id={"temp-check-" + i}
                checked={x.temperature} onChange={(e) => coordinateChanage(x, 'temperature', e.target.checked)} />
              <label className="form-check-label me-2" htmlFor={"temp-check-" + i}>Temperature</label>

              <input type="checkbox" className="form-check-input mx-1" id={"relative-check" + i}
                checked={x.relativeHumidity} onChange={(e) => coordinateChanage(x, 'relativeHumidity', e.target.checked)} />
              <label className="form-check-label me-2" htmlFor={"relative-check" + i}>Relative Humidity</label>
            </div>
          </div>
        )}

        <div className="row m-0">
          <div className="col-6 col-md-10">
          </div>
          <div className="col-3 col-md-1">
            <button className="btn btn-primary" type="button" onClick={() => addCoordinate()}>Add</button>
          </div>
          <div className="col-3 col-md-1">
            <button className="btn btn-primary" type="submit" onClick={() => saveCoordinateData()}>Save</button>
          </div>
          {chartConfig.map((x, i) =>
            <div className="col-md-6 col-12 mt-2" key={'map-' + i}>
              <Chart
                options={x.options}
                series={x.series}
                type={x.options.chart.type}
                // width="500"
              />
            </div>
          )}
        </div>
      </div>
    </div >
  )
}
