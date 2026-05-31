import { useState, useEffect } from "react";
import axios from "axios";

const BDLocationDropdown = () => {
  const [divisions, setDivisions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [upazilas, setUpazilas] = useState([]);
  const [selectedDivision, setSelectedDivision] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedUpazila, setSelectedUpazila] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get("https://bdapis.com/api/v1.2/divisions")
      .then((res) => setDivisions(res.data.data))
      .catch((err) => setError(err));
  }, []);

  const handleDivisionChange = async (e) => {
    const divisionName = e.target.value;
    setSelectedDivision(divisionName);
    setSelectedDistrict("");
    setSelectedUpazila("");
    setUpazilas([]);
    try {
      const res = await axios.get(
        `https://bdapis.com/api/v1.2/division/${divisionName}`
      );
      setDistricts(res.data.data);
      
    } catch {
      setError("Failed to fetch districts");
    }
  };

  const handleDistrictChange = async (e) => {
    const districtName = e.target.value;
    setSelectedDistrict(districtName);
    setSelectedUpazila("");
    try {
      const res = await axios.get(
        `https://bdapis.com/api/v1.2/district/${districtName}`
      );
      
      setUpazilas(res.data.data[0]?.upazilla || []);
    } catch {
      setError("Failed to fetch upazilas");
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md space-y-4">
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <div>
        <label className="block text-sm font-medium">Select Division</label>
        <select
          className="w-full p-2 border rounded"
          onChange={handleDivisionChange}
          value={selectedDivision}
        >
          <option value="">-- Select --</option>
          {divisions.map((div) => (
            <option key={div.division} value={div.division}>
              {div.division}
            </option>
          ))}
        </select>
      </div>
      {selectedDivision && (
        <div>
          <label className="block text-sm font-medium">Select District</label>
          <select
            className="w-full p-2 border rounded"
            onChange={handleDistrictChange}
            value={selectedDistrict}
          >
            <option value="">-- Select --</option>
            {districts.map((dist) => (
              <option key={dist.district} value={dist.district}>
                {dist.district}
              </option>
            ))}
          </select>
        </div>
      )}
      {selectedDistrict && upazilas.length > 0 && (
        <div>
          <label className="block text-sm font-medium">Select Upazila</label>
          <select
            className="w-full p-2 border rounded"
            onChange={(e) => setSelectedUpazila(e.target.value)}
            value={selectedUpazila}
          >
            <option value="">-- Select --</option>
            {upazilas.map((upa, index) => (
              <option key={index} value={upa}>
                {upa}
              </option>
            ))}
          </select>
        </div>
      )}
      {selectedUpazila && (
        <div>
          <label className="block text-sm font-medium">Address</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            placeholder="Enter your address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>
      )}
    </div>
  );
};

export default BDLocationDropdown;
