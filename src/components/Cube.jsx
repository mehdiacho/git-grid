import { Container, Row, Col } from "react-bootstrap"
import classNames from "classnames"
import { useState } from "react"

const Cube = ({ level = 0, onClick }) => {
  const [isActive, setIsActive] = useState(false);
  
  const boxClass = classNames(
    "cube",
    { "active": isActive },
    `level-${level}`
  )
  
  // This helps catch fast mouse movements
  const handleMouseEnter = () => {
    setIsActive(true);
  }
  
  const handleMouseLeave = () => {
    setIsActive(false);
  }
  
  return(
    <div 
      className={boxClass}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      title={`${level} contributions`}
      onClick={onClick}
    />
  )
}

export default Cube