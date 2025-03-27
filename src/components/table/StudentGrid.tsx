import { useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import styled from "styled-components";
import { Add as AddIcon, DeleteOutlined as DeleteIcon, Save as SaveIcon } from "@mui/icons-material";
import { getYearRange } from "@src/utils/year";
import { IStudent } from "@src/interface";
import { DataGrid } from "@mui/x-data-grid";

const StudentGrid = () => {
  const years = getYearRange();
  const [selectedYear, setSelectedYear] = useState<string>(years[0].toString);

  return (
    <Container>
      <HeaderGrid>
        <StyledSelect value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </StyledSelect>

        <ToolbarBox>
          <UploaderBox>
            <Typography variant="h6" sx={{ color: "#333", fontSize: "1rem", fontWeight: 500, whiteSpace: "nowrap" }}>
              등록 업로더
            </Typography>
            <StyledInput type="file" accept=".csv" />
            <StyledButton variant="contained" color="primary">
              업로드
            </StyledButton>
          </UploaderBox>
          <StyledButton startIcon={<AddIcon />} variant="outlined">
            추가
          </StyledButton>
          <StyledButton startIcon={<DeleteIcon />} variant="outlined" color="error">
            삭제
          </StyledButton>
          <StyledButton startIcon={<SaveIcon />} variant="outlined">
            저장
          </StyledButton>
        </ToolbarBox>
      </HeaderGrid>

      <GridWrapper>
        <DataGrid
          checkboxSelection
          rows={rows}
          columns={columns}
          onRowSelectionModelChange={setSelectedRows}
          processRowUpdate={processRowUpdate}
          // getCellClassName={getCellClassName}
          sx={{
            "& .deleteCell": { color: "red", textDecoration: "line-through" },
            "& .updateCell": { color: "blue" },
          }}
          // slots={{ toolbar: EditToolbar }}
        />
      </GridWrapper>
    </Container>
  );
};

export default StudentGrid;

const Container = styled(Box)({
  height: "100%",
  width: "100%",
  overflow: "hidden",
});

const HeaderGrid = styled(Box)({
  display: "grid",
  gridTemplateColumns: "auto 1fr",
  gap: 16,
  marginBottom: 16,
  alignItems: "center",
});

const StyledSelect = styled("select")({
  minWidth: 96,
  fontSize: "0.85rem",
  padding: "0.3rem",
});

const ToolbarBox = styled(Box)({
  display: "flex",
  gap: 8,
  alignItems: "center",
  justifyContent: "flex-end",
  boxSizing: "border-box",
  padding: "0.8rem",
  borderRadius: "12px",
  backgroundColor: "#fff",
  width: "100%",
  overflow: "hidden",
  flexWrap: "wrap",
});

const UploaderBox = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 16,
});

const StyledInput = styled("input")({
  fontSize: "0.85rem",
  borderRadius: "4px",
  border: "1px solid #ccc",
  padding: "0.3rem 0.5rem",
  width: 180,
});

const StyledButton = styled(Button)({
  fontSize: "0.85rem",
  padding: "0.4rem 0.7rem",
});

const GridWrapper = styled(Box)({
  height: "calc(100% - 6rem)",
  overflow: "auto",
});
