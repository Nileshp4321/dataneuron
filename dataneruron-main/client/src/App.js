import React, { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';

const MIN_WIDTH_PERCENTAGE = 10;

const App = () => {
  const [sizes, setSizes] = useState([
    { size: 33.33, content: "This is component 1" },
    { size: 33.33, content: "This is component 2" },
    { size: 33.33, content: "This is component 3" }
  ]);

  const [addCount, setAddCount] = useState(0);
  const [updateCount, setUpdateCount] = useState(0);

  useEffect(() => {
    fetchCounts();
  }, []);

  const fetchCounts = async () => {
    try {
      const response = await axios.get('/api/components/count');
      setAddCount(response.data.addCount);
      setUpdateCount(response.data.updateCount);
    } catch (error) {
      console.error('Error fetching counts:', error);
    }
  };

  const handleResize = (index, newSize) => {
    const newSizes = sizes.map((item, i) => (i === index ? { ...item, size: newSize } : item));
    setSizes(newSizes);
  };

  const handleComponentDrop = (dragIndex, dropIndex) => {
    if (dragIndex !== dropIndex) {
      const draggedItem = sizes[dragIndex];
      const newSizes = sizes.filter((_, i) => i !== dragIndex);
      newSizes.splice(dropIndex, 0, draggedItem);
      setSizes(newSizes);
    }
  };

  const handleAdd = async () => {
    try {
      // Clear existing data
      setSizes([]);
      // Increment count of add requests
      await axios.post('/api/components/addCount');
      // Fetch new data
      fetchComponentData();
    } catch (error) {
      console.error('Error adding component:', error);
    }
  };

  const handleUpdate = async () => {
    try {
      // Increment count of update requests
      await axios.post('/api/components/updateCount');
      // Fetch new data
      fetchComponentData();
    } catch (error) {
      console.error('Error updating component:', error);
    }
  };

  const fetchComponentData = async () => {
    try {
      // Fetch component data from the server
      const response = await axios.get('/api/components');
      setSizes(response.data);
    } catch (error) {
      console.error('Error fetching component data:', error);
    }
  };

  return (
    <div className="container">
      {sizes.map((item, index) => (
        <ResizableComponent
          key={index}
          index={index}
          size={item.size}
          content={item.content}
          handleResize={handleResize}
          handleComponentDrop={handleComponentDrop}
        />
      ))}
      <div className="count-container">
        <button onClick={handleAdd}>Add (Count: {addCount})</button>
        <button onClick={handleUpdate}>Update (Count: {updateCount})</button>
      </div>
    </div>
  );
};

const ResizableComponent = ({ index, size, content, handleResize, handleComponentDrop }) => {
  const [dragging, setDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(0);

  const onMouseDown = (e) => {
    setDragging(true);
    setStartX(e.clientX);
    setStartWidth(size);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const onMouseMove = (e) => {
    if (dragging) {
      const offsetX = e.clientX - startX;
      let newSize = startWidth + (offsetX / window.innerWidth) * 100;
      newSize = Math.max(MIN_WIDTH_PERCENTAGE, newSize);
      handleResize(index, newSize);
    }
  };

  const onMouseUp = () => {
    setDragging(false);
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  };

  const handleDragStart = (e) => {
    e.dataTransfer.setData('index', index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData('index'));
    handleComponentDrop(dragIndex, index);
  };

  return (
    <div
      className="resizable-component"
      style={{ flexBasis: `${size}%` }}
      onMouseDown={onMouseDown}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      draggable
    >
      <h2>{content}</h2>
      <p>This is a resizable component</p>
      <div className="resize-handle" onMouseDown={onMouseDown}></div>
    </div>
  );
};

export default App;
