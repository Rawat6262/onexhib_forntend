import React, { useCallback, useEffect, useState } from 'react';
import frame from '../assets/Frame 72.png';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import VerticalMenu from './Menu';

const Dashboard = () => {
  const [bigdata, setBigdata] = useState([]);
  const [company, setcompany] = useState(987);
  const [exhibition, setexhibition] = useState(989);
  const [product, setproduct] = useState(78787);
  const [url, seturl] = useState('');
  let navigator = useNavigate();

  const org = useCallback(async () => {
    try {
      const result = await axios.get('/api/Dashboard');
      console.log(result.data);
      setBigdata(result.data);
      seturl(result.config.url);
    } catch (e) {
      console.error("Error fetching organisers:", e);
    }
  }, []);

  useEffect(() => {
    org();
  }, [org]);

  return (
    <div className="flex flex-col md:flex-row">
      {/* Sidebar */}
      <VerticalMenu />

      <div className="h-screen w-full flex flex-col">
        {/* Top bar */}
        <div className="h-20 w-full flex justify-end bg-gray-100">
          <div className="h-5 w-5 m-6 mr-6 md:mr-12">
            <img src={frame} alt="Frame" />
          </div>
        </div>

        {/* Dashboard cards */}
        <div className="w-[95%] mx-auto mt-4 flex flex-wrap gap-4 justify-center md:justify-between">
          <div className="w-full sm:w-48 h-22 rounded-2xl flex flex-col justify-center items-center font-medium bg-blue-100">
            <div className="h-6 w-36 text-center flex justify-center items-center">Organiser</div>
            <div className="h-8 w-36 mt-0.5 text-center">{bigdata.length}</div>
          </div>
          <div className="w-full sm:w-48 h-22 rounded-2xl flex flex-col justify-center items-center bg-sky-50 font-medium">
            <div className="h-6 w-36 text-center flex justify-center items-center">Exhibition</div>
            <div className="h-8 w-36 mt-0.5 text-center">{exhibition}</div>
          </div>
          <div className="w-full sm:w-48 h-22 rounded-2xl flex flex-col justify-center items-center bg-blue-100 font-medium">
            <div className="h-6 w-36 text-center flex justify-center items-center">Company</div>
            <div className="h-8 w-36 mt-0.5 text-center">{company}</div>
          </div>
          <div className="w-full sm:w-48 h-22 rounded-2xl flex flex-col justify-center items-center bg-sky-50 font-medium">
            <div className="h-6 w-36 text-center flex justify-center items-center">Product</div>
            <div className="h-8 w-36 mt-0.5 text-center">{product}</div>
          </div>
        </div>

        {/* Main section */}
        <div className="flex-1 w-[95%] mx-auto mt-5">
          <div className="flex flex-col md:flex-row justify-between gap-2 px-2">
            <button className="h-9 w-full md:w-60 border-2 rounded text-blue-400">
              New Organiser →
            </button>
            <input
              type="text"
              placeholder="Search"
              className="h-10 w-full md:w-60 border-2 text-center antialiased border-gray-600 rounded"
            />
          </div>

          <div className="flex-1 w-full overflow-x-auto text-center mt-4">
            <table className="w-full min-w-[600px] border-collapse text-center">
              <thead>
                <tr className="bg-blue-500 text-white">
                  <th className="px-3 py-2 text-left border border-gray-300">#</th>
                  <th className="px-3 py-2 text-left border border-gray-300">Full Name</th>
                  <th className="px-3 py-2 text-left border border-gray-300">E-mail</th>
                  <th className="px-3 py-2 text-left border border-gray-300">Phone-number</th>
                </tr>
              </thead>
              <tbody>
                {bigdata.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-3 py-2 text-center">
                      No data available
                    </td>
                  </tr>
                ) : (
                  bigdata.map((item, index) => (
                    <tr
                      key={item._id || index}
                      className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                    >
                      <td className="px-3 py-2 text-left border border-gray-300">
                        {index + 1}
                      </td>
                      <td className="px-3 py-2 text-left border border-gray-300">
                        {item.fullname}
                      </td>
                      <td className="px-3 py-2 text-left border border-gray-300">
                        {item.email}
                      </td>
                      <td className="px-3 py-2 text-left border border-gray-300">
                        {item.phonenumber}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mb-0.5 h-9 border-2 w-full flex text-center font-bold justify-center m-2"></div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
