import { useState } from "react";
import GridLayout from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import styled from "styled-components"; // styled-components import

const DisplayMap = () => {
  const [showGrid, setShowGrid] = useState(true);
  const [toggleAutoMove, setToggleAutoMove] = useState(true);
  const [toggleCompact, setToggleCompact] = useState(true);
  const [blocks, setBlocks] = useState([]);
  const [blockColor, setBlockColor] = useState("#ff6347");
  const [blockSize, setBlockSize] = useState(1);

  const gridSize = 100;

  const gridStyle = showGrid
    ? {
        backgroundImage: `linear-gradient(to right, #ccc 1px, transparent 1px), linear-gradient(to bottom, #ccc 1px, transparent 1px)`,
        backgroundSize: `${gridSize}px ${gridSize}px`,
      }
    : {};

  const addBlock = () => {
    const newBlock = {
      i: `block-${blocks.length + 1}`,
      x: blocks.length % 8,
      y: Math.floor(blocks.length / 8),
      w: blockSize,
      h: blockSize,
      color: blockColor,
    };
    setBlocks((prevBlocks) => [...prevBlocks, newBlock]);
  };

  const handleLayoutChange = (layout) => {
    const updatedBlocks = layout.map((item) => ({
      i: item.i,
      x: item.x,
      y: item.y,
      w: item.w,
      h: item.h,
      color: blocks.find((block) => block.i === item.i).color,
    }));
    setBlocks(updatedBlocks);
  };

  return (
    <Container>
      <Controls>
        <ToggleGridButton onClick={() => setShowGrid(!showGrid)}>{showGrid ? "격자 숨기기" : "격자 보이기"}</ToggleGridButton>
        <InputContainer>
          <ControlLabel>블록 색상:</ControlLabel>
          <ColorPicker type="color" value={blockColor} onChange={(e) => setBlockColor(e.target.value)} />
        </InputContainer>
        <InputContainer>
          <ControlLabel>블록 크기:</ControlLabel>
          <BlockSizeSelector value={blockSize} onChange={(e) => setBlockSize(Number(e.target.value))}>
            <option value={1}>작음 (1x1)</option>
            <option value={2}>중간 (2x2)</option>
            <option value={3}>큼 (3x3)</option>
          </BlockSizeSelector>
        </InputContainer>
        <AutoMoveButton onClick={() => setToggleAutoMove(!toggleAutoMove)}>블록 자동 밀기</AutoMoveButton>
        <AutoMoveButton onClick={() => setToggleCompact(!toggleCompact)}>블록 위로 정렬</AutoMoveButton>
        <AddBlockButton onClick={addBlock}>블록 추가</AddBlockButton>
      </Controls>

      <GridLayout
        className="layout"
        cols={8}
        rowHeight={gridSize}
        width={8 * gridSize}
        margin={[0, 0]}
        compactType={toggleCompact ? "vertical" : null}
        style={gridStyle}
        preventCollision={toggleAutoMove}
        onLayoutChange={handleLayoutChange}
      >
        {blocks.map((block) => (
          <div
            key={block.i}
            style={{
              backgroundColor: block.color,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontWeight: "bold",
              color: "#fff",
              width: "100%",
              height: "100%",
              border: "10px solid #FFF",
              boxSizing: "border-box",
            }}
          >
            {block.i}
          </div>
        ))}
      </GridLayout>
    </Container>
  );
};

export default DisplayMap;

// styled-components
const Container = styled.div`
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
  background-color: #fff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
`;

const Controls = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 20px;
`;

const ToggleGridButton = styled.button`
  padding: 10px 20px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 5px;

  font-size: 16px;
  transition: background-color 0.3s;
  &:hover {
    background-color: #218838;
  }
`;

const InputContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ControlLabel = styled.label`
  font-size: 16px;
  color: #333;
`;

const ColorPicker = styled.input`
  width: 40px;
  height: 30px;
  border: none;
`;

const BlockSizeSelector = styled.select`
  padding: 5px 10px;
  font-size: 16px;
`;

const AutoMoveButton = styled.button`
  padding: 10px 20px;
  background-color: #ffc107;
  color: white;
  border: none;
  border-radius: 5px;

  font-size: 16px;
  transition: background-color 0.3s;
  &:hover {
    background-color: #e0a800;
  }
`;

const AddBlockButton = styled.button`
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;

  font-size: 16px;
  transition: background-color 0.3s;
  &:hover {
    background-color: #0056b3;
  }
`;
