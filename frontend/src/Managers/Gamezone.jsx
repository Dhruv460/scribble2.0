import React, { useRef, useState } from "react";
import axios from "axios";


const Gamezone = () => {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penColor, setPenColor] = useState("white");

  const startDrawing = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.strokeStyle = penColor; // Ensure the pen color is updated dynamically
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const finishDrawing = () => {
    contextRef.current.closePath();
    setIsDrawing(false);
  };

  const draw = ({ nativeEvent }) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleColorChange = (e) => {
    const newColor = e.target.value;
    setPenColor(newColor);
  };



  const sendImage = async () => {

    const canvas = canvasRef.current;
    let base64Image = null;
    if (canvas) {
      base64Image = canvas.toDataURL("image/png")
      console.log("Canvas converted to image:", base64Image);
    } else {
      console.error("Canvas not found.");
      alert("Canvas not found.");
      return;
    }

    if (base64Image) {
      try {
        const response = await axios.post("http://127.0.0.1:5000/upload", {
          image: base64Image,
        });
    
        if (response.status === 200) {
          console.log("Image sent successfully:", response.data);
          alert("Image sent successfully!");
        } else {
          console.error("Failed to send image:", response.statusText);
          alert("Failed to send image.");
        }
      } catch (error) {
        console.error("Error while sending image:", error);
        alert("Error while sending image.");
      }
    } else {
      alert("No image to send. Please draw something and convert it to an image first.");
    }
  };

  React.useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth * 0.8; // Adjust the canvas size
    canvas.height = window.innerHeight * 0.6;
    const ctx = canvas.getContext("2d");

    ctx.lineCap = "round";
    ctx.strokeStyle = penColor; // Default color
    ctx.lineWidth = 5; // Default stroke size
    contextRef.current = ctx;
  }, []);

  return (
    <div className="min-h-screen bg-black">
      <div className="drawing-container" style={{ textAlign: "center" }}>
        <h1 className="text-white py-4 text-6xl">Scribble 2.0</h1>
        <canvas
          ref={canvasRef}
          style={{
            border: "2px solid white",
            display: "block",
            margin: "0 auto",
            cursor: "crosshair",
          }}
          onMouseDown={startDrawing}
          onMouseUp={finishDrawing}
          onMouseMove={draw}
          onMouseLeave={finishDrawing}
        />
        <div style={{ marginTop: "10px" }}>
          <label style={{ marginRight: "10px", color: "white" }}>
            Select Pen Color:
          </label>
          <input
            type="color"
            value={penColor}
            onChange={handleColorChange}
            style={{ cursor: "pointer" }}
          />
        </div>
        <button
          onClick={clearCanvas}
          style={{
            marginTop: "10px",
            padding: "10px 20px",
            fontSize: "16px",
            cursor: "pointer",
            color: "white",
          }}
        >
          Clear Canvas
        </button>
        
        <button
          onClick={sendImage}
          style={{
            marginTop: "10px",
            padding: "10px 20px",
            fontSize: "16px",
            cursor: "pointer",
            color: "white",
          }}
        >
          Send Image
        </button>
      </div>
    </div>
  );
};

export default Gamezone;
