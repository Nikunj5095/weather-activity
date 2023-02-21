import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { CoordinatesDetail } from '../models/CoordinatesModel';
import ContextMenu from './context/ContextMenu';
import useContextMenu from './context/UseContextMenu.hook';

export default function Report() {
  const [coordinateData, setCoordinateData] = useState<CoordinatesDetail[]>([]);
  const { clicked, setClicked, points, setPoints } = useContextMenu();

  useEffect(() => {
    fatchData();
  }, []);

  const notify = (str: string) => toast(str);

  const fatchData = () => {
    const savedCoordinateDetailJson = localStorage.getItem('savedCoordinateDetail');
    const savedCoordinateDetail: CoordinatesDetail[] = JSON.parse(savedCoordinateDetailJson || '[]');
    setCoordinateData(savedCoordinateDetail);
  };

  const formateDate = (date: Date) => {
    //yyyy-mm-dd HH:mm:ss
    return (date ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} `
      + `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}` : ``)
  }

  const deleteCoordinate = (i: number) => {
    coordinateData.splice(i, 1);
    setCoordinateData([...coordinateData]);
    localStorage.setItem('savedCoordinateDetail', JSON.stringify(coordinateData));
  }

  const deleteSelected = () => {
    const tmp = coordinateData.filter(x => !x.checked);
    if (tmp) {
      setCoordinateData(tmp);
      localStorage.setItem('savedCoordinateDetail', JSON.stringify(tmp));
      notify('Data deleted successfully');
    } else {
      notify('Please select atleast one data');
    }
  }

  return (
    <>
      <div className="container">
        <table className="table table-hover mt-5">
          <thead className="table-dark">
            <tr>
              <th scope="col">#</th>
              <th scope="col">Cities</th>
              <th scope="col">Included Data</th>
              <th scope="col">Latitude & Longitude</th>
              <th scope="col">Data Range</th>
              <th scope="col">Creation Data</th>
              <th scope="col">Action</th>
            </tr>
          </thead>
          <tbody>
            {coordinateData && coordinateData.length > 0 ? coordinateData.map((x, i) =>
              <tr key={i} className={x.checked ? 'selected' : ''} onContextMenu={(e) => {
                if (coordinateData.some(x => x.checked)) {
                  e.preventDefault();
                  setClicked(true);
                  setPoints({
                    x: e.nativeEvent.clientX,
                    y: e.nativeEvent.clientY,
                  });
                }
              }}>
                <th scope="row"><input type="checkbox" name="chk" id={"chk-" + i} checked={x.checked} onChange={(e) => { x.checked = e.target.checked; setCoordinateData([...coordinateData]); }} /></th>
                <td>{x.cityName}</td>
                <td>{x.includedData}</td>
                <td>{x.latitude + ', ' + x.longitude}</td>
                <td>{x.dateRange ? (formateDate(new Date(x.dateRange[0])) + ' ~ ' + formateDate(new Date(x.dateRange[1]))) : ''}</td>
                <td>{formateDate(new Date(x.creatationDate || new Date()))}</td>
                <td>
                  <Link to="/" state={{ data: x }}><i className="far fa-eye p-1 poiner"></i></Link>
                  {/* <i className="fas fa-edit p-1 poiner"></i> */}
                  <i className="far fa-trash-alt p-1 poiner" onClick={() => { deleteCoordinate(i) }}></i>
                </td>
              </tr>
            ) :
              <tr>
                <td colSpan={7} className='text-center'>No data available</td>
              </tr>}
          </tbody>
        </table>
      </div>
      {clicked && coordinateData.some(x => x.checked) &&
        <ContextMenu top={points.y} left={points.x}>
          <ul>
            <li className='pt-2' onClick={deleteSelected}>Delete</li>
          </ul>
        </ContextMenu>
      }
    </>

  )
}
