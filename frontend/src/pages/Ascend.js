import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient'; // Ensure Supabase is initialized

export default function FileUpload() {
  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [uploadEnabled, setUploadEnabled] = useState(false);

  const [userEmail, setUserEmail] = useState(""); // Store logged-in user email
  const [promptText, setPromptText] = useState(""); // Store prompt
  const [promptChanges, setPromptChanges] = useState(""); // Store prompt

  const [tagType, setTagType] = useState("");
  const [tagName, setTagName] = useState("");
  const [description, setDescription] = useState("");
  const [langInstructions, setLangInstructions] = useState("");

  const [tagIdentifier, setTagIdentifier] = useState("");

  const [promptHidden, setPromptHidden] = useState(false);

  const [projectName, setProjectName] = useState("");

  const [shownFiles, setShownFiles] = useState([]);
  const [shownPrompts, setShownPrompts] = useState([]);

  const [selectedFile, setSelectedFile] = useState("");
  const [selectedFilePreview, setSelectedFilePreview] = useState(null)
  const [selectedPrompts, setSelectedPrompts] = useState([]);


  // Fetch logged-in user's email
  useEffect(() => {
    const getUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        alert("Failed to fetch user data");
        return;
      }
      if (user) {
        setUserEmail(user.email);
      }
    };

    getUser();
  }, []);

  // Fetch files
  useEffect(() => {
    if (userEmail) {
      fetchFiles();
    }
  }, [userEmail]); 

 // Fetch prompts
 useEffect(() => {
  if (userEmail) {
    fetchPrompts();
  }
}, [userEmail]); 
  // Handle File Selection
  const handleFileChange = (e) => {
    setFile(null);
    setPreviewData(null);
    setUploadEnabled(false);

    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    validateFile(selectedFile);
  };

  // Send File to Backend for Validation
  const validateFile = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("user_email", userEmail);

    try {
      const response = await fetch("http://127.0.0.1:8000/validate-file", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "Invalid file format or structure");
      }

      setPreviewData(data.preview);
      setUploadEnabled(true);
    } catch (error) {
      alert(error.message);
    }
  };

  // Handle Upload
  const handleUpload = async () => {
    if (!file || !userEmail) {
      alert("User is not authenticated or file not selected.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("user_email", userEmail);

    try {
      const response = await fetch("http://127.0.0.1:8000/upload-file", {
        method: "POST",
        body: formData,
        headers: {
          "Accept": "application/json",
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "Upload failed");
      }

      alert("File uploaded successfully!");

      setFile(null)
      setPreviewData(null)
      setUploadEnabled(false)
    } catch (error) {
      alert(error.message);
    }
  };


  const handlePromptCreation = async () => {
    if (!tagType || !tagName || !description) {
      alert("Please input tag type, tag name and description to generate prompt");
      return;
    }

    try {
      // Collect form data in an object
      const payload = {
        tag_type: tagType,
        tag_name: tagName,
        description: description,
        langInstructions: langInstructions,
      };

      // Send POST request to your Python backend
      const response = await fetch("http://127.0.0.1:8000/generate-prompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error("Failed to submit data");
      }

      setPromptText(data.desc);
      setPromptChanges(data.changes)

    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };


  const submitPrompt = async () => {

    if (!tagIdentifier) {
      alert("Please input identifier");
      return;
    }


    if (!tagType || !tagName || !description) {
      alert("Please input tag type, tag name and description to generate prompt");
      return;
    }

    const payload = {
      tag_type: tagType,
      tag_name: tagName,
      description: description,
      langInstructions: langInstructions,
      tag_identifier: tagIdentifier,
      user_email: userEmail
    };

    try {
      const response = await fetch("http://127.0.0.1:8000/upload-prompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "Upload failed");
      }

      alert("Prompt uploaded successfully!");

    } catch (error) {
      alert(error.message);
    }

  }

  const fetchFiles = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/get_files?email=${userEmail}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      setShownFiles(data.files);
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  };
  
  const fetchPrompts = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/get_prompts?email=${userEmail}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      setShownPrompts(data.prompts);
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  };

  const handlePreview = async (file_name) => {

    try {
      setSelectedFile(file_name)
      const response = await fetch(`http://127.0.0.1:8000/get_preview?file_id=${file_name}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      setSelectedFilePreview(data.preview);
    } catch (error) {
      console.error("Error fetching files:", error);
    }

    
  }

  const handlePrompt = async(e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setSelectedPrompts(selectedOptions);
  }


  
  const submitRequest = async() => {
    if(!userEmail || selectedFile == "" || selectedPrompts.length === 0){
      alert("error");
      return;
    }

    try{
      const formData = new FormData();
      formData.append("user_email", userEmail);
      formData.append("file", selectedFile);
      formData.append("prompts", selectedPrompts);

      const response = await fetch("http://127.0.0.1:8000/submit_tag_request", {
        method: "POST",
        body: formData,
        headers:{
          "Accept": "application/json"
        }
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "Request failed");
      }

      alert("Request started successfully!");

      setSelectedFile("");
      setSelectedFilePreview(null);
      setSelectedPrompts([])
      
    } catch (error){
      alert(error.message);
    }
  }


  return (

    <div className="min-h-screen bg-gray-100 p-6 w-full">
      <p className="text-gray-600 mb-4">
        Logged in as: <strong>{userEmail || "Fetching user..."}</strong>
      </p>
      <div className="w-full p-6 bg-white rounded shadow">
        <h1 className="text-2xl font-bold mb-4 text-gray-700">File Upload</h1>

      <div className='flex justify-between items-center'>
        {/* File Input Button */}
        <label
          htmlFor="file-upload"
          className="py-2 bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-600 block w-fit px-8"
        >
          Select File
        </label>

        <button
          type="button"
          onClick={() => {
            setFile(null);
            setPreviewData(null);
            setUploadEnabled(false);
          } }
          className="py-2 bg-gray-500 text-white rounded cursor-pointer hover:bg-gray-600 block w-fit px-8"
        >
          Clear
          </button>
        </div>

        <input
          id="file-upload"
          type="file"
          onChange={handleFileChange}
          accept=".csv,.xls,.xlsx"
          className="hidden"
        />

        {/* Show Selected File Name (Above Preview) */}
        {file && (
          <p className="text-gray-700 font-semibold">Selected File: {file.name}</p>
        )}

        {/* Preview Table */}
        {previewData && (
          <div className="m-6">
            <h2 className="text-lg font-semibold mb-2">Preview ( {previewData.len <= 10 ? previewData.len + " rows" : "10 / " + previewData.len + " rows"} )</h2>
            <div className="overflow-x-auto max-h-64 border rounded bg-white p-2">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-200">
                    {previewData.headers.map((header, index) => (
                      <th key={index} className="border px-3 py-1 text-left text-sm font-semibold">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewData.rows.map((row, rowIndex) => (
                    <tr key={rowIndex} className="border-b">
                      {row.map((cell, cellIndex) => (
                        <td key={cellIndex} className="border px-3 py-1 text-sm">
                          {cell || '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Upload Button (With Spacing) */}
        {uploadEnabled && userEmail && (
          <div className="mt-6">
            <button
              onClick={handleUpload}
              className="py-2 bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-600 inline-block px-8"
            >
              Upload File
            </button>
          </div>
        )}
      </div>

      <div className='flex gap-4 justify-between'>

        <div className="w-full p-6 bg-white rounded shadow my-8 basis-2/3">

          <div className='flex justify-between items-center'>
            <h1 className="text-2xl font-bold mb-6 text-gray-700">Create Prompt</h1>

            <label
              htmlFor="show-hide-prompt"
              className="py-2 text-gray rounded cursor-pointer hover:underline block w-fit px-8"
            >
              {promptHidden ? "Show" : "Hide"}
            </label>
            <button
              id="show-hide-prompt"
              onClick={() => setPromptHidden(!promptHidden)}
              className="hidden"
            />
          </div>

          <div style={{
            display: promptHidden ? "none" : "block"
          }}>



            {/* 1. Select tag type */}
            <label htmlFor="tagType" className="block text-gray-700 font-semibold mb-2">
              Select Tag Type
            </label>
            <div className="text-gray-500 italic mb-2">
              {/* Replace with any static or dynamic text */}
              If you are using Custom type, use Tag to describe what you want to identify, and description on how to identify it
            </div>
            <select
              id="tagType"
              className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
              onChange={(e) => setTagType(e.target.value)}
            >
              <option disabled selected value> Select a tag type </option>
              <option value="industry">Industry</option>
              <option value="customer">Customer</option>
              <option value="custom">Custom</option>
            </select>

            {/* 2. Enter tag */}
            <label htmlFor="tagName" className="block text-gray-700 font-semibold mb-2">
              Enter Tag
            </label>
            <input
              id="tagName"
              type="text"
              className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
              placeholder="Type your tag here..."
              onChange={(e) => setTagName(e.target.value)}
            />

            {/* 3. Enter description */}
            <label
              htmlFor="tagDescription"
              className="block text-gray-700 font-semibold mb-2"
            >
              Enter Description
            </label>
            <div className="text-gray-500 italic mb-2">
              {/* Replace with any static or dynamic text */}
              Describe what exactly is to be included, what is not to be included. Be as descriptive as you want.
            </div>
            <textarea
              id="tagDescription"
              className="w-full border border-gray-300 min-h-20 max-h-20 rounded px-3 py-2 mb-4"
              placeholder="Brief description..."
              onChange={(e) => setDescription(e.target.value)}
            />



            {/* 5. Information on language (just a div with text) */}
            <label className="block text-gray-700 font-semibold mb-2">
              Information on Language
            </label>
            <input
              id="languageDescription"
              type="text"
              className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
              placeholder="Brief description..."
              onChange={(e) => setLangInstructions(e.target.value)}
            />

            <div className='flex justify-between items-center'>
              <button
                type="button"
                onClick={submitPrompt}
                className="py-2 bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-600 block w-fit px-8"
              >
                Submit
              </button>

              <button
                type="button"
                onClick={handlePromptCreation}
                className="py-2 bg-gray-500 text-white rounded cursor-pointer hover:bg-gray-600 block w-fit px-8"
              >
                Get suggestions
              </button>
            </div>
            <input
              id="tagName"
              type="text"
              className="w-full border border-gray-300 rounded px-3 py-2 mt-4"
              placeholder="Enter identifier here"
              onChange={(e) => setTagIdentifier(e.target.value)}
            />

          </div>
        </div>





        <div className="w-full p-6 bg-white rounded shadow my-8 basis-1/3 flex-col">
          <h1 className="text-2xl font-bold mb-6 text-gray-700">Suggestions</h1>

          <div style={{
            display: promptHidden ? "none" : "block"
          }}>

            <textarea className="text-gray-500 mb-2 w-full max-h-65 h-full border border-gray-300 p-4"
              value={promptText || "Your prompt will appear..."}
              onChange={(e) => setPromptText(e.target.value)}
            />

            <div className="text-gray-500 italic mb-2">
              <ul>
                {promptChanges
                  ? promptChanges.map((prompt, index) => (
                    prompt ? <li className='mb-2' key={index}>{prompt}</li> : null
                  ))
                  : <li>Suggested changs will appear here</li>}
              </ul>


            </div>

          </div>
        </div>

      </div>


      <div className="w-full p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4 text-gray-700">Start Project</h1>

      <label className="block text-gray-700 font-semibold mb-2">
        Select a File
        </label>
      <select
        id="fileDropdown"
        className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
        value={selectedFile}
        onChange={(e) => {
          const newFileValue = e.target.value
          handlePreview(newFileValue);
        }}
        onClick = {fetchFiles}
      >
        <option value="">-- Select a File --</option>
        {shownFiles.map((file) => (
          <option key={file.id} value={file.id}>
            {`${file.original_file_name} • ${file.upload_timestamp} • ${file.num_rows} companies`}
          </option>
        ))}
      </select>

              {/* Preview Table */}
        {selectedFilePreview && (
          <div className="m-6">
            <h2 className="text-lg font-semibold mb-2">Preview ( {selectedFilePreview.len <= 10 ? selectedFilePreview.len + " rows" : "10 / " + selectedFilePreview.len + " rows"} )</h2>
            <div className="overflow-x-auto max-h-64 border rounded bg-white p-2">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-200">
                    {selectedFilePreview.headers.map((header, index) => (
                      <th key={index} className="border px-3 py-1 text-left text-sm font-semibold">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {selectedFilePreview.rows.map((row, rowIndex) => (
                    <tr key={rowIndex} className="border-b">
                      {row.map((cell, cellIndex) => (
                        <td key={cellIndex} className="border px-3 py-1 text-sm">
                          {cell || '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}


      <label className="block text-gray-700 font-semibold mb-2">
        Select Prompts
        </label>
      <select
        multiple
        id="promptDropdown"
        className="w-full h-64 border border-gray-300 rounded px-3 py-2 mb-4"
        value={selectedPrompts}
        onChange={handlePrompt}
      >
        <option value="">-- Select Prompts --</option>
        {shownPrompts.map((prompt) => (
          <option key={prompt.id} value={prompt.id}>
            {`${prompt.tag_identifier} • ${prompt.tag_type} • ${prompt.tag_name} • ${prompt.tag_desc}`}
          </option>
        ))}
      </select>

      <div className='w-full border border-gray-300 rounded px-3 py-2 mb-4'>
        {
          shownPrompts.filter(prompt => selectedPrompts.includes(prompt.id)).map((prompt) => (
          <div className="border border-gray-300 rounded-lg p-4 shadow-md bg-white w-full max-w-md my-4">
            <div className='flex gap-4'>
              <p className="text-sm text-black bg-gray-100 p-2 mx-4 rounded-lg">{prompt.tag_identifier}</p>
              <p className="text-sm text-white bg-blue-500 p-2 mx-4 rounded-lg">{prompt.tag_type}</p>
            </div>
            
            <h2 className="text-lg font-semibold text-black">{prompt.tag_name}</h2>
            <p className="text-sm text-black">{prompt.tag_desc}</p>
            
          </div>
          ))
        }

      </div >

      <button
          type="button"
          onClick={submitRequest}
          className="py-2 bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-600 block w-fit px-8"
        >
          Submit
      </button>

      </div>
    </div>
  );
}
