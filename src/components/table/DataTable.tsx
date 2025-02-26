import { DataGrid, GridRowModel } from "@mui/x-data-grid";

interface AdminTableProps {
  rows: any[];
  onRowUpdate: (newRow: GridRowModel) => void;
  onAvatarChange: (event: React.ChangeEvent<HTMLInputElement>, rowId: number) => void;
}

const DataTable: React.FC<AdminTableProps> = ({ rows, onRowUpdate, onAvatarChange }) => {
  return (
    <DataGrid
      rows={rows}
      columns={[
        { field: "id", headerName: "ID", width: 90, align: "center" },
        {
          field: "avatar",
          headerName: "Avatar",
          width: 100,
          align: "center",
          renderCell: (params) => (
            <div>
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                id={`avatar-upload-${params.row.id}`}
                onChange={(e) => onAvatarChange(e, params.row.id)}
              />
              <label htmlFor={`avatar-upload-${params.row.id}`}>
                <img
                  src={params.value}
                  alt="avatar"
                  style={{
                    width: "3rem",
                    height: "3rem",
                    borderRadius: "50%",
                    cursor: "pointer",
                  }}
                />
              </label>
            </div>
          ),
        },
        { field: "firstName", headerName: "First name", width: 150, editable: true, align: "center" },
        { field: "lastName", headerName: "Last name", width: 150, editable: true, align: "center" },
        { field: "age", headerName: "Age", type: "number", width: 110, editable: true, align: "center" },
        {
          field: "fullName",
          headerName: "Full name",
          sortable: false,
          width: 160,
          align: "center",
          valueGetter: (value, row) => `${row.firstName || ""} ${row.lastName || ""}`,
        },
      ]}
      processRowUpdate={onRowUpdate}
      initialState={{
        pagination: {
          paginationModel: { pageSize: 10 },
        },
      }}
      pageSizeOptions={[2]}
      checkboxSelection
      disableRowSelectionOnClick
    />
  );
};

export default DataTable;
