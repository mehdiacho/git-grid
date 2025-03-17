import Cube from "../components/Cube"
import React, { useState, useEffect, useRef } from "react"
import { Container, Form, Modal, Button, Tabs, Tab } from "react-bootstrap"
import classNames from "classnames"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCopy, faPaintBrush, faMousePointer, faFileImport, faFileExport, faCalendarAlt } from '@fortawesome/free-solid-svg-icons'

const Grid = () => {
  const boxClass = classNames(
    "grid",
    "p-3"
  )
  
  // Days of the week for the y-axis
  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  
  // Months for the x-axis
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  // Calculate weeks per month (approximate)
  const weeksPerMonth = [4, 4, 5, 4, 4, 5, 4, 4, 5, 4, 5, 4]; // Adjusted to total 52 weeks

  // State to track cube levels
  const [cubeLevels, setCubeLevels] = useState(
    Array(7).fill().map(() => Array(53).fill(0))
  );
  
  // State to store generated commit commands
  const [commitCommands, setCommitCommands] = useState([]);
  
  // State for toast notification
  const [showToast, setShowToast] = useState(false);
  
  // Add state to track the currently selected level
  const [selectedLevel, setSelectedLevel] = useState(1);
  
  // Add keyboard event listener for number keys
  useEffect(() => {
    const handleKeyDown = (event) => {
      const key = event.key;
      // Check if the key is a number between 0-4
      if (/^[0-4]$/.test(key)) {
        if(!numericMode){
          setSelectedLevel(parseInt(key));
        }
        
      }
    };
    
    // Add event listener
    window.addEventListener('keydown', handleKeyDown);
    
    // Clean up event listener on component unmount
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
  
  // Add state to track display mode
  const [numericMode, setNumericMode] = useState(false);
  
  // Handle cube click - now applies the selected level
  const handleCubeClick = (rowIndex, colIndex) => {
    const newLevels = [...cubeLevels];
    newLevels[rowIndex][colIndex] = selectedLevel;
    setCubeLevels(newLevels);
  };
  
  // Handle legend cube click - sets the selected level
  const handleLegendClick = (level) => {
    setSelectedLevel(level);
  };
  
  // Generate commit messages based on selected cubes
  const generateCommitMessages = () => {
    const commitMessages = [];
    
    // Loop through the grid
    for (let i = 0; i < cubeLevels.length; i++) {
      for (let j = 0; j < cubeLevels[i].length; j++) {
        // Only generate commits for cubes with level > 0
        const level = cubeLevels[i][j];
        if (level > 0) {
          // Calculate day of year
          const dayOfYear = ((i+1) + (7 * j));
          
          // Create date object for the specific day using selectedYear
          const date = new Date(selectedYear, 0, dayOfYear);
          
          // Format date for Git commit
          const formattedDate = date.toISOString().replace('T', ' ').replace(/\.\d+Z$/, ' +0000');
          
          // Generate commit message based on level
          let commitMessage = "Update documentation";
          switch(level) {
            case 1:
              commitMessage = "Fix minor bug";
              break;
            case 2:
              commitMessage = "Add new feature";
              break;
            case 3:
              commitMessage = "Refactor code structure";
              break;
            case 4:
              commitMessage = "Major performance improvements";
              break;
            default:
              commitMessage = "Update documentation";
          }
          
          // Create Git commit command with specified date
          const commitCommand = `git commit --allow-empty -m "${commitMessage}" --date="${formattedDate}"`;
          
          // Add to list of commit messages
          commitMessages.push(commitCommand);
        }
      }
    }
    
    setCommitCommands(commitMessages);
  };

  // Handle numeric input change
  const handleNumericInput = (rowIndex, colIndex, value) => {
    // Ensure value is between 0-4
    const level = Math.min(4, Math.max(0, parseInt(value) || 0));
    
    const newLevels = [...cubeLevels];
    newLevels[rowIndex][colIndex] = level;
    setCubeLevels(newLevels);
  };
  
  // Add state to track interaction mode (pointer or brush)
  const [brushMode, setBrushMode] = useState(false);
  
  // Add state to track if mouse is pressed
  const [isMouseDown, setIsMouseDown] = useState(false);
  
  // Handle mouse down on grid
  const handleMouseDown = () => {
    setIsMouseDown(true);
  };
  
  // Handle mouse up on grid
  const handleMouseUp = () => {
    setIsMouseDown(false);
  };
  
  // Handle cube hover - only applies level when in brush mode and mouse is down
  const handleCubeHover = (rowIndex, colIndex) => {
    if (brushMode && isMouseDown) {
      handleCubeClick(rowIndex, colIndex);
    }
  };
  
  // Add event listeners for mouse up even outside the grid
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsMouseDown(false);
    };
    
    window.addEventListener('mouseup', handleGlobalMouseUp);
    
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, []);

  // Add state for modal
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('import-array');
  const [arrayInput, setArrayInput] = useState('');
  const [commitsInput, setCommitsInput] = useState('');
  const [deleteCommitsInput, setDeleteCommitsInput] = useState('');
  const [exportedArray, setExportedArray] = useState('');
  const [deleteCommands, setDeleteCommands] = useState([]);
  
  // Function to export current grid as 2D array
  const exportGridAsArray = () => {
    const formattedArray = JSON.stringify(cubeLevels, null, 2);
    setExportedArray(formattedArray);
    setActiveTab('export-array');
    setShowModal(true);
  };
  
  // Function to import 2D array to grid
  const importArrayToGrid = () => {
    try {
      const parsedArray = JSON.parse(arrayInput);
      
      // Validate array structure
      if (Array.isArray(parsedArray) && 
          parsedArray.length === 7 && 
          parsedArray.every(row => Array.isArray(row) && row.length >= 52)) {
        
        // Validate values (0-4)
        if (parsedArray.every(row => row.every(cell => Number.isInteger(cell) && cell >= 0 && cell <= 4))) {
          setCubeLevels(parsedArray);
          setShowModal(false);
          return true;
        }
      }
      
      alert('Invalid array format. Please provide a 7×52 array with values 0-4.');
      return false;
    } catch (error) {
      alert('Error parsing array: ' + error.message);
      return false;
    }
  };
  
  // Function to import commits and update grid
  const importCommitsToGrid = () => {
    try {
      // Reset grid first
      const newLevels = Array(7).fill().map(() => Array(52).fill(0));
      
      // Parse commit commands
      const commitLines = commitsInput.split('\n').filter(line => line.trim());
      
      commitLines.forEach(line => {
        // Extract date and message from commit command
        const dateMatch = line.match(/--date="([^"]+)"/);
        const messageMatch = line.match(/-m "([^"]+)"/);
        
        if (dateMatch && messageMatch) {
          const dateStr = dateMatch[1];
          const message = messageMatch[1];
          
          // Parse date
          const date = new Date(dateStr);
          const startOfYear = new Date(date.getFullYear(), 0, 1);
          const dayOfYear = Math.floor((date - startOfYear) / (24 * 60 * 60 * 1000)) + 1;
          
          // Calculate grid position
          const j = Math.floor((dayOfYear - 1) / 7);
          const i = (dayOfYear - 1) % 7;
          
          // Determine level based on commit message
          let level = 1;
          if (message.includes("Major performance improvements")) level = 4;
          else if (message.includes("Refactor code structure")) level = 3;
          else if (message.includes("Add new feature")) level = 2;
          else if (message.includes("Fix minor bug")) level = 1;
          
          // Update grid if within bounds
          if (i >= 0 && i < 7 && j >= 0 && j < 52) {
            newLevels[i][j] = level;
          }
        }
      });
      
      setCubeLevels(newLevels);
      setShowModal(false);
      return true;
    } catch (error) {
      alert('Error parsing commits: ' + error.message);
      return false;
    }
  };
  
  // Function to generate delete commands for commits
  const generateDeleteCommands = () => {
    try {
      const commitLines = deleteCommitsInput.split('\n').filter(line => line.trim());
      const commands = [];
      
      // For each commit, generate the command to delete it
      commitLines.forEach((line, index) => {
        // We need to find the commit hash, which isn't in the original command
        // So we'll generate a placeholder and explain what to do
        commands.push(`# For commit: ${line}`);
        commands.push(`# 1. Find the commit hash using: git log --pretty=format:"%h %s %ad" --date=short`);
        commands.push(`# 2. Then run: git rebase -i <commit-hash>~1`);
        commands.push(`# 3. In the editor, change 'pick' to 'drop' for that commit`);
        commands.push(`# 4. Save and close the editor to complete the rebase`);
        commands.push(`# 5. Force push with: git push origin <branch-name> --force`);
        commands.push(``);
      });
      
      if (commands.length > 0) {
        setDeleteCommands(commands);
        setActiveTab('delete-commits');
        setShowModal(true);
      }
      
      return true;
    } catch (error) {
      alert('Error generating delete commands: ' + error.message);
      return false;
    }
  };

  // Add state for selected year
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  // Add state for toast messages
  const [toastMessage, setToastMessage] = useState("");
  
  // Function to show toast with a message
  const showToastWithMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };
  
  return(
    <Container fluid className={boxClass}>
      <div 
        className="contribution-grid-wrapper" 
        style={{ overflowX: 'auto' }}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
      >
        <div className="contribution-grid" style={{ minWidth: '1200px' }}>
          {/* Mode toggle switch and year selector */}
          <div className="d-flex justify-content-between mb-3 align-items-center">
            <div className="d-flex align-items-center">
              <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
              <Form.Select 
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                style={{ width: 'auto' }}
              >
                {[...Array(10)].map((_, i) => {
                  const year = new Date().getFullYear() - 5 + i;
                  return (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  );
                })}
              </Form.Select>
            </div>
            
            <Form>
              <Form.Check 
                type="switch"
                id="display-mode-switch"
                label={numericMode ? "Numeric Mode" : "Visual Mode"}
                checked={numericMode}
                onChange={() => setNumericMode(!numericMode)}
                title={numericMode ? 
                  "Numeric Mode: Enter numbers 0-4 to set contribution levels" : 
                  "Visual Mode: Click on cubes to set contribution levels"
                }
              />
            </Form>
          </div>
          
          {/* Month headers */}
          <div className="d-flex">
            <div className="day-label" style={{ width: '30px', flexShrink: 0 }}></div>
            
            {months.map((month, i) => {
              const width = weeksPerMonth[i] * 19; // 19px per cube (15px + 4px margin)
              return (
                <div key={`month-${i}`} className="month-label" style={{ width: `${width}px`, flexShrink: 0 }}>
                  {month}
                </div>
              );
            })}
          </div>
          
          {/* Days and contribution grid */}
          {daysOfWeek.map((day, i) => (
            <div key={`day-${i}`} className="d-flex align-items-center">
              <div className="day-label" style={{ width: '30px', flexShrink: 0 }}>
                {day}
              </div>
              <div className="d-flex">
                {[...Array(53)].map((_, j) => {
                  const isHidden = Array(7).fill().map((_, i) => i + 366).includes(((j+1) + (53 * i)));
                  
                  return (
                    <div 
                      key={`cube-${i}-${j}`} 
                      style={{ flexShrink: 0 }} 
                      hidden={isHidden}
                      onMouseEnter={() => handleCubeHover(i, j)}
                    >
                      {numericMode ? (
                        <div 
                          className={`cube level-${cubeLevels[i][j]}`} 
                          style={{ 
                            width: '15px',
                            height: '15px',
                            textAlign: 'center',
                            padding: '0',
                            border: 'none',
                            color: cubeLevels[i][j] >= 0 ? '#fff' : '#000',
                            fontSize: '10px',
                          }}
                          onClick={() => {
                            const newLevel = (cubeLevels[i][j] + 1) % 5;
                            handleNumericInput(i, j, newLevel);
                          }}
                        >
                          {(cubeLevels[i][j])}
                        </div>
                      ) : (
                        <Cube 
                          level={cubeLevels[i][j]} 
                          onClick={() => handleCubeClick(i, j)}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          
          {/* Legend at the bottom */}
          <div className="d-flex mt-4 align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <div className="legend-text">Less</div>
              <div className="d-flex mx-2">
                {[...Array(5)].map((_, i) => (
                  <div 
                    key={`legend-${i}`} 
                    className="mx-1" 
                    style={{ 
                      flexShrink: 0,
                      cursor: 'pointer',
                      border: selectedLevel === i ? '2px solid #fff' : 'none',
                      borderRadius: '3px',
                      padding: selectedLevel === i ? '1px' : '3px'
                    }}
                    onClick={() => handleLegendClick(i)}
                    title={`Level ${i} (Press ${i} key)`}
                  >
                    <Cube level={i} />
                  </div>
                ))}
              </div>
              <div className="legend-text">More</div>
              
              {/* Tool selection */}
              <div className="d-flex ms-4 align-items-center">
                <div className="legend-text me-2">Tools:</div>
                <div className="btn-group">
                  <button 
                    className={`btn btn-sm ${!brushMode ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setBrushMode(false)}
                    title="Pointer: Click individual cubes"
                  >
                    <FontAwesomeIcon icon={faMousePointer} />
                  </button>
                  <button 
                    className={`btn btn-sm ${brushMode ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setBrushMode(true)}
                    title="Brush: Click and drag to paint multiple cubes"
                  >
                    <FontAwesomeIcon icon={faPaintBrush} />
                  </button>
                  
                  {/* Add import/export buttons */}
                  <button 
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => {
                      setActiveTab('import-array');
                      setShowModal(true);
                    }}
                    title="Import grid data"
                  >
                    <FontAwesomeIcon icon={faFileImport} />
                  </button>
                  
                  <button 
                    className="btn btn-sm btn-outline-primary"
                    onClick={exportGridAsArray}
                    title="Export grid as array"
                  >
                    <FontAwesomeIcon icon={faFileExport} />
                  </button>
                </div>
              </div>
            </div>
            
            <button 
              className="btn btn-success rounded rounded-pill px-4 py-2" 
              style={{ marginLeft: 'auto' }}
              onClick={generateCommitMessages}
            >
              Generate
            </button>
          </div>
          
          {/* Display generated commit commands */}
          {commitCommands.length > 0 && (
            <div className="mt-4 p-3 bg-dark text-light position-relative" style={{ borderRadius: '6px', maxHeight: '300px', overflowY: 'auto' }}>
              <h5>Generated Git Commands:</h5>
              <div className="position-absolute" style={{ top: '10px', right: '10px' }}>
                {showToast && (
                  <div 
                    className="toast show bg-success text-white" 
                    style={{ 
                      position: 'absolute', 
                      right: '40px', 
                      top: '0px',
                      zIndex: 1050,
                      minWidth: '200px'
                    }}
                  >
                    <div className="toast-body py-2 px-3">
                      {toastMessage || "Copied to clipboard!"}
                    </div>
                  </div>
                )}
                <button 
                  className="btn btn-sm btn-outline-secondary " 
                  onClick={() => {
                    navigator.clipboard.writeText(commitCommands.join('\n'))
                      .then(() => {
                        showToastWithMessage("Commits copied to clipboard!");
                      })
                      .catch(err => console.error('Failed to copy: ', err));
                  }}
                  title="Copy to clipboard"
                >
                  <FontAwesomeIcon icon={faCopy} />
                </button>
              </div>
              <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                {commitCommands.map((cmd, index) => (
                  <div key={index} className="mb-2">
                    {cmd}
                  </div>
                ))}
              </pre>
            </div>
          )}
        </div>
      </div>
      
      {/* Import/Export Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Import/Export Grid Data</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
            className="mb-3"
          >
            <Tab eventKey="import-array" title="Import Array">
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Paste your 2D array (7×52 with values 0-4)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={10}
                    value={arrayInput}
                    onChange={(e) => setArrayInput(e.target.value)}
                    placeholder="Paste your 2D array here in JSON format..."
                  />
                </Form.Group>
                <Button variant="primary" onClick={importArrayToGrid}>
                  Import Array
                </Button>
              </Form>
            </Tab>
            
            <Tab eventKey="export-array" title="Export Array">
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Current grid as 2D array</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={10}
                    value={exportedArray}
                    readOnly
                  />
                </Form.Group>
                <Button 
                  variant="primary" 
                  onClick={() => {
                    navigator.clipboard.writeText(exportedArray)
                      .then(() => {
                        showToastWithMessage("Array copied to clipboard!");
                        setShowModal(false);
                      })
                      .catch(err => console.error('Failed to copy: ', err));
                  }}
                >
                  Copy to Clipboard
                </Button>
              </Form>
            </Tab>
            
            <Tab eventKey="import-commits" title="Import Commits">
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Paste your commit commands</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={10}
                    value={commitsInput}
                    onChange={(e) => setCommitsInput(e.target.value)}
                    placeholder="Paste your git commit commands here..."
                  />
                </Form.Group>
                <Button variant="primary" onClick={importCommitsToGrid}>
                  Import Commits
                </Button>
              </Form>
            </Tab>
            
            <Tab eventKey="delete-commits" title="Delete Commits">
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Paste commits to delete</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={5}
                    value={deleteCommitsInput}
                    onChange={(e) => setDeleteCommitsInput(e.target.value)}
                    placeholder="Paste the commit commands you want to delete..."
                  />
                </Form.Group>
                <Button variant="primary" onClick={generateDeleteCommands}>
                  Generate Delete Commands
                </Button>
                
                {deleteCommands.length > 0 && (
                  <div className="mt-3">
                    <h5>Commands to delete commits:</h5>
                    <pre className="bg-dark text-light p-3" style={{ borderRadius: '6px' }}>
                      {deleteCommands.join('\n')}
                    </pre>
                    <Button 
                      variant="primary" 
                      onClick={() => {
                        navigator.clipboard.writeText(deleteCommands.join('\n'))
                          .then(() => {
                            showToastWithMessage("Delete commands copied to clipboard!");
                          })
                          .catch(err => console.error('Failed to copy: ', err));
                      }}
                    >
                      Copy to Clipboard
                    </Button>
                  </div>
                )}
              </Form>
            </Tab>
          </Tabs>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Global Toast Notification */}
      {showToast && (
        <div 
          className="toast show bg-success text-white" 
          style={{ 
            position: 'fixed', 
            bottom: '20px', 
            right: '20px',
            zIndex: 1050,
            minWidth: '200px'
          }}
        >
          <div className="toast-body py-2 px-3">
            {toastMessage || "Operation successful!"}
          </div>
        </div>
      )}
    </Container>
  )
}

export default Grid