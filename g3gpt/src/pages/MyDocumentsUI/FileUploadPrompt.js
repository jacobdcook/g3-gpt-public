// FileUploadPrompt.js
import React, { useState, useEffect, useRef } from 'react';
import './FileUploadPrompt.css';
import { backendURL } from '../../constants/baseURL';

function FileUploadPrompt({
  onClose,
  onSave,
  onFileChange,
  onRoleChange,
  selectedRoles,
  fileName,
  documentList
}) {

  const [uploadBtnDisabled, setUploadBtnDisabled] = useState(!fileName || selectedRoles.length === 0)
  const [showUploadedWarning, setShowUploadedWarning] = useState(false)
  const [uploadCheckErr, setUploadCheckErr] = useState(false)
  const [checkingFileValidity, setCheckingFileValidity] = useState(false)
  const [fileIsValid, setFileIsValid] = useState(false)

  let uploadedDocNames = new Set()

  useEffect(() => {
    documentList.forEach((doc) => {
      uploadedDocNames.add(doc.name)
    })
  }, [documentList])

  const handleFileSelect = async () => {
    setFileIsValid(false)

    if (!fileName) {
      setUploadBtnDisabled(true)
      return
    }

    if (uploadedDocNames.has(fileName)) {
      setShowUploadedWarning(true)
      setUploadBtnDisabled(true)
      return
    }

    setUploadBtnDisabled(selectedRoles.length === 0)
    setShowUploadedWarning(false)

    try {
      setCheckingFileValidity(true)
      const res = await fetch(`${backendURL}/api/check-file-uploaded/${fileName}`)
      setCheckingFileValidity(false)
      const uploaded = (await res.json())["exists"] === true
      if (uploaded) {
        uploadedDocNames.add(fileName)
      } else {
        setFileIsValid(true)
      }

      setUploadCheckErr(false)
  
      setShowUploadedWarning(uploaded)
      setUploadBtnDisabled(uploaded || !fileName || selectedRoles.length === 0)
    } catch (error) {
      setCheckingFileValidity(false)
      setUploadCheckErr(true)
      console.error('Error checking file validity:', error)  
    }
  }

  useEffect(() => {
    handleFileSelect()
  }, [fileName])

  useEffect(() => {
    setUploadBtnDisabled(!fileName || selectedRoles.length === 0)
  }, [selectedRoles])

  return (
    <div className="fileUploadPrompt">
      <div className="promptContainer">
        <h3>Upload Document</h3>
        
        <div className="selectFileContainer">
          <input
            id="fileUpload"
            type="file"
            accept=".pdf,.txt,.doc,.docx"
            onChange={onFileChange}
            style={{ display: 'none' }}
          />
          <label htmlFor="fileUpload" className="selectFileButton">
            Browse Files
          </label>
          <div className="fileNameContainer">
            <p className="fileName">{fileName || "No file selected"}</p>
            {checkingFileValidity && <div className="docSelectFeedback" name="fileSelectFeedback">Checking...</div>}
            {fileIsValid && <div className="docSelectFeedback valid" name="fileSelectFeedback">Valid file</div>}
          </div>
        </div>

        <h4>Assign Access Roles</h4>
        <div className="rolesCheckboxes">
          <label className="roleLabel">
            <input
              type="checkbox"
              name="selectAll"
              checked={selectedRoles.length === 3}
              onChange={onRoleChange}
              disabled={!fileIsValid}
            />
            <span>Select All</span>
          </label>
          <label className="roleLabel">
            <input
              type="checkbox"
              name="Admin"
              checked={selectedRoles.includes('Admin')}
              onChange={onRoleChange}
              disabled={!fileIsValid}
            />
            <span>Admin</span>
          </label>
          <label className="roleLabel">
            <input
              type="checkbox"
              name="HR"
              checked={selectedRoles.includes('HR')}
              onChange={onRoleChange}
              disabled={!fileIsValid}
            />
            <span>HR</span>
          </label>
          <label className="roleLabel">
            <input
              type="checkbox"
              name="Finance"
              checked={selectedRoles.includes('Finance')}
              onChange={onRoleChange}
              disabled={!fileIsValid}
            />
            <span>Finance</span>
          </label>
        </div>

        {showUploadedWarning && <p className="docPageWarning">A file named '{fileName}' has already been uploaded. Please rename the file or select another.</p>}

        {uploadCheckErr && <p className="docPageWarning">There was an error checking the validity of the file. Please try again later.</p>}

        <div className="promptButtons">
          <button className="cancelButton" onClick={onClose}>Cancel</button>
          <button 
            className={`saveButton${uploadBtnDisabled ? ' saveButtonDisabled' : ''}`}
            onClick={onSave}
            disabled={uploadBtnDisabled}
          >
            Upload
          </button>
        </div>
      </div>
    </div>
  );
}

export default FileUploadPrompt;