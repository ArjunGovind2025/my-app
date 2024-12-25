import React, { useState } from "react";
import { Button } from "../ui/button"; // Import existing Button component

const UploadOfferLetter = () => {
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({
    sai: "",
    gpa: "",
    testScore: "",
    state: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpload = () => {
    if (!file || !formData.sai || !formData.gpa || !formData.testScore || !formData.state) {
      alert("Please fill in all fields and upload a file.");
      return;
    }
    // Mock upload logic
    alert("Form submitted successfully!");
    console.log("Form Data:", formData);
    console.log("Uploaded File:", file.name);

    // Reset form
    setFile(null);
    setFormData({
      sai: "",
      gpa: "",
      testScore: "",
      state: "",
    });
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold text-center mb-6">Upload Offer Letter</h2>

      {/* File Upload */}
      <div className="mb-4">
        <label htmlFor="file" className="block text-lg font-medium text-gray-700">
          Offer Letter (PDF):
        </label>
        <input
          id="file"
          type="file"
          className="w-full mt-2 rounded border p-2"
          onChange={(e) => setFile(e.target.files[0])}
        />
      </div>

      {/* SAI */}
      <div className="mb-4">
        <label htmlFor="sai" className="block text-lg font-medium text-gray-700">
          SAI (Student Aid Index):
        </label>
        <input
          id="sai"
          name="sai"
          type="number"
          className="w-full mt-2 rounded border p-2"
          placeholder="Enter your SAI"
          value={formData.sai}
          onChange={handleInputChange}
        />
      </div>

      {/* GPA */}
      <div className="mb-4">
        <label htmlFor="gpa" className="block text-lg font-medium text-gray-700">
          GPA:
        </label>
        <input
          id="gpa"
          name="gpa"
          type="number"
          step="0.01"
          className="w-full mt-2 rounded border p-2"
          placeholder="Enter your GPA"
          value={formData.gpa}
          onChange={handleInputChange}
        />
      </div>

      {/* Test Score */}
      <div className="mb-4">
        <label htmlFor="testScore" className="block text-lg font-medium text-gray-700">
          Test Score:
        </label>
        <input
          id="testScore"
          name="testScore"
          type="number"
          className="w-full mt-2 rounded border p-2"
          placeholder="Enter your test score"
          value={formData.testScore}
          onChange={handleInputChange}
        />
      </div>

      {/* State */}
      <div className="mb-6">
        <label htmlFor="state" className="block text-lg font-medium text-gray-700">
          State:
        </label>
        <select
          id="state"
          name="state"
          className="w-full mt-2 rounded border p-2"
          value={formData.state}
          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
        >
          <option value="" disabled>
            Select your state
          </option>
          <option value="CA">California</option>
          <option value="NY">New York</option>
          <option value="TX">Texas</option>
          <option value="FL">Florida</option>
        </select>
      </div>

      {/* Submit Button */}
      <Button
        onClick={handleUpload}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white text-lg font-medium py-2 px-4 rounded-md"
      >
        Submit and Upload
      </Button>
    </div>
  );
};

export default UploadOfferLetter;
